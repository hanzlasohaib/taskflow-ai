"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import {
  authCardClass,
  authErrorClass,
  authInputClass,
  authLabelClass,
  authLinkClass,
  authMutedClass,
  authPrimaryButtonClass,
  authTitleClass,
  authWarningClass,
} from "@/components/auth/auth-styles";
import { authClient } from "@/lib/auth-client";
import { captchaHeaders, getRecaptchaToken, isRecaptchaEnabled } from "@/lib/recaptcha";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setPending(true);
    try {
      const token = await getRecaptchaToken("signup");
      const { error: signUpError } = await authClient.signUp.email(
        {
          name,
          email,
          password,
          callbackURL: "/dashboard",
        },
        { headers: captchaHeaders(token) },
      );

      if (signUpError) {
        setError(signUpError.message || "Unable to sign up");
        return;
      }

      router.push("/verify-email");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign up");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={authCardClass}>
      <div className="space-y-1">
        <h1 className={authTitleClass} style={{ fontFamily: "var(--font-display)" }}>
          Sign up
        </h1>
        <p className={authMutedClass}>Create your TaskFlow workspace.</p>
      </div>
      {isRecaptchaEnabled ? null : (
        <p className={authWarningClass}>reCAPTCHA disabled — set NEXT_PUBLIC_RECAPTCHA_SITE_KEY.</p>
      )}
      <label className={authLabelClass}>
        <span>Name</span>
        <input
          className={authInputClass}
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
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
      <label className={authLabelClass}>
        <span>Password</span>
        <input
          className={authInputClass}
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <label className={authLabelClass}>
        <span>Confirm password</span>
        <input
          className={authInputClass}
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </label>
      {error ? <p className={authErrorClass}>{error}</p> : null}
      <button type="submit" disabled={pending} className={authPrimaryButtonClass}>
        {pending ? "Creating account…" : "Create account"}
      </button>
      <p className={authMutedClass}>
        Already have an account?{" "}
        <Link href="/login" className={authLinkClass}>
          Log in
        </Link>
      </p>
    </form>
  );
}
