"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { authClient } from "@/lib/auth-client";
import { captchaHeaders, getRecaptchaToken, isRecaptchaEnabled } from "@/lib/recaptcha";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);

    try {
      const token = await getRecaptchaToken("forgot_password");
      const { error: resetError } = await authClient.requestPasswordReset(
        {
          email,
          redirectTo: `${window.location.origin}/reset-password`,
        },
        { headers: captchaHeaders(token) },
      );

      if (resetError) {
        setError(resetError.message || "Unable to send reset email");
        return;
      }

      setMessage("If an account exists for that email, a reset link has been sent.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send reset email");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
      <h1 className="text-2xl font-semibold text-slate-900">Forgot password</h1>
      {isRecaptchaEnabled ? null : (
        <p className="text-xs text-amber-700">reCAPTCHA disabled — set NEXT_PUBLIC_RECAPTCHA_SITE_KEY.</p>
      )}
      <label className="block space-y-1 text-sm">
        <span>Email</span>
        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-teal-700">{message}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send reset link"}
      </button>
      <p className="text-sm text-slate-600">
        <Link href="/login">Back to login</Link>
      </p>
    </form>
  );
}
