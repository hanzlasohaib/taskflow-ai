import type { ApiErrorBody } from "@taskflow/types";

import { API_URL, AUTH_ORIGIN } from "./config";
import { clearSessionToken, getSessionToken, setSessionToken } from "./storage";

/** RN/Expo omit Origin; Better Auth requires it for CSRF checks. */
function authHeaders(extra?: HeadersInit): HeadersInit {
  return {
    "Content-Type": "application/json",
    Origin: AUTH_ORIGIN,
    "expo-origin": AUTH_ORIGIN,
    ...extra,
  };
}

export type MobileUser = {
  id: string;
  email: string;
  name: string;
};

type SessionResponse = {
  user?: {
    id?: string;
    email?: string;
    name?: string;
  } | null;
  session?: unknown;
};

export class AuthError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "AuthError";
    this.status = status;
    this.code = code;
  }
}

async function parseAuthError(response: Response): Promise<AuthError> {
  let code = "AUTH_FAILED";
  let message = response.statusText || "Authentication failed";
  try {
    const body = (await response.json()) as ApiErrorBody & { message?: string; code?: string };
    if (body?.error?.code) code = body.error.code;
    else if (typeof body.code === "string") code = body.code;
    if (body?.error?.message) message = body.error.message;
    else if (typeof body.message === "string") message = body.message;
  } catch {
    // keep defaults
  }
  return new AuthError(response.status, code, message);
}

function toUser(user: { id: string; email: string; name?: string | null }): MobileUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name ?? user.email,
  };
}

/**
 * Sign in via Better Auth email/password and store the bearer token
 * from the `set-auth-token` response header (requires server `bearer()` plugin).
 */
export async function signIn(email: string, password: string): Promise<MobileUser> {
  const response = await fetch(`${API_URL}/api/auth/sign-in/email`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) throw await parseAuthError(response);

  const body = (await response.json()) as SessionResponse & {
    twoFactorRedirect?: boolean;
  };

  if (body.twoFactorRedirect) {
    throw new AuthError(
      403,
      "TWO_FACTOR_REQUIRED",
      "This account has 2FA enabled. Complete sign-in on the web app (or disable 2FA) — mobile 2FA challenge is not available yet.",
    );
  }

  const token = response.headers.get("set-auth-token");
  if (!token) {
    throw new AuthError(
      500,
      "MISSING_TOKEN",
      "Sign-in succeeded but no session token was returned. Ensure the API has the Better Auth bearer plugin enabled.",
    );
  }

  await setSessionToken(token);
  const user = body.user;
  if (!user?.id || !user.email) {
    const session = await getSession();
    if (!session) {
      throw new AuthError(500, "MISSING_USER", "Sign-in succeeded but user data was missing.");
    }
    return session;
  }

  return toUser({ id: user.id, email: user.email, name: user.name });
}

/**
 * Sign up via Better Auth. Session token may be returned when email verification
 * is not required; otherwise user verifies in the browser.
 */
export async function signUp(input: {
  name: string;
  email: string;
  password: string;
}): Promise<{ user: MobileUser | null; needsVerification: boolean }> {
  const response = await fetch(`${API_URL}/api/auth/sign-up/email`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      name: input.name,
      email: input.email,
      password: input.password,
      callbackURL: `${API_URL}/dashboard`,
    }),
  });

  if (!response.ok) throw await parseAuthError(response);

  const token = response.headers.get("set-auth-token");
  const body = (await response.json()) as SessionResponse;

  if (token) {
    await setSessionToken(token);
    const user = body.user;
    if (user?.id && user.email) {
      return { user: toUser({ id: user.id, email: user.email, name: user.name }), needsVerification: false };
    }
    const session = await getSession();
    return { user: session, needsVerification: !session };
  }

  return { user: null, needsVerification: true };
}

export async function getSession(): Promise<MobileUser | null> {
  const token = await getSessionToken();
  if (!token) return null;

  const response = await fetch(`${API_URL}/api/auth/get-session`, {
    method: "GET",
    headers: authHeaders({ Authorization: `Bearer ${token}` }),
  });

  if (response.status === 401) {
    await clearSessionToken();
    return null;
  }

  if (!response.ok) {
    throw await parseAuthError(response);
  }

  const body = (await response.json()) as SessionResponse | null;
  const user = body?.user;
  if (!user?.id || !user.email) {
    await clearSessionToken();
    return null;
  }

  return toUser({ id: user.id, email: user.email, name: user.name });
}

export async function signOut(): Promise<void> {
  const token = await getSessionToken();
  if (token) {
    try {
      await fetch(`${API_URL}/api/auth/sign-out`, {
        method: "POST",
        headers: authHeaders({ Authorization: `Bearer ${token}` }),
        body: JSON.stringify({}),
      });
    } catch {
      // Still clear local session if network fails.
    }
  }
  await clearSessionToken();
}
