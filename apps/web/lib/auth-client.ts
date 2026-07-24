"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // Must be a concrete URL — undefined breaks better-fetch (e.g. Sign out).
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export const { signIn, signUp, signOut, useSession } = authClient;
