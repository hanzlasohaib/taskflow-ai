/**
 * Sync apps/web/.env → Vercel project env (production + preview).
 * Does not print secret values. Overrides app URLs for the target host.
 *
 * Usage:
 *   node scripts/sync-vercel-env.mjs --url https://taskflow-ai.vercel.app
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const webDir = join(root, "apps", "web");
const envPath = join(webDir, ".env");

const urlFlag = process.argv.indexOf("--url");
const prodUrl = (urlFlag >= 0 ? process.argv[urlFlag + 1] : "").replace(/\/$/, "");

if (!prodUrl || !prodUrl.startsWith("https://")) {
  console.error("Usage: node scripts/sync-vercel-env.mjs --url https://your-app.vercel.app");
  process.exit(1);
}

if (!existsSync(envPath)) {
  console.error(`Missing ${envPath}`);
  process.exit(1);
}

function parseEnv(text) {
  /** @type {Record<string, string>} */
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

const env = parseEnv(readFileSync(envPath, "utf8"));

// Production canonical URLs
env.NEXT_PUBLIC_APP_URL = prodUrl;
env.BETTER_AUTH_URL = prodUrl;

const required = [
  "DATABASE_URL",
  "DIRECT_URL",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "NEXT_PUBLIC_APP_URL",
];

const missing = required.filter((k) => !env[k]?.trim());
if (missing.length) {
  console.error(`Missing required keys in apps/web/.env: ${missing.join(", ")}`);
  process.exit(1);
}

const keys = Object.keys(env).filter((k) => env[k] !== undefined && env[k] !== "");
const targets = ["production", "preview"];

function runVercel(args, input) {
  const result = spawnSync("vercel", args, {
    cwd: webDir,
    input: input ?? undefined,
    encoding: "utf8",
    shell: true,
  });
  if (result.status !== 0) {
    const err = (result.stderr || result.stdout || "").trim();
    throw new Error(`vercel ${args.join(" ")} failed: ${err.slice(0, 400)}`);
  }
  return result.stdout;
}

function removeEnv(key, target) {
  spawnSync("vercel", ["env", "rm", key, target, "--yes"], {
    cwd: webDir,
    encoding: "utf8",
    shell: true,
  });
}

let synced = 0;
for (const key of keys) {
  const value = env[key];
  for (const target of targets) {
    removeEnv(key, target);
    try {
      runVercel(["env", "add", key, target], `${value}\n`);
      synced += 1;
      console.log(`✓ ${key} → ${target}`);
    } catch (e) {
      console.error(`✗ ${key} → ${target}: ${e.message}`);
      process.exit(1);
    }
  }
}

console.log(`Synced ${synced} env entries (${keys.length} keys × ${targets.length} targets).`);
console.log(`App URL set to ${prodUrl}`);
