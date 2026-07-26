/**
 * Copy release installers into apps/web/public/downloads for the /downloads page.
 *
 * Desktop (after `pnpm build:desktop`):
 *   apps/desktop/src-tauri/target/release/bundle/nsis/*.exe
 *   apps/desktop/src-tauri/target/release/bundle/msi/*.msi
 *
 * Mobile (after release APK build):
 *   apps/mobile/android/app/build/outputs/apk/release/*.apk
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "apps", "web", "public", "downloads");
mkdirSync(outDir, { recursive: true });

function latestMatch(dir, predicate) {
  if (!existsSync(dir)) return null;
  const files = readdirSync(dir)
    .filter(predicate)
    .map((name) => ({ name, path: join(dir, name), mtime: statSync(join(dir, name)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  return files[0] ?? null;
}

function copyAs(src, destName) {
  const dest = join(outDir, destName);
  copyFileSync(src, dest);
  const mb = (statSync(dest).size / (1024 * 1024)).toFixed(2);
  console.log(`✓ ${destName} (${mb} MB)`);
}

const desktopBundleRoots = [
  join(root, "apps", "desktop", "src-tauri", "target", "release", "bundle"),
  // Cursor/sandbox cargo target (when CARGO_TARGET_DIR is redirected)
  process.env.CARGO_TARGET_DIR
    ? join(process.env.CARGO_TARGET_DIR, "release", "bundle")
    : null,
  join(
    process.env.LOCALAPPDATA || "",
    "Temp",
    "cursor-sandbox-cache",
    "2e23581e13a44a233ef4a95ebbc7e7ce",
    "cargo-target",
    "release",
    "bundle",
  ),
].filter(Boolean);

function findInBundles(subdir, predicate) {
  for (const base of desktopBundleRoots) {
    const hit = latestMatch(join(base, subdir), predicate);
    if (hit) return hit;
  }
  return null;
}

const apkDir = join(root, "apps", "mobile", "android", "app", "build", "outputs", "apk", "release");

const nsis = findInBundles("nsis", (n) => n.endsWith("-setup.exe") || n.endsWith(".exe"));
const msi = findInBundles("msi", (n) => n.endsWith(".msi"));
const apk = latestMatch(apkDir, (n) => n.endsWith(".apk"));

let copied = 0;
if (nsis) {
  copyAs(nsis.path, nsis.name.includes("TaskFlow") ? nsis.name : "TaskFlow_0.8.0_x64-setup.exe");
  copied += 1;
} else {
  console.warn("! Desktop NSIS installer not found — run pnpm build:desktop first");
}
if (msi) {
  copyAs(msi.path, msi.name.includes("TaskFlow") ? msi.name : "TaskFlow_0.8.0_x64_en-US.msi");
  copied += 1;
} else {
  console.warn("! Desktop MSI not found — run pnpm build:desktop first");
}
if (apk) {
  copyAs(apk.path, "TaskFlow_0.7.0.apk");
  copied += 1;
} else {
  console.warn("! Android APK not found — build release APK under apps/mobile/android");
}

if (copied === 0) {
  console.error("No artifacts copied.");
  process.exit(1);
}
console.log(`Synced ${copied} file(s) → ${outDir}`);
