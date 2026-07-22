"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";

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
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
      <h1 className="text-2xl font-semibold text-slate-900">Log in</h1>
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
      <label className="block space-y-1 text-sm">
        <span>Password</span>
        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-sm text-slate-600">
        No account? <Link href="/signup">Sign up</Link> ·{" "}
        <Link href="/forgot-password">Forgot password</Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
      <LoginForm />
    </Suspense>
  );
}
