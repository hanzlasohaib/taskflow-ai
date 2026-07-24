"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Link from "next/link";

import { GATE_COPY, type AccountGateIntent } from "@/lib/demo/gates";

type AccountGateModalProps = {
  intent: AccountGateIntent | null;
  onClose: () => void;
};

export function AccountGateModal({ intent, onClose }: AccountGateModalProps) {
  const copy = intent ? GATE_COPY[intent] : null;

  return (
    <AnimatePresence>
      {intent && copy ? (
        <>
          <motion.button
            type="button"
            aria-label="Close dialog backdrop"
            className="fixed inset-0 z-50 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-gate-title"
            className="fixed top-1/2 left-1/2 z-50 w-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-5 shadow-2xl"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.16 }}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <h2 id="account-gate-title" className="text-sm font-semibold text-foreground">
                {copy.title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-foreground/5 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mb-5 text-sm text-muted-foreground">{copy.description}</p>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-foreground/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Keep exploring
              </button>
              <Link
                href="/login?next=/dashboard"
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-foreground/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Log in
              </Link>
              <Link
                href="/signup?next=/dashboard"
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Sign up
              </Link>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
