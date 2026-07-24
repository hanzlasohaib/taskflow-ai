"use client";

import { Bell } from "lucide-react";

import { DEMO_NOTIFICATIONS } from "@/lib/demo/notifications";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { EmptyState } from "@/components/ui/empty-state";

type NotificationsPopoverProps = {
  notifications?: typeof DEMO_NOTIFICATIONS;
};

export function NotificationsPopover({
  notifications = DEMO_NOTIFICATIONS,
}: NotificationsPopoverProps) {
  const hasItems = notifications.length > 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-foreground/5 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" aria-hidden />
          {hasItems ? (
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Notifications</p>
        </div>
        {hasItems ? (
          <ul className="max-h-72 overflow-y-auto py-1">
            {notifications.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-0.5 px-4 py-3 transition-colors hover:bg-foreground/[0.03]"
              >
                <span className="text-sm text-foreground">{item.title}</span>
                <span className="text-[11px] text-muted-foreground">{item.time}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-3">
            <EmptyState title="No notifications yet." className="py-8" />
          </div>
        )}
        <div className="border-t border-border px-4 py-2.5">
          <button
            type="button"
            className="w-full text-left text-xs font-medium text-primary transition-colors hover:underline"
          >
            View all
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
