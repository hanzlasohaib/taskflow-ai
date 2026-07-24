import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (adminClient) return adminClient;

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase Storage is not configured (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY).");
  }

  adminClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return adminClient;
}

export function getAvatarsBucket(): string {
  return process.env.AVATARS_BUCKET || "avatars";
}

const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24; // 24h — refreshed on each server render

/** Canonical object path stored in `User.image` (bucket from env). */
export function avatarObjectPath(userId: string): string {
  return `${userId}/avatar.webp`;
}

/**
 * Normalize a DB value to a storage object path.
 * - Path like `{userId}/avatar.webp` → returned as-is
 * - Legacy public/signed Supabase URL → extracted object path
 * - External http(s) URL (OAuth) → null (not our storage)
 */
export function normalizeAvatarPath(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed)) {
    const bucket = getAvatarsBucket();
    for (const marker of [`/object/public/${bucket}/`, `/object/sign/${bucket}/`]) {
      const idx = trimmed.indexOf(marker);
      if (idx === -1) continue;
      const path = decodeURIComponent(trimmed.slice(idx + marker.length).split("?")[0] ?? "");
      return path || null;
    }
    return null; // external absolute URL
  }

  // Already a storage object path (no scheme)
  return trimmed.replace(/^\/+/, "");
}

/**
 * Mint a short-lived signed URL for display from a stored path (or legacy URL).
 * External non-storage URLs (e.g. OAuth) are returned unchanged.
 * Never persist the signed URL — only use it for the response/render.
 */
export async function resolveAvatarUrl(value: string | null | undefined): Promise<string | null> {
  if (!value) return null;

  const path = normalizeAvatarPath(value);
  if (!path) {
    // Absolute URL that isn't our bucket (OAuth, etc.)
    return /^https?:\/\//i.test(value) ? value : null;
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.storage
      .from(getAvatarsBucket())
      .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
    if (error || !data?.signedUrl) return null;
    return data.signedUrl;
  } catch {
    return null;
  }
}
