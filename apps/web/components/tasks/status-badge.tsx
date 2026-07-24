import type { TaskPriority, TaskStatus } from "@taskflow/types";
import {
  DISPLAY_STATUS_BADGE_CLASS,
  DISPLAY_STATUS_DOT_CLASS,
  getDisplayStatus,
  getDisplayStatusLabel,
  PRIORITY_DOT_CLASS,
} from "@taskflow/utils";

import { cn } from "@/lib/utils";

type StatusInput = { status: TaskStatus; dueDate?: string | null };

export function StatusBadge({ status, dueDate, className }: StatusInput & { className?: string }) {
  const display = getDisplayStatus({ status, dueDate });
  return (
    <span
      className={cn(
        "rounded-full border px-1.5 py-0.5 text-[10px] font-medium tracking-wide",
        DISPLAY_STATUS_BADGE_CLASS[display],
        className,
      )}
    >
      {getDisplayStatusLabel({ status, dueDate })}
    </span>
  );
}

export function StatusDot({ status, dueDate, className }: StatusInput & { className?: string }) {
  const display = getDisplayStatus({ status, dueDate });
  return (
    <span
      className={cn("h-2 w-2 shrink-0 rounded-full", DISPLAY_STATUS_DOT_CLASS[display], className)}
      aria-hidden
    />
  );
}

export function PriorityDot({ priority, className }: { priority: TaskPriority; className?: string }) {
  return (
    <span
      className={cn("h-1.5 w-1.5 shrink-0 rounded-full", PRIORITY_DOT_CLASS[priority], className)}
      aria-hidden
    />
  );
}
