"use client";

import type { Sketch, SketchDocument } from "@taskflow/types";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";

import { SketchThumbnail } from "@/components/canvas/sketch-thumbnail";

const TaskCanvas = dynamic(
  () => import("@/components/canvas/task-canvas").then((m) => m.TaskCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
        Loading canvas…
      </div>
    ),
  },
);

type ApiErrorBody = {
  error?: { message?: string };
};

type TaskSketchPanelProps = {
  taskId: string;
};

export function TaskSketchPanel({ taskId }: TaskSketchPanelProps) {
  const [sketch, setSketch] = useState<Sketch | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/sketches?taskId=${encodeURIComponent(taskId)}`);
      const data = (await res.json().catch(() => ({}))) as ApiErrorBody & {
        sketch?: Sketch | null;
      };
      if (!res.ok) {
        setLoadError(data.error?.message ?? "Failed to load sketch");
        return;
      }
      setSketch(data.sketch ?? null);
    } catch {
      setLoadError("Network error while loading sketch");
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async (document: SketchDocument, pngBlob: Blob | null) => {
    setStatus(null);
    const form = new FormData();
    form.append("taskId", taskId);
    form.append("dataJson", JSON.stringify(document));
    if (pngBlob) {
      form.append("file", pngBlob, "sketch.png");
    }

    const res = await fetch("/api/sketches", {
      method: "POST",
      body: form,
    });
    const data = (await res.json().catch(() => ({}))) as ApiErrorBody & Sketch;

    if (!res.ok) {
      throw new Error(data.error?.message ?? "Could not save sketch (check size limits)");
    }

    setSketch(data);
    setStatus("Sketch saved");
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm" aria-labelledby="sketch-heading">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="sketch-heading" className="text-sm font-semibold text-foreground">
            Sketch
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Freehand notes on this task. Reload restores your strokes.
          </p>
        </div>
        {!loading && sketch ? (
          <SketchThumbnail document={sketch.dataJson} imageUrl={sketch.imageUrl} />
        ) : null}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading sketch…</p>
      ) : loadError ? (
        <p className="text-sm text-destructive" role="alert">
          {loadError}
        </p>
      ) : (
        <TaskCanvas initialDocument={sketch?.dataJson ?? null} onSave={handleSave} />
      )}

      {status ? <p className="mt-2 text-xs text-primary">{status}</p> : null}
    </section>
  );
}
