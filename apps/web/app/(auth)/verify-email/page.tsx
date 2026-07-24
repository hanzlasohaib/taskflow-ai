"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import {
  authCardClass,
  authErrorClass,
  authLinkClass,
  authMutedClass,
  authPrimaryButtonClass,
  authSuccessClass,
  authTitleClass,
} from "@/components/auth/auth-styles";
import { authClient, useSession } from "@/lib/auth-client";

export default function VerifyEmailPage() {
  const { data: session } = useSession();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function resend(event: FormEvent) {
    event.preventDefault();
    if (!session?.user.email) {
      setError("Sign in first, then request a verification email.");
      return;
    }

    setPending(true);
    setError(null);
    setMessage(null);

    try {
      const { error: sendError } = await authClient.sendVerificationEmail({
        email: session.user.email,
        callbackURL: "/dashboard",
      });

      if (sendError) {
        setError(sendError.message || "Unable to send verification email");
        return;
      }

      setMessage("Verification email sent. Check your inbox.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send verification email");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={authCardClass}>
      <div className="space-y-1">
        <h1 className={authTitleClass} style={{ fontFamily: "var(--font-display)" }}>
          Verify your email
        </h1>
        <p className={authMutedClass}>
          We sent a verification link to your inbox. Open it to unlock the dashboard. A welcome email
          is sent after successful verification.
        </p>
      </div>
      {session?.user.email ? (
        <p className="text-sm text-foreground">Signed in as {session.user.email}</p>
      ) : (
        <p className={authMutedClass}>
          <Link href="/login" className={authLinkClass}>
            Log in
          </Link>{" "}
          if you need to request another link.
        </p>
      )}
      <form onSubmit={resend}>
        <button
          type="submit"
          disabled={pending || !session?.user.email}
          className={authPrimaryButtonClass}
        >
          {pending ? "Sending…" : "Resend verification email"}
        </button>
      </form>
      {error ? <p className={authErrorClass}>{error}</p> : null}
      {message ? <p className={authSuccessClass}>{message}</p> : null}
      <p className={authMutedClass}>
        <Link href="/dashboard" className={authLinkClass}>
          Continue to dashboard
        </Link>{" "}
        (blocked until verified)
      </p>
    </div>
  );
}
