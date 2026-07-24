import type { TaskPriority } from "@taskflow/types";
import {
  getPriorityBadgeClass,
  getPriorityColorClass,
  TASK_PRIORITY_LABELS,
} from "@taskflow/utils";

import { cn } from "@/lib/utils";

export function PriorityBadge({ priority, className }: { priority: TaskPriority; className?: string }) {
  return (
    <span
      className={cn(
        "rounded-full border px-1.5 py-0.5 text-[10px] font-medium tracking-wide",
        getPriorityBadgeClass(priority),
        className,
      )}
    >
      {TASK_PRIORITY_LABELS[priority]}
    </span>
  );
}

export function PriorityDot({ priority, className }: { priority: TaskPriority; className?: string }) {
  return (
    <span
      className={cn("h-2.5 w-2.5 shrink-0 rounded-full", getPriorityColorClass(priority), className)}
      aria-hidden
    />
  );
}
