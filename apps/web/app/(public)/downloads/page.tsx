import { existsSync } from "node:fs";
import { join } from "node:path";

import type { Metadata } from "next";
import { Monitor, Smartphone } from "lucide-react";
import Link from "next/link";

import { DownloadCard } from "@/components/downloads/download-card";
import { DOWNLOAD_ARTIFACTS, type DownloadArtifact } from "@/lib/downloads";

export const metadata: Metadata = {
  title: "Downloads · TaskFlow",
  description: "Download TaskFlow for Windows desktop and Android.",
};

function withAvailability(artifacts: DownloadArtifact[]) {
  return artifacts.map((artifact) => {
    const absolute = join(process.cwd(), "public", artifact.href.replace(/^\//, ""));
    return { ...artifact, available: existsSync(absolute) };
  });
}

export default function DownloadsPage() {
  const desktop = withAvailability(DOWNLOAD_ARTIFACTS.filter((a) => a.platform === "Windows"));
  const mobile = withAvailability(DOWNLOAD_ARTIFACTS.filter((a) => a.platform === "Android"));

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 15% -10%, color-mix(in oklab, var(--primary) 22%, transparent), transparent), radial-gradient(ellipse 50% 40% at 90% 10%, color-mix(in oklab, var(--chart-2, var(--primary)) 12%, transparent), transparent)",
        }}
        aria-hidden
      />

      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="text-sm font-bold tracking-wide text-foreground uppercase"
          style={{ fontFamily: "var(--font-display)" }}
        >
          TaskFlow
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">
            Web app
          </Link>
          <Link href="/login" className="text-muted-foreground transition-colors hover:text-foreground">
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition-colors hover:bg-primary/90"
          >
            Sign up
          </Link>
        </nav>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-20 pt-4">
        <p className="text-xs font-medium tracking-wide text-primary uppercase">Get the apps</p>
        <h1
          className="mt-2 max-w-2xl text-3xl font-bold tracking-tight md:text-4xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Download TaskFlow
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
          Install the desktop or mobile client, then sign in against the same TaskFlow cloud account you use in the
          browser. Builds point at the production web app on Vercel.
        </p>

        <section className="mt-12">
          <div className="mb-4 flex items-center gap-2">
            <Monitor className="h-5 w-5 text-primary" aria-hidden />
            <h2 className="text-lg font-semibold tracking-tight">Windows desktop</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {desktop.map((artifact) => (
              <DownloadCard key={artifact.id} artifact={artifact} />
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-4 flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" aria-hidden />
            <h2 className="text-lg font-semibold tracking-tight">Android mobile</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {mobile.map((artifact) => (
              <DownloadCard key={artifact.id} artifact={artifact} />
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            iOS App Store builds are out of scope for this demo. Use the web app or Expo Go during development.
          </p>
        </section>

        <section className="mt-12 rounded-2xl border border-border bg-card/50 p-5">
          <h2 className="text-sm font-semibold text-foreground">After installing</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Open the app and create an account or log in.</li>
            <li>Verify your email if prompted (same flow as the website).</li>
            <li>Create tasks — they sync with the web dashboard in realtime.</li>
          </ol>
          <p className="mt-4 text-sm text-muted-foreground">
            Prefer the browser?{" "}
            <Link href="/" className="font-medium text-primary underline-offset-4 hover:underline">
              Open the web app
            </Link>
            .
          </p>
        </section>
      </main>
    </div>
  );
}
