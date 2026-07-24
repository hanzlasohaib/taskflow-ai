"use client";

import { useRouter } from "next/navigation";

import { ThemeToggle } from "@/components/shell/theme-toggle";
import { authClient } from "@/lib/auth-client";

export default function SettingsPage() {
  const router = useRouter();

  async function handleLogout() {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
        Settings
      </h1>

      <div className="space-y-4">
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Appearance</h2>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-foreground">Theme</p>
              <p className="text-xs text-muted-foreground">Light, dark, or follow system preference</p>
            </div>
            <ThemeToggle />
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Account</h2>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive transition-all hover:bg-destructive/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Sign out
          </button>
        </section>
      </div>
    </main>
  );
}
