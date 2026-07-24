"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import {
  CheckSquare,
  LayoutDashboard,
  LogOut,
  Moon,
  Settings,
  Sun,
  UserRound,
} from "lucide-react";
import type { Task } from "@taskflow/types";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { authClient } from "@/lib/auth-client";
import type { AccountGateIntent } from "@/lib/demo/gates";
import { loadDemoTasks } from "@/lib/demo/store";

type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: "auth" | "demo";
  onRequireAccount?: (intent: AccountGateIntent) => void;
};

export function CommandPalette({
  open,
  onOpenChange,
  variant = "auth",
  onRequireAccount,
}: CommandPaletteProps) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const isDemo = variant === "demo";
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!open) return;
    if (isDemo) {
      setTasks(loadDemoTasks().slice(0, 8));
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/tasks?pageSize=8&sort=createdAt&order=desc");
        if (!res.ok) return;
        const data = (await res.json()) as { items?: Task[] };
        if (!cancelled) setTasks(data.items ?? []);
      } catch {
        if (!cancelled) setTasks([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, isDemo]);

  const run = useCallback(
    (fn: () => void) => {
      onOpenChange(false);
      fn();
    },
    [onOpenChange],
  );

  const go = useCallback(
    (href: string, gate?: AccountGateIntent) => {
      if (isDemo && gate) {
        run(() => onRequireAccount?.(gate));
        return;
      }
      run(() => router.push(href));
    },
    [isDemo, onRequireAccount, router, run],
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search tasks, pages, commands…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Pages">
          <CommandItem onSelect={() => go(isDemo ? "/" : "/dashboard")}>
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
            Dashboard
          </CommandItem>
          <CommandItem onSelect={() => go(isDemo ? "/" : "/tasks")}>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
            Tasks
          </CommandItem>
          <CommandItem onSelect={() => go("/profile", "profile")}>
            <UserRound className="h-4 w-4 text-muted-foreground" />
            Profile
          </CommandItem>
          <CommandItem onSelect={() => go("/settings", "settings")}>
            <Settings className="h-4 w-4 text-muted-foreground" />
            Settings
          </CommandItem>
        </CommandGroup>
        {tasks.length > 0 ? (
          <>
            <CommandSeparator />
            <CommandGroup heading="Tasks">
              {tasks.map((task) => (
                <CommandItem
                  key={task.id}
                  value={`${task.title} ${task.id}`}
                  onSelect={() => {
                    if (isDemo) {
                      run(() => document.getElementById("demo-task-search")?.focus());
                      return;
                    }
                    go(`/tasks/${task.id}`);
                  }}
                >
                  <CheckSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{task.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        ) : null}
        <CommandSeparator />
        <CommandGroup heading="Commands">
          <CommandItem
            onSelect={() =>
              run(() => setTheme(resolvedTheme === "dark" ? "light" : "dark"))
            }
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Moon className="h-4 w-4 text-muted-foreground" />
            )}
            Toggle theme
          </CommandItem>
          {!isDemo ? (
            <CommandItem
              onSelect={() =>
                run(() => {
                  void authClient
                    .signOut()
                    .catch(() => undefined)
                    .finally(() => {
                      router.push("/login");
                      router.refresh();
                    });
                })
              }
            >
              <LogOut className="h-4 w-4 text-muted-foreground" />
              Sign out
            </CommandItem>
          ) : null}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
