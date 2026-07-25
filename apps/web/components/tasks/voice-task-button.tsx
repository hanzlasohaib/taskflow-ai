"use client";

import { Mic } from "lucide-react";

import { useShellActions } from "@/components/shell/app-shell";

export function VoiceTaskButton() {
  const { openVoice } = useShellActions();

  return (
    <button
      type="button"
      onClick={openVoice}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-foreground/[0.04] px-4 text-sm font-medium text-foreground transition-all hover:bg-foreground/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Mic className="h-4 w-4 text-primary" aria-hidden />
      Voice Task
    </button>
  );
}
