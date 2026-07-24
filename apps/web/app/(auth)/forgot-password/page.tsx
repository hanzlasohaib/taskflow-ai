"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import {
  authCardClass,
  authErrorClass,
  authInputClass,
  authLabelClass,
  authLinkClass,
  authMutedClass,
  authPrimaryButtonClass,
  authSuccessClass,
  authTitleClass,
  authWarningClass,
} from "@/components/auth/auth-styles";
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
    <form onSubmit={onSubmit} className={authCardClass}>
      <div className="space-y-1">
        <h1 className={authTitleClass} style={{ fontFamily: "var(--font-display)" }}>
          Forgot password
        </h1>
        <p className={authMutedClass}>We&apos;ll email you a reset link.</p>
      </div>
      {isRecaptchaEnabled ? null : (
        <p className={authWarningClass}>reCAPTCHA disabled — set NEXT_PUBLIC_RECAPTCHA_SITE_KEY.</p>
      )}
      <label className={authLabelClass}>
        <span>Email</span>
        <input
          className={authInputClass}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      {error ? <p className={authErrorClass}>{error}</p> : null}
      {message ? <p className={authSuccessClass}>{message}</p> : null}
      <button type="submit" disabled={pending} className={authPrimaryButtonClass}>
        {pending ? "Sending…" : "Send reset link"}
      </button>
      <p className={authMutedClass}>
        <Link href="/login" className={authLinkClass}>
          Back to login
        </Link>
      </p>
    </form>
  );
}
