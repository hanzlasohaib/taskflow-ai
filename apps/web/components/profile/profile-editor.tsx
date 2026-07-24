"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";

import { AvatarCropDialog } from "@/components/profile/avatar-crop-dialog";
import { UserAvatar } from "@/components/shell/user-avatar";

const MAX_BYTES = 1 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const LIMITS_HINT = "JPG, PNG, or WEBP · max 1 MB · saved as 256×256 WEBP";

type ProfileEditorProps = {
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
};

export function ProfileEditor({ name, email, emailVerified, image, createdAt }: ProfileEditorProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayImage, setDisplayImage] = useState(image);

  useEffect(() => {
    setDisplayImage(image);
  }, [image]);

  function resetFileInput() {
    if (inputRef.current) inputRef.current.value = "";
  }

  function onPickFile(file: File | undefined) {
    setError(null);
    if (!file) return;

    if (!ALLOWED.has(file.type)) {
      setError(`Unsupported format (${file.type || "unknown"}). ${LIMITS_HINT}`);
      resetFileInput();
      return;
    }

    if (file.size > MAX_BYTES) {
      const mb = (file.size / (1024 * 1024)).toFixed(2);
      setError(`Image is ${mb} MB. Maximum allowed size is 1 MB. ${LIMITS_HINT}`);
      resetFileInput();
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewSrc(url);
    setCropOpen(true);
  }

  async function onSave(blob: Blob) {
    if (blob.size > MAX_BYTES) {
      throw new Error("Encoded avatar exceeds 1 MB. Try a simpler image.");
    }

    const body = new FormData();
    body.append("file", new File([blob], "avatar.webp", { type: "image/webp" }));
    const res = await fetch("/api/profile/avatar", { method: "POST", body });
    const data = (await res.json()) as { image?: string; error?: { message?: string } };
    if (!res.ok) {
      throw new Error(data.error?.message || "Upload failed");
    }
    if (data.image) setDisplayImage(data.image);
    router.refresh();
  }

  const memberSince = new Date(createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <div className="relative">
            <UserAvatar name={name} image={displayImage} size="xl" />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="absolute -right-1 -bottom-1 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-foreground/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Edit photo"
            >
              <Camera className="h-3.5 w-3.5" aria-hidden />
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => onPickFile(e.target.files?.[0])}
            />
          </div>
          <div className="min-w-0 space-y-1">
            <p className="text-lg font-semibold text-foreground">{name}</p>
            <p className="text-sm text-muted-foreground">{email}</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-2 text-xs font-medium text-primary hover:underline"
            >
              Edit Photo
            </button>
            <p className="text-[11px] text-muted-foreground">{LIMITS_HINT}</p>
          </div>
        </div>
        {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">Name</dt>
            <dd className="mt-1 text-sm font-medium text-foreground">{name}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Email</dt>
            <dd className="mt-1 text-sm font-medium text-foreground">{email}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Verified</dt>
            <dd className="mt-1 text-sm font-medium text-foreground">{emailVerified ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Role</dt>
            <dd className="mt-1 text-sm font-medium text-foreground">Member</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted-foreground">Member Since</dt>
            <dd className="mt-1 text-sm font-medium text-foreground">{memberSince}</dd>
          </div>
        </dl>
      </div>

      <AvatarCropDialog
        open={cropOpen}
        imageSrc={previewSrc}
        onOpenChange={(open) => {
          setCropOpen(open);
          if (!open) {
            resetFileInput();
            if (previewSrc) {
              URL.revokeObjectURL(previewSrc);
              setPreviewSrc(null);
            }
          }
        }}
        onSave={onSave}
      />
    </div>
  );
}
