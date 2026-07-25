"use client";

import { Eraser, Save, Undo2 } from "lucide-react";

const COLORS = ["#111827", "#2563eb", "#dc2626", "#16a34a", "#ca8a04"] as const;
const WIDTHS = [2, 4, 8] as const;

type CanvasToolbarProps = {
  color: string;
  width: number;
  canUndo: boolean;
  saving: boolean;
  dirty: boolean;
  onColorChange: (color: string) => void;
  onWidthChange: (width: number) => void;
  onUndo: () => void;
  onClear: () => void;
  onSave: () => void;
};

export function CanvasToolbar({
  color,
  width,
  canUndo,
  saving,
  dirty,
  onColorChange,
  onWidthChange,
  onUndo,
  onClear,
  onSave,
}: CanvasToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5" role="group" aria-label="Stroke color">
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onColorChange(c)}
            className="h-7 w-7 rounded-full border border-border transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{
              backgroundColor: c,
              outline: color === c ? "2px solid var(--color-primary, #2563eb)" : undefined,
              outlineOffset: 2,
            }}
            aria-label={`Color ${c}`}
            aria-pressed={color === c}
          />
        ))}
      </div>

      <div className="flex items-center gap-1" role="group" aria-label="Stroke width">
        {WIDTHS.map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => onWidthChange(w)}
            className={
              width === w
                ? "rounded-lg bg-primary/15 px-2.5 py-1 text-[11px] font-semibold text-primary"
                : "rounded-lg border border-border px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-foreground/5"
            }
            aria-pressed={width === w}
          >
            {w}px
          </button>
        ))}
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border px-3 text-xs font-medium text-foreground transition-all hover:bg-foreground/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
        >
          <Undo2 className="h-3.5 w-3.5" aria-hidden /> Undo
        </button>
        <button
          type="button"
          onClick={onClear}
          disabled={!canUndo}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border px-3 text-xs font-medium text-foreground transition-all hover:bg-foreground/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
        >
          <Eraser className="h-3.5 w-3.5" aria-hidden /> Clear
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving || !dirty}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5" aria-hidden />
          {saving ? "Saving…" : "Save sketch"}
        </button>
      </div>
    </div>
  );
}
