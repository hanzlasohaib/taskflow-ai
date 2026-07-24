"use client";

import {
  BarChart2,
  Bell,
  Calendar,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Mic,
  Pencil,
  Settings,
  Sparkles,
  User,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { UserAvatar } from "@/components/shell/user-avatar";
import type { AccountGateIntent } from "@/lib/demo/gates";
import { cn } from "@/lib/utils";

type AppSidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
  userName: string;
  variant?: "auth" | "demo";
  onOpenAi?: () => void;
  onOpenVoice?: () => void;
  onRequireAccount?: (intent: AccountGateIntent) => void;
};

export function AppSidebar({
  collapsed,
  onToggle,
  userName,
  variant = "auth",
  onOpenAi,
  onOpenVoice,
  onRequireAccount,
}: AppSidebarProps) {
  const pathname = usePathname();
  const isDemo = variant === "demo";
  const homeHref = isDemo ? "/" : "/dashboard";

  const navItems: Array<{
    href: string;
    id: string;
    label: string;
    icon: typeof LayoutDashboard;
    soon?: boolean;
  }> = [
    { href: homeHref, id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    ...(isDemo
      ? []
      : [{ href: "/tasks", id: "tasks", label: "Tasks", icon: CheckSquare }]),
    { href: homeHref, id: "calendar", label: "Calendar", icon: Calendar, soon: true },
    { href: homeHref, id: "canvas", label: "Canvas", icon: Pencil, soon: true },
    { href: homeHref, id: "ai", label: "AI Assistant", icon: Sparkles },
    { href: homeHref, id: "voice", label: "Voice Notes", icon: Mic },
    { href: homeHref, id: "notifications", label: "Notifications", icon: Bell, soon: true },
    { href: homeHref, id: "analytics", label: "Analytics", icon: BarChart2, soon: true },
  ];

  return (
    <aside
      className={cn(
        "flex h-screen shrink-0 flex-col border-r border-border bg-sidebar transition-all duration-300 ease-out",
        collapsed ? "w-[60px]" : "w-[220px]",
      )}
      aria-label="Main navigation"
    >
      <div
        className={cn(
          "flex shrink-0 items-center gap-3 border-b border-border py-5",
          collapsed ? "justify-center px-0" : "px-4",
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/15">
          <Zap className="h-4 w-4 text-primary" aria-hidden />
        </div>
        {!collapsed && <span className="text-sm font-bold tracking-tight text-foreground">TaskFlow</span>}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {navItems.map(({ href, id, label, icon: Icon, soon }) => {
          const active =
            id === "dashboard"
              ? pathname === href
              : pathname === href || (href !== homeHref && pathname.startsWith(href));
          const isSpecial = id === "ai" || id === "voice";

          const className = cn(
            "relative flex w-full items-center rounded-xl transition-all duration-150",
            collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5",
            active
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
          );

          const content = (
            <>
              {active && (
                <div className="absolute top-1/2 left-0 h-4 w-0.5 -translate-y-1/2 rounded-r-full bg-primary" />
              )}
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {!collapsed && <span className="flex-1 text-left text-sm font-medium">{label}</span>}
              {!collapsed && soon && (
                <span className="rounded-full bg-foreground/5 px-1.5 text-[9px] font-medium text-muted-foreground">
                  Soon
                </span>
              )}
            </>
          );

          if (isSpecial) {
            return (
              <button
                key={id}
                type="button"
                title={collapsed ? label : undefined}
                aria-label={label}
                className={className}
                onClick={() => {
                  if (id === "ai") onOpenAi?.();
                  if (id === "voice") onOpenVoice?.();
                }}
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={id}
              href={href}
              title={collapsed ? label : undefined}
              aria-current={active ? "page" : undefined}
              className={className}
            >
              {content}
            </Link>
          );
        })}

        <div className="mt-1 space-y-0.5 border-t border-border pt-2">
          {(
            [
              { id: "settings" as const, href: "/settings", label: "Settings", icon: Settings, intent: "settings" as const },
              { id: "profile" as const, href: "/profile", label: "Profile", icon: User, intent: "profile" as const },
            ] as const
          ).map(({ href, label, icon: Icon, intent }) => {
            const active = pathname === href;
            const className = cn(
              "flex w-full items-center rounded-xl text-muted-foreground transition-all hover:bg-foreground/5 hover:text-foreground",
              collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5",
              active && "bg-primary/10 text-primary",
            );

            if (isDemo) {
              return (
                <button
                  key={href}
                  type="button"
                  title={collapsed ? label : undefined}
                  aria-label={label}
                  className={className}
                  onClick={() => onRequireAccount?.(intent)}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  {!collapsed && <span className="text-sm font-medium">{label}</span>}
                </button>
              );
            }

            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                aria-current={active ? "page" : undefined}
                className={className}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {!collapsed && <span className="text-sm font-medium">{label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {!collapsed && (
        <div className="shrink-0 space-y-1 border-t border-border px-3 py-3">
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 transition-all hover:bg-foreground/5"
            aria-label="Workspace switcher"
            onClick={() => {
              if (isDemo) onRequireAccount?.("workspace");
            }}
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/15">
              <span className="text-[9px] font-bold text-primary">TF</span>
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-xs font-medium text-foreground">
                {isDemo ? "Demo Workspace" : "TaskFlow HQ"}
              </p>
              <p className="text-[10px] text-muted-foreground">{isDemo ? "Local only" : "Pro Plan"}</p>
            </div>
            <ChevronDown className="h-3 w-3 text-muted-foreground" aria-hidden />
          </button>
          <div className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2">
            <UserAvatar name={userName} size="xs" />
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-xs font-medium text-foreground">
                {isDemo ? "Guest" : `${userName.split(" ")[0]}.`}
              </p>
              <p className="text-[10px] text-muted-foreground">{isDemo ? "Explorer" : "Admin"}</p>
            </div>
          </div>
        </div>
      )}

      <div className="shrink-0 px-2 pb-4">
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex w-full items-center justify-center rounded-xl py-2 text-muted-foreground transition-all hover:bg-foreground/5 hover:text-foreground"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
