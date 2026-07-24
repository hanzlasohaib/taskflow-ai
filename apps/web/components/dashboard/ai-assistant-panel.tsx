"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";

type AiAssistantPanelProps = {
  open: boolean;
  onClose: () => void;
  demo?: boolean;
  onRequireAccount?: () => void;
};

const CAPABILITIES = [
  "Summarize tasks",
  "Prioritize work",
  "Generate schedule",
  "Suggest deadlines",
  "Detect overdue tasks",
  "Suggest productivity improvements",
];

export function AiAssistantPanel({ open, onClose, demo, onRequireAccount }: AiAssistantPanelProps) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close AI assistant backdrop"
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-assistant-title"
            className="fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-2xl"
            initial={{ x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 24, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" aria-hidden />
                <h2 id="ai-assistant-title" className="text-sm font-semibold text-foreground">
                  AI Assistant
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-foreground/5 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Close AI assistant"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              <p className="text-sm text-muted-foreground">
                {demo
                  ? "Explore AI capabilities in demo mode. Real generation requires an account."
                  : "Ask in natural language to summarize, prioritize, or edit tasks. Deep AI wiring arrives in a later phase."}
              </p>
              <ul className="space-y-2">
                {CAPABILITIES.map((item) => (
                  <li
                    key={item}
                    className="rounded-xl border border-border bg-foreground/[0.02] px-3 py-2.5 text-sm text-foreground"
                  >
                    {item}
                  </li>
                ))}
              </ul>
              {demo ? (
                <button
                  type="button"
                  onClick={onRequireAccount}
                  className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Run real AI generation
                </button>
              ) : null}
            </div>
            <div className="border-t border-border p-4">
              <label className="sr-only" htmlFor="ai-prompt">
                Ask AI Assistant
              </label>
              <input
                id="ai-prompt"
                type="text"
                placeholder="Ask TaskFlow AI…"
                className="w-full rounded-xl border border-border bg-muted px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && demo) {
                    e.preventDefault();
                    onRequireAccount?.();
                  }
                }}
              />
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
