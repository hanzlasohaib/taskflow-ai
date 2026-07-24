import { headers } from "next/headers";

import { auth, type Session } from "@/lib/auth";

export class AuthError extends Error {
  readonly code = "UNAUTHORIZED" as const;
  readonly status = 401;

  constructor(message = "Authentication required") {
    super(message);
    this.name = "AuthError";
  }
}

export async function getSession(): Promise<Session | null> {
  try {
    return await auth.api.getSession({
      headers: await headers(),
    });
  } catch (error) {
    // DB unreachable / Better Auth internal errors must not 500 public pages (e.g. guest `/`).
    console.error("[getSession] failed; treating as signed out", error);
    return null;
  }
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new AuthError();
  }
  return session;
}
