"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Mic, X } from "lucide-react";
import { useEffect, useState } from "react";

const WAVEFORM = [18, 28, 12, 36, 8, 30, 20, 40, 14, 32, 24, 38, 10, 28, 20, 34, 16, 40, 12, 28, 18, 36, 22, 30];

type VoiceRecordDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function VoiceRecordDialog({ open, onClose }: VoiceRecordDialogProps) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!open) {
      setSeconds(0);
      return;
    }
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [open]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close voice dialog backdrop"
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="voice-dialog-title"
            className="fixed top-1/2 left-1/2 z-50 w-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-5 shadow-2xl"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.16 }}
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                  <Mic className="h-4 w-4 text-primary" aria-hidden />
                </div>
                <div>
                  <h2 id="voice-dialog-title" className="text-sm font-semibold text-foreground">
                    Voice Task
                  </h2>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {mm}:{ss}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-foreground/5 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Close voice dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mb-4 text-[11px] text-muted-foreground">
              Speak naturally — e.g. “Tomorrow complete authentication. Friday deploy backend.”
            </p>

            <div className="mb-5 flex h-16 items-end justify-center gap-0.5 rounded-xl border border-border bg-foreground/[0.03] px-3 py-2" aria-hidden>
              {WAVEFORM.map((h, i) => (
                <motion.span
                  key={i}
                  className="w-1 rounded-full bg-primary/70"
                  animate={{ height: [h * 0.4, h * 0.9, h * 0.55] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.03, ease: "easeInOut" }}
                />
              ))}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-foreground/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
              >
                Save
              </button>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
