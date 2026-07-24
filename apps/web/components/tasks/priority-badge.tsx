import type { TaskPriority } from "@taskflow/types";
import { PRIORITY_BADGE_CLASS, TASK_PRIORITY_LABELS } from "@taskflow/utils";

import { cn } from "@/lib/utils";

export function PriorityBadge({ priority, className }: { priority: TaskPriority; className?: string }) {
  return (
    <span
      className={cn(
        "rounded-full border px-1.5 py-0.5 text-[10px] font-medium tracking-wide",
        PRIORITY_BADGE_CLASS[priority],
        className,
      )}
    >
      {TASK_PRIORITY_LABELS[priority]}
    </span>
  );
}
