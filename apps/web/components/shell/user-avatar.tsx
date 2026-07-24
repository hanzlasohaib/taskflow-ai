"use client";

import { useEffect, useState } from "react";
import { getInitials } from "@taskflow/utils";

import { cn } from "@/lib/utils";

const SIZES = {
  xs: "h-5 w-5 text-[9px]",
  sm: "h-7 w-7 text-[11px]",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
  xl: "h-14 w-14 text-lg",
} as const;

function InitialsAvatar({
  name,
  color,
  sizeClass,
  className,
}: {
  name: string;
  color: string;
  sizeClass: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold",
        sizeClass,
        className,
      )}
      style={{
        backgroundColor: `${color}22`,
        boxShadow: `0 0 0 1.5px ${color}44`,
        color,
      }}
      aria-hidden
    >
      {getInitials(name)}
    </div>
  );
}

export function UserAvatar({
  name,
  image,
  color = "#536DFE",
  size = "sm",
  className,
}: {
  name: string;
  image?: string | null;
  color?: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const sizeClass = SIZES[size];

  useEffect(() => {
    setFailed(false);
  }, [image]);

  if (!image || failed) {
    return <InitialsAvatar name={name} color={color} sizeClass={sizeClass} className={className} />;
  }

  return (
    <div
      className={cn(
        "relative aspect-square shrink-0 overflow-hidden rounded-full bg-muted",
        sizeClass,
        className,
      )}
    >
      {/* Native img avoids Next/Image remote-pattern quirks for Supabase public URLs */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
