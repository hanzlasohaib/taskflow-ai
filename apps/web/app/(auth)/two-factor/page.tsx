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

function TwoFactorForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams?.get("next") || "/dashboard";

  const [code, setCode] = useState("");
  const [useBackup, setUseBackup] = useState(false);
  const [trustDevice, setTrustDevice] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const trimmed = code.trim();
      const result = useBackup
        ? await authClient.twoFactor.verifyBackupCode({
            code: trimmed,
            trustDevice,
          })
        : await authClient.twoFactor.verifyTotp({
            code: trimmed,
            trustDevice,
          });

      if (result.error) {
        setError(result.error.message || "Invalid verification code");
        return;
      }

      router.push(nextPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to verify code");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={authCardClass}>
      <div className="space-y-1">
        <h1 className={authTitleClass} style={{ fontFamily: "var(--font-display)" }}>
          Two-factor verification
        </h1>
        <p className={authMutedClass}>
          {useBackup
            ? "Enter one of your backup recovery codes."
            : "Enter the 6-digit code from your authenticator app."}
        </p>
      </div>

      <label className={authLabelClass}>
        <span>{useBackup ? "Backup code" : "Authentication code"}</span>
        <input
          className={authInputClass}
          type="text"
          required
          autoComplete="one-time-code"
          inputMode={useBackup ? "text" : "numeric"}
          pattern={useBackup ? undefined : "[0-9]{6}"}
          maxLength={useBackup ? 32 : 6}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoFocus
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={trustDevice}
          onChange={(e) => setTrustDevice(e.target.checked)}
          className="size-4 rounded border-border"
        />
        Trust this device for 30 days
      </label>

      {error ? <p className={authErrorClass}>{error}</p> : null}

      <button type="submit" disabled={pending} className={authPrimaryButtonClass}>
        {pending ? "Verifying…" : "Verify"}
      </button>

      <p className={authMutedClass}>
        <button
          type="button"
          className={authLinkClass}
          onClick={() => {
            setUseBackup((v) => !v);
            setCode("");
            setError(null);
          }}
        >
          {useBackup ? "Use authenticator code" : "Use a backup code"}
        </button>
        {" · "}
        <Link href="/login" className={authLinkClass}>
          Back to login
        </Link>
      </p>
    </form>
  );
}

export default function TwoFactorPage() {
  return (
    <Suspense
      fallback={
        <div className={authCardClass}>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      }
    >
      <TwoFactorForm />
    </Suspense>
  );
}
