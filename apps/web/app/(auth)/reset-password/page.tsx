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
} from "@/components/auth/auth-styles";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const errorParam = searchParams.get("error");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(
    errorParam === "INVALID_TOKEN" ? "Reset link is invalid or expired." : null,
  );
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError("Missing reset token");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setPending(true);
    try {
      const { error: resetError } = await authClient.resetPassword({
        newPassword: password,
        token,
      });

      if (resetError) {
        setError(resetError.message || "Unable to reset password");
        return;
      }

      router.push("/login");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reset password");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={authCardClass}>
      <div className="space-y-1">
        <h1 className={authTitleClass} style={{ fontFamily: "var(--font-display)" }}>
          Reset password
        </h1>
        <p className={authMutedClass}>Choose a new password for your account.</p>
      </div>
      <label className={authLabelClass}>
        <span>New password</span>
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
      <button type="submit" disabled={pending || !token} className={authPrimaryButtonClass}>
        {pending ? "Saving…" : "Update password"}
      </button>
      <p className={authMutedClass}>
        <Link href="/login" className={authLinkClass}>
          Back to login
        </Link>
      </p>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className={authCardClass}>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
