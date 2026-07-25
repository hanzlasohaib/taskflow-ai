"use client";

import type { SketchDocument } from "@taskflow/types";
import { useEffect, useRef } from "react";

import { drawSketchDocument } from "@/components/canvas/draw-sketch";

type SketchThumbnailProps = {
  document: SketchDocument | null;
  imageUrl?: string | null;
  className?: string;
};

export function SketchThumbnail({ document, imageUrl, className }: SketchThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (imageUrl || !document || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = document.width;
    canvas.height = document.height;
    drawSketchDocument(ctx, document);
  }, [document, imageUrl]);

  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt="Task sketch thumbnail"
        className={className ?? "h-24 w-auto rounded-xl border border-border object-contain bg-foreground/[0.02]"}
      />
    );
  }

  if (!document || document.strokes.length === 0) {
    return (
      <div
        className={
          className ??
          "flex h-24 items-center justify-center rounded-xl border border-dashed border-border bg-foreground/[0.02] px-3 text-xs text-muted-foreground"
        }
      >
        No sketch yet
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={className ?? "h-24 w-auto max-w-full rounded-xl border border-border bg-white dark:bg-foreground/[0.04]"}
      aria-label="Task sketch thumbnail"
    />
  );
}
