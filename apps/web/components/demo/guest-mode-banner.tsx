"use client";

import Link from "next/link";

export function GuestModeBanner() {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/25 bg-amber-500/10 px-4 py-2.5 md:px-6"
      role="status"
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">Demo Workspace</p>
        <p className="text-xs text-muted-foreground">
          Guest mode — your data is stored only in this browser and won&apos;t sync.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Link
          href="/login?next=/dashboard"
          className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:bg-foreground/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Log in
        </Link>
        <Link
          href="/signup?next=/dashboard"
          className="rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition-all hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Sign up to save
        </Link>
      </div>
    </div>
  );
}
