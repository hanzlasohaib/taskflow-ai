"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

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
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
      <h1 className="text-2xl font-semibold text-slate-900">Verify your email</h1>
      <p className="text-sm text-slate-600">
        We sent a verification link to your inbox. Open it to unlock the dashboard. A welcome email
        is sent after successful verification.
      </p>
      {session?.user.email ? (
        <p className="text-sm text-slate-700">Signed in as {session.user.email}</p>
      ) : (
        <p className="text-sm text-slate-700">
          <Link href="/login">Log in</Link> if you need to request another link.
        </p>
      )}
      <form onSubmit={resend}>
        <button
          type="submit"
          disabled={pending || !session?.user.email}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "Sending…" : "Resend verification email"}
        </button>
      </form>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-teal-700">{message}</p> : null}
      <p className="text-sm text-slate-600">
        <Link href="/dashboard">Continue to dashboard</Link> (blocked until verified)
      </p>
    </div>
  );
}
