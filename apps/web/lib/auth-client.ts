"use client";

import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  // Must be a concrete URL — undefined breaks better-fetch (e.g. Sign out).
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [
    twoFactorClient({
      onTwoFactorRedirect() {
        if (typeof window === "undefined") return;
        const params = new URLSearchParams(window.location.search);
        const next = params.get("next");
        const url = next ? `/two-factor?next=${encodeURIComponent(next)}` : "/two-factor";
        window.location.assign(url);
      },
    }),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
