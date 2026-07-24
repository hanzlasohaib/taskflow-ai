import { jsonError, jsonOk, unauthorizedError } from "@/lib/api";
import { updateProfile, getProfile } from "@/lib/profile";
import { AuthError, requireSession } from "@/lib/session";
import {
  avatarObjectPath,
  getAvatarsBucket,
  getSupabaseAdmin,
  normalizeAvatarPath,
  resolveAvatarUrl,
} from "@/lib/supabase-admin";

const MAX_BYTES = 1 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return jsonError("VALIDATION_ERROR", "Avatar file is required", 400);
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return jsonError("VALIDATION_ERROR", "Avatar must be JPG, PNG, or WEBP", 400);
    }

    if (file.size <= 0 || file.size > MAX_BYTES) {
      return jsonError("VALIDATION_ERROR", "Avatar must be between 1 byte and 1 MB", 400);
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const path = avatarObjectPath(session.user.id);
    const bucket = getAvatarsBucket();
    const supabase = getSupabaseAdmin();

    const existing = await getProfile(session.user.id);
    const oldPath = normalizeAvatarPath(existing.image);

    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, bytes, {
      contentType: "image/webp",
      upsert: true,
      cacheControl: "3600",
    });

    if (uploadError) {
      return jsonError("STORAGE_ERROR", uploadError.message || "Failed to upload avatar", 500);
    }

    // Persist canonical object path only — never a public or signed URL.
    const profile = await updateProfile(session.user.id, { image: path });
    const displayUrl = await resolveAvatarUrl(path);

    if (!displayUrl) {
      return jsonError("STORAGE_ERROR", "Avatar uploaded but could not create a signed URL", 500);
    }

    // Best-effort cleanup of legacy UUID object paths
    if (oldPath && oldPath !== path) {
      await supabase.storage.from(bucket).remove([oldPath]).catch(() => undefined);
    }

    return jsonOk({
      image: displayUrl,
      profile: {
        ...profile,
        image: displayUrl,
        role: "Member" as const,
        createdAt: profile.createdAt.toISOString(),
        updatedAt: profile.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return unauthorizedError(error.message);
    }
    if (error instanceof Error && error.message.includes("Supabase Storage is not configured")) {
      return jsonError("CONFIG_ERROR", error.message, 503);
    }
    throw error;
  }
}
