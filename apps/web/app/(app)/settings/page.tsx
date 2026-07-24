"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ThemeToggle } from "@/components/shell/theme-toggle";
import { Switch } from "@/components/ui/switch";
import { authClient } from "@/lib/auth-client";

const TWO_FA_KEY = "taskflow-2fa-pref";

export default function SettingsPage() {
  const router = useRouter();
  const [twoFa, setTwoFa] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      setTwoFa(window.localStorage.getItem(TWO_FA_KEY) === "1");
    } catch {
      setTwoFa(false);
    }
  }, []);

  function onTwoFaChange(checked: boolean) {
    setTwoFa(checked);
    try {
      window.localStorage.setItem(TWO_FA_KEY, checked ? "1" : "0");
    } catch {
      // ignore
    }
  }

  async function handleLogout() {
    try {
      await authClient.signOut();
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-10">
      <h1 className="mb-6 text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
        Settings
      </h1>

      <div className="space-y-4">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Appearance</h2>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-foreground">Theme</p>
              <p className="text-xs text-muted-foreground">Light, dark, or follow system preference</p>
            </div>
            <ThemeToggle />
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Security</h2>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm text-foreground">Two-Factor Authentication</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Protect your account with an additional verification step.
              </p>
              {mounted && twoFa ? (
                <p className="mt-3 rounded-xl border border-border bg-foreground/3 px-3 py-2 text-xs text-muted-foreground">
                  Coming soon — full 2FA in a later phase. Your preference is saved in this browser only.
                </p>
              ) : null}
            </div>
            <Switch
              checked={mounted ? twoFa : false}
              onCheckedChange={onTwoFaChange}
              aria-label="Toggle two-factor authentication"
            />
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Account</h2>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-10 items-center rounded-xl border border-destructive/30 px-4 text-sm font-medium text-destructive transition-all hover:bg-destructive/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Sign out
          </button>
        </section>
      </div>
    </main>
  );
}
