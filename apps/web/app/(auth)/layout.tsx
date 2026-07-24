import Link from "next/link";

import { ThemeToggle } from "@/components/shell/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, color-mix(in oklab, var(--primary) 18%, transparent), transparent)",
        }}
        aria-hidden
      />
      <header className="relative z-10 flex items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="text-sm font-bold tracking-wide text-foreground uppercase"
          style={{ fontFamily: "var(--font-display)" }}
        >
          TaskFlow
        </Link>
        <ThemeToggle />
      </header>
      <main className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6 pb-12">
        {children}
      </main>
    </div>
  );
}
