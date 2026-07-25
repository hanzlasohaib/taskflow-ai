"use client";

import type { SketchDocument, SketchPoint, SketchStroke } from "@taskflow/types";
import { useCallback, useEffect, useRef, useState } from "react";

import { CanvasToolbar } from "@/components/canvas/canvas-toolbar";
import { drawSketchDocument, drawStroke } from "@/components/canvas/draw-sketch";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;

function newStrokeId() {
  return `s_${Math.random().toString(36).slice(2, 10)}`;
}

function emptyDocument(): SketchDocument {
  return { version: 1, width: CANVAS_WIDTH, height: CANVAS_HEIGHT, strokes: [] };
}

type TaskCanvasProps = {
  initialDocument?: SketchDocument | null;
  onSave: (document: SketchDocument, pngBlob: Blob | null) => Promise<void>;
};

export function TaskCanvas({ initialDocument, onSave }: TaskCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const currentStrokeRef = useRef<SketchStroke | null>(null);

  const [document, setDocument] = useState<SketchDocument>(
    () => initialDocument ?? emptyDocument(),
  );
  const [color, setColor] = useState("#111827");
  const [width, setWidth] = useState(4);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialDocument) {
      setDocument(initialDocument);
      setDirty(false);
    }
  }, [initialDocument]);

  const redraw = useCallback((doc: SketchDocument) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawSketchDocument(ctx, doc);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    redraw(document);
  }, [document, redraw]);

  const pointerToNormalized = (event: React.PointerEvent<HTMLCanvasElement>): SketchPoint => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    return {
      x: Math.min(1, Math.max(0, x)),
      y: Math.min(1, Math.max(0, y)),
    };
  };

  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    const point = pointerToNormalized(event);
    currentStrokeRef.current = {
      id: newStrokeId(),
      color,
      width,
      points: [point],
    };
    setError(null);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || !currentStrokeRef.current) return;
    const point = pointerToNormalized(event);
    currentStrokeRef.current.points.push(point);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    drawSketchDocument(ctx, document);
    drawStroke(ctx, currentStrokeRef.current, CANVAS_WIDTH, CANVAS_HEIGHT);
  };

  const endStroke = () => {
    if (!drawingRef.current || !currentStrokeRef.current) return;
    drawingRef.current = false;
    const stroke = currentStrokeRef.current;
    currentStrokeRef.current = null;
    if (stroke.points.length < 1) return;
    setDocument((prev) => ({
      ...prev,
      strokes: [...prev.strokes, stroke],
    }));
    setDirty(true);
  };

  const handleUndo = () => {
    setDocument((prev) => ({
      ...prev,
      strokes: prev.strokes.slice(0, -1),
    }));
    setDirty(true);
  };

  const handleClear = () => {
    setDocument(emptyDocument());
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const canvas = canvasRef.current;
      let png: Blob | null = null;
      if (canvas) {
        png = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((blob) => resolve(blob), "image/png");
        });
      }
      await onSave(document, png);
      setDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save sketch");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-3">
      <CanvasToolbar
        color={color}
        width={width}
        canUndo={document.strokes.length > 0}
        saving={saving}
        dirty={dirty}
        onColorChange={setColor}
        onWidthChange={setWidth}
        onUndo={handleUndo}
        onClear={handleClear}
        onSave={() => void handleSave()}
      />

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm dark:bg-foreground/[0.04]">
        <canvas
          ref={canvasRef}
          className="h-auto w-full max-w-full touch-none cursor-crosshair"
          style={{ aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}` }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endStroke}
          onPointerCancel={endStroke}
          onPointerLeave={endStroke}
        />
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : (
        <p className="text-[11px] text-muted-foreground">
          Draw with pointer or finger. Strokes save with the task; optional PNG snapshot is stored when storage is configured.
        </p>
      )}
    </div>
  );
}
