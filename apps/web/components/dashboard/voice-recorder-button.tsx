"use client";

import { Mic, Square } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const MAX_SECONDS = 60;

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg",
  ];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
}

export type VoiceRecorderButtonProps = {
  disabled?: boolean;
  onRecordingComplete: (blob: Blob) => void;
  onError: (message: string) => void;
  onElapsedChange?: (seconds: number) => void;
  onRecordingChange?: (recording: boolean) => void;
};

export function VoiceRecorderButton({
  disabled,
  onRecordingComplete,
  onError,
  onElapsedChange,
  onRecordingChange,
}: VoiceRecorderButtonProps) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (disabled || recording) return;

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      onError("Microphone is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = pickMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        clearTimer();
        cleanupStream();
        setRecording(false);
        onRecordingChange?.(false);
        onError("Recording failed. Please try again.");
      };

      recorder.onstop = () => {
        clearTimer();
        cleanupStream();
        setRecording(false);
        onRecordingChange?.(false);
        const type = recorder.mimeType || mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        chunksRef.current = [];
        mediaRecorderRef.current = null;
        if (blob.size > 0) {
          onRecordingComplete(blob);
        } else {
          onError("No audio captured. Please try again.");
        }
      };

      recorder.start(250);
      startedAtRef.current = Date.now();
      setElapsed(0);
      onElapsedChange?.(0);
      setRecording(true);
      onRecordingChange?.(true);

      timerRef.current = window.setInterval(() => {
        const seconds = Math.floor((Date.now() - startedAtRef.current) / 1000);
        setElapsed(seconds);
        onElapsedChange?.(seconds);
        if (seconds >= MAX_SECONDS) {
          stopRecording();
        }
      }, 250);
    } catch {
      cleanupStream();
      onError("Microphone permission denied or unavailable.");
    }
  }, [
    cleanupStream,
    clearTimer,
    disabled,
    onElapsedChange,
    onError,
    onRecordingChange,
    onRecordingComplete,
    recording,
    stopRecording,
  ]);

  useEffect(() => {
    return () => {
      clearTimer();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      cleanupStream();
    };
  }, [cleanupStream, clearTimer]);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => (recording ? stopRecording() : void startRecording())}
      className={
        recording
          ? "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-destructive px-4 text-sm font-semibold text-white shadow-lg transition-all hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98] disabled:opacity-50"
          : "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98] disabled:opacity-50"
      }
      aria-pressed={recording}
    >
      {recording ? (
        <>
          <Square className="h-4 w-4 fill-current" aria-hidden />
          Stop ({String(Math.floor(elapsed / 60)).padStart(2, "0")}:
          {String(elapsed % 60).padStart(2, "0")})
        </>
      ) : (
        <>
          <Mic className="h-4 w-4" aria-hidden />
          Start recording
        </>
      )}
    </button>
  );
}
