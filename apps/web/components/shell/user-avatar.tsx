import { getInitials } from "@taskflow/utils";

import { cn } from "@/lib/utils";

const SIZES = {
  xs: "h-5 w-5 text-[9px]",
  sm: "h-7 w-7 text-[11px]",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
} as const;

export function UserAvatar({
  name,
  color = "#536DFE",
  size = "sm",
  className,
}: {
  name: string;
  color?: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const initials = getInitials(name);
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold",
        SIZES[size],
        className,
      )}
      style={{
        backgroundColor: `${color}22`,
        boxShadow: `0 0 0 1.5px ${color}44`,
        color,
      }}
      aria-hidden
    >
      {initials}
    </div>
  );
}
