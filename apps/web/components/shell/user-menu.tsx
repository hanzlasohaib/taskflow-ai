"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { ChevronDown, LogOut, Moon, Settings, Sun, UserRound } from "lucide-react";

import { UserAvatar } from "@/components/shell/user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import type { AccountGateIntent } from "@/lib/demo/gates";

type UserMenuProps = {
  userName: string;
  userImage?: string | null;
  variant?: "auth" | "demo";
  onRequireAccount?: (intent: AccountGateIntent) => void;
};

export function UserMenu({
  userName,
  userImage,
  variant = "auth",
  onRequireAccount,
}: UserMenuProps) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const isDemo = variant === "demo";

  function goOrGate(href: string, intent: AccountGateIntent) {
    if (isDemo) {
      onRequireAccount?.(intent);
      return;
    }
    router.push(href);
  }

  async function signOut() {
    if (isDemo) {
      onRequireAccount?.("profile");
      return;
    }
    try {
      await authClient.signOut();
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl py-1.5 pr-3 pl-2 transition-all hover:bg-foreground/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Account menu"
        >
          <UserAvatar name={userName} image={userImage} size="sm" />
          <span className="hidden text-sm font-medium text-foreground sm:inline">
            {isDemo ? "Guest" : userName.split(" ")[0]}
          </span>
          <ChevronDown className="hidden h-3 w-3 text-muted-foreground sm:block" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{isDemo ? "Guest Mode" : userName}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => goOrGate("/profile", "profile")}>
          <UserRound className="h-4 w-4 text-muted-foreground" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => goOrGate("/settings", "settings")}>
          <Settings className="h-4 w-4 text-muted-foreground" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Sun className="h-4 w-4 text-muted-foreground dark:hidden" />
            <Moon className="hidden h-4 w-4 text-muted-foreground dark:block" />
            Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onSelect={() => setTheme("light")}>Light</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setTheme("dark")}>Dark</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setTheme("system")}>System</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void signOut()}>
          <LogOut className="h-4 w-4 text-muted-foreground" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
