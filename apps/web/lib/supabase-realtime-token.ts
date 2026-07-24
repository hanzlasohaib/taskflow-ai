import "server-only";

import { SignJWT } from "jose";

const TOKEN_TTL_SECONDS = 60 * 60; // 1 hour

export type RealtimeTokenPayload = {
  token: string;
  expiresAt: number;
};

function getJwtSecret(): Uint8Array {
  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret) {
    throw new Error("SUPABASE_JWT_SECRET is not configured");
  }
  return new TextEncoder().encode(secret);
}

/**
 * Mint a short-lived JWT compatible with Supabase Realtime RLS.
 * `sub` must match Better Auth user id (text); policies use auth.jwt()->>'sub'.
 */
export async function mintRealtimeToken(userId: string): Promise<RealtimeTokenPayload> {
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + TOKEN_TTL_SECONDS;

  const token = await new SignJWT({
    role: "authenticated",
    aud: "authenticated",
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(userId)
    .setIssuedAt(now)
    .setExpirationTime(expiresAt)
    .sign(getJwtSecret());

  return { token, expiresAt: expiresAt * 1000 };
}
