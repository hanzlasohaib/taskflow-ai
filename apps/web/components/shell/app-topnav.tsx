"use client";

import { Bell, ChevronDown, Search } from "lucide-react";

import { ThemeToggle } from "@/components/shell/theme-toggle";
import { UserAvatar } from "@/components/shell/user-avatar";
import type { AccountGateIntent } from "@/lib/demo/gates";

type AppTopNavProps = {
  userName: string;
  variant?: "auth" | "demo";
  onRequireAccount?: (intent: AccountGateIntent) => void;
};

export function AppTopNav({ userName, variant = "auth", onRequireAccount }: AppTopNavProps) {
  const isDemo = variant === "demo";

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-background/95 px-4 backdrop-blur-sm md:px-6">
      <div className="max-w-sm flex-1">
        <button
          type="button"
          className="flex w-full cursor-text items-center gap-2 rounded-xl border border-border bg-foreground/[0.04] px-3 py-2 transition-colors hover:border-foreground/12 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Search tasks, people, docs"
          onClick={() => {
            if (isDemo) {
              document.getElementById("demo-task-search")?.focus();
            }
          }}
        >
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
          <span className="flex-1 text-left text-sm text-muted-foreground">Search tasks, people, docs...</span>
          <div className="hidden gap-0.5 sm:flex" aria-hidden>
            <kbd className="rounded bg-foreground/8 px-1.5 py-0.5 font-mono text-[10px] leading-none text-muted-foreground">
              ⌘
            </kbd>
            <kbd className="rounded bg-foreground/8 px-1.5 py-0.5 font-mono text-[10px] leading-none text-muted-foreground">
              K
            </kbd>
          </div>
        </button>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {isDemo ? (
          <span className="hidden rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-[11px] font-medium text-amber-700 sm:inline dark:text-amber-300">
            Guest Mode
          </span>
        ) : (
          <div className="hidden items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/8 px-2.5 py-1.5 sm:flex">
            <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-emerald-500" aria-hidden />
            <span className="font-mono text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Live</span>
          </div>
        )}

        <button
          type="button"
          className="relative flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-foreground/5 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Notifications"
          onClick={() => {
            if (isDemo) onRequireAccount?.("realtime");
          }}
        >
          <Bell className="h-4 w-4" aria-hidden />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
        </button>

        <ThemeToggle />

        <button
          type="button"
          className="flex items-center gap-2 rounded-xl py-1.5 pr-3 pl-2 transition-all hover:bg-foreground/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Account menu"
          onClick={() => {
            if (isDemo) onRequireAccount?.("profile");
          }}
        >
          <UserAvatar name={userName} size="sm" />
          <span className="hidden text-sm font-medium text-foreground sm:inline">
            {isDemo ? "Guest" : userName.split(" ")[0]}
          </span>
          <ChevronDown className="hidden h-3 w-3 text-muted-foreground sm:block" aria-hidden />
        </button>
      </div>
    </header>
  );
}
