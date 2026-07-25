"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Mic, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { VoiceRecorderButton } from "@/components/dashboard/voice-recorder-button";

type Step = "idle" | "recording" | "transcribing" | "review" | "saving";

type VoiceRecordDialogProps = {
  open: boolean;
  onClose: () => void;
};

type ApiErrorBody = {
  error?: { message?: string; code?: string };
};

const WAVEFORM = [18, 28, 12, 36, 8, 30, 20, 40, 14, 32, 24, 38, 10, 28, 20, 34, 16, 40, 12, 28, 18, 36, 22, 30];

const fieldClass =
  "w-full rounded-xl border border-border bg-input-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function VoiceRecordDialog({ open, onClose }: VoiceRecordDialogProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const reset = useCallback(() => {
    setStep("idle");
    setElapsed(0);
    setError(null);
    setTranscript("");
    setTitle("");
    setDescription("");
  }, []);

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const handleClose = () => {
    if (step === "transcribing" || step === "saving") return;
    onClose();
  };

  const handleError = (message: string) => {
    setError(message);
    setStep("idle");
  };

  const handleRecordingComplete = async (blob: Blob) => {
    setError(null);
    setStep("transcribing");

    try {
      const form = new FormData();
      const ext = blob.type.includes("mp4")
        ? "mp4"
        : blob.type.includes("ogg")
          ? "ogg"
          : blob.type.includes("wav")
            ? "wav"
            : "webm";
      form.append("file", blob, `voice.${ext}`);

      const response = await fetch("/api/voice/transcribe", {
        method: "POST",
        body: form,
      });

      const data = (await response.json().catch(() => ({}))) as ApiErrorBody & {
        transcript?: string;
        suggestedTitle?: string;
        suggestedDescription?: string;
      };

      if (!response.ok) {
        setError(data.error?.message ?? "Transcription failed. Please try again.");
        setStep("idle");
        return;
      }

      setTranscript(data.transcript ?? "");
      setTitle(data.suggestedTitle ?? "Untitled voice task");
      setDescription(data.suggestedDescription ?? "");
      setStep("review");
    } catch {
      setError("Network error while transcribing. Please try again.");
      setStep("idle");
    }
  };

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Title is required.");
      return;
    }

    setError(null);
    setStep("saving");

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmedTitle,
          ...(description.trim() ? { description: description.trim() } : {}),
        }),
      });

      const data = (await response.json().catch(() => ({}))) as ApiErrorBody;

      if (!response.ok) {
        setError(data.error?.message ?? "Could not save task.");
        setStep("review");
        return;
      }

      router.refresh();
      onClose();
    } catch {
      setError("Network error while saving. Please try again.");
      setStep("review");
    }
  };

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  const busy = step === "transcribing" || step === "saving";

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
            onClick={handleClose}
            disabled={busy}
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
                    {step === "review" || step === "saving"
                      ? "Review draft"
                      : step === "transcribing"
                        ? "Transcribing…"
                        : `${mm}:${ss}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={busy}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-foreground/5 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                aria-label="Close voice dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {step === "review" || step === "saving" ? (
              <div className="grid gap-3">
                <p className="text-[11px] text-muted-foreground">
                  Edit the suggested task, then save or discard.
                </p>
                {transcript ? (
                  <p className="rounded-xl border border-border bg-foreground/[0.03] px-3 py-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Transcript: </span>
                    {transcript}
                  </p>
                ) : null}
                <label className="grid gap-1.5 text-sm text-foreground">
                  Title
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={200}
                    disabled={busy}
                    className={fieldClass}
                  />
                </label>
                <label className="grid gap-1.5 text-sm text-foreground">
                  Description
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    maxLength={5000}
                    disabled={busy}
                    className={fieldClass}
                    placeholder="Optional details"
                  />
                </label>
              </div>
            ) : (
              <>
                <p className="mb-4 text-[11px] text-muted-foreground">
                  Speak naturally — e.g. “Tomorrow complete authentication. Friday deploy backend.”
                  Max 60 seconds.
                </p>

                <div
                  className="mb-5 flex h-16 items-end justify-center gap-0.5 rounded-xl border border-border bg-foreground/[0.03] px-3 py-2"
                  aria-hidden
                >
                  {WAVEFORM.map((h, i) => (
                    <motion.span
                      key={i}
                      className="w-1 rounded-full bg-primary/70"
                      animate={
                        step === "recording" || step === "transcribing"
                          ? { height: [h * 0.4, h * 0.9, h * 0.55] }
                          : { height: h * 0.35 }
                      }
                      transition={
                        step === "recording" || step === "transcribing"
                          ? { duration: 0.8, repeat: Infinity, delay: i * 0.03, ease: "easeInOut" }
                          : { duration: 0.2 }
                      }
                    />
                  ))}
                </div>
              </>
            )}

            {error ? (
              <p className="mt-3 text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
              {step === "review" || step === "saving" ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      reset();
                      onClose();
                    }}
                    disabled={busy}
                    className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-foreground/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleSave()}
                    disabled={busy}
                    className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98] disabled:opacity-50"
                  >
                    {step === "saving" ? "Saving…" : "Save task"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={busy}
                    className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-foreground/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  {step === "transcribing" ? (
                    <span className="rounded-xl bg-primary/15 px-4 py-2 text-sm font-medium text-primary">
                      Transcribing…
                    </span>
                  ) : (
                    <VoiceRecorderButton
                      disabled={busy}
                      onError={handleError}
                      onRecordingChange={(isRecording) => {
                        if (isRecording) setStep("recording");
                      }}
                      onElapsedChange={setElapsed}
                      onRecordingComplete={(blob) => {
                        void handleRecordingComplete(blob);
                      }}
                    />
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
