"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";

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
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { captchaHeaders, getRecaptchaToken, isRecaptchaEnabled } from "@/lib/recaptcha";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const token = await getRecaptchaToken("login");
      const { error: signInError } = await authClient.signIn.email(
        { email, password },
        { headers: captchaHeaders(token) },
      );

      if (signInError) {
        setError(signInError.message || "Unable to sign in");
        return;
      }

      router.push(nextPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={authCardClass}>
      <div className="space-y-1">
        <h1 className={authTitleClass} style={{ fontFamily: "var(--font-display)" }}>
          Log in
        </h1>
        <p className={authMutedClass}>Welcome back to your workspace.</p>
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
      <label className={authLabelClass}>
        <span>Password</span>
        <input
          className={authInputClass}
          type="password"
          required
          minLength={8}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      {error ? <p className={authErrorClass}>{error}</p> : null}
      <button type="submit" disabled={pending} className={authPrimaryButtonClass}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <p className={authMutedClass}>
        No account?{" "}
        <Link href="/signup" className={authLinkClass}>
          Sign up
        </Link>{" "}
        ·{" "}
        <Link href="/forgot-password" className={authLinkClass}>
          Forgot password
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className={authCardClass}>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
