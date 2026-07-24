"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const OUTPUT_SIZE = 256;
const WEBP_QUALITY = 0.85;

type AvatarCropDialogProps = {
  open: boolean;
  imageSrc: string | null;
  onOpenChange: (open: boolean) => void;
  onSave: (blob: Blob) => Promise<void>;
};

async function getCroppedWebp(imageSrc: string, crop: Area): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    OUTPUT_SIZE,
    OUTPUT_SIZE,
  );

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/webp", WEBP_QUALITY);
  });

  if (!blob) {
    throw new Error("Failed to encode WEBP. Try another browser or image.");
  }

  // Final avatar should be tiny; reject pathological encodes
  if (blob.size > 500_000) {
    throw new Error("Encoded avatar is unexpectedly large. Try a different crop or image.");
  }

  return blob;
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("Failed to load image for cropping")));
    image.crossOrigin = "anonymous";
    image.src = url;
  });
}

export function AvatarCropDialog({ open, imageSrc, onOpenChange, onSave }: AvatarCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedArea(pixels);
  }, []);

  async function handleSave() {
    if (!imageSrc || !croppedArea) return;
    if (croppedArea.width < 8 || croppedArea.height < 8) {
      setError("Crop area is too small. Zoom out and try again.");
      return;
    }

    setPending(true);
    setError(null);
    try {
      const blob = await getCroppedWebp(imageSrc, croppedArea);
      await onSave(blob);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save avatar");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!pending) onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit photo</DialogTitle>
          <DialogDescription>
            Crop to a 1:1 square. We save a 256×256 WEBP (typically under 200 KB).
          </DialogDescription>
        </DialogHeader>

        <div className="relative h-64 overflow-hidden rounded-2xl bg-muted">
          {imageSrc ? (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          ) : null}
        </div>

        <label className="grid gap-2 text-sm text-foreground">
          Zoom
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </label>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => onOpenChange(false)}
            className="inline-flex h-10 items-center rounded-xl border border-border bg-foreground/[0.04] px-4 text-sm font-medium text-foreground transition-all hover:bg-foreground/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={pending || !croppedArea}
            onClick={() => void handleSave()}
            className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
