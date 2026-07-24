import type { HTMLAttributes } from "react";

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-foreground/8 ${className}`}
      aria-hidden
      {...props}
    />
  );
}
