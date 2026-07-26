"use client";

import { QRCodeSVG } from "qrcode.react";
import { useState, type FormEvent } from "react";

import {
  authErrorClass,
  authInputClass,
  authLabelClass,
  authMutedClass,
  authPrimaryButtonClass,
  authSecondaryButtonClass,
  authSuccessClass,
} from "@/components/auth/auth-styles";
import { Switch } from "@/components/ui/switch";
import { authClient, useSession } from "@/lib/auth-client";

type EnrollState = {
  totpURI: string;
  backupCodes: string[];
  secret: string;
};

function extractSecret(totpURI: string): string {
  try {
    const url = new URL(totpURI);
    return url.searchParams.get("secret") ?? "";
  } catch {
    return "";
  }
}

export function TwoFactorSettings() {
  const { data: session, isPending: sessionPending, refetch } = useSession();
  const enabled = Boolean(
    session?.user && "twoFactorEnabled" in session.user && session.user.twoFactorEnabled,
  );

  const [password, setPassword] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [enroll, setEnroll] = useState<EnrollState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showDisable, setShowDisable] = useState(false);
  const [showEnable, setShowEnable] = useState(false);

  async function startEnable(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);

    try {
      const { data, error: enableError } = await authClient.twoFactor.enable({
        password,
      });

      if (enableError || !data) {
        setError(enableError?.message || "Unable to start 2FA setup");
        return;
      }

      setEnroll({
        totpURI: data.totpURI,
        backupCodes: data.backupCodes,
        secret: extractSecret(data.totpURI),
      });
      setPassword("");
      setMessage("Scan the QR code, save your backup codes, then enter a code to finish.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start 2FA setup");
    } finally {
      setPending(false);
    }
  }

  async function confirmEnable(event: FormEvent) {
    event.preventDefault();
    if (!enroll) return;
    setPending(true);
    setError(null);
    setMessage(null);

    try {
      const { error: verifyError } = await authClient.twoFactor.verifyTotp({
        code: verifyCode.trim(),
      });

      if (verifyError) {
        setError(verifyError.message || "Invalid authenticator code");
        return;
      }

      setEnroll(null);
      setVerifyCode("");
      setShowEnable(false);
      setMessage("Two-factor authentication is now enabled.");
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to verify code");
    } finally {
      setPending(false);
    }
  }

  async function disableTwoFactor(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);

    try {
      const { error: disableError } = await authClient.twoFactor.disable({
        password,
      });

      if (disableError) {
        setError(disableError.message || "Unable to disable 2FA");
        return;
      }

      setPassword("");
      setShowDisable(false);
      setEnroll(null);
      setMessage("Two-factor authentication has been disabled.");
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to disable 2FA");
    } finally {
      setPending(false);
    }
  }

  function onToggle(checked: boolean) {
    setError(null);
    setMessage(null);
    setPassword("");
    if (checked) {
      setShowDisable(false);
      setShowEnable(true);
      setEnroll(null);
    } else if (enabled) {
      setShowDisable(true);
      setShowEnable(false);
      setEnroll(null);
    } else {
      setShowDisable(false);
      setShowEnable(false);
      setEnroll(null);
    }
  }

  if (sessionPending) {
    return (
      <p className={authMutedClass}>Loading security settings…</p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-foreground">Two-Factor Authentication</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Protect your account with an authenticator app and backup codes. Required on web login
            when enabled (mobile/extension challenge UI is not included yet).
          </p>
          {enabled ? (
            <p className={`mt-2 ${authSuccessClass}`}>Enabled on this account.</p>
          ) : (
            <p className={`mt-2 ${authMutedClass}`}>Currently disabled.</p>
          )}
        </div>
        <Switch
          checked={enabled || showEnable || Boolean(enroll) || showDisable}
          onCheckedChange={onToggle}
          aria-label="Toggle two-factor authentication"
        />
      </div>

      {error ? <p className={authErrorClass}>{error}</p> : null}
      {message ? <p className={authSuccessClass}>{message}</p> : null}

      {!enabled && showEnable && !enroll ? (
        <form onSubmit={startEnable} className="space-y-3 rounded-xl border border-border bg-foreground/3 p-4">
          <p className="text-xs text-muted-foreground">
            Enter your password to generate a QR code and backup codes.
          </p>
          <label className={authLabelClass}>
            <span>Current password</span>
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
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={pending} className={authPrimaryButtonClass}>
              {pending ? "Starting…" : "Begin setup"}
            </button>
            <button
              type="button"
              className={authSecondaryButtonClass}
              onClick={() => {
                setShowEnable(false);
                setPassword("");
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {enroll ? (
        <div className="space-y-4 rounded-xl border border-border bg-foreground/3 p-4">
          <div className="flex flex-col items-start gap-4 sm:flex-row">
            <div className="rounded-xl bg-white p-3">
              <QRCodeSVG value={enroll.totpURI} size={160} level="M" />
            </div>
            <div className="min-w-0 space-y-2 text-xs text-muted-foreground">
              <p>Scan with Google Authenticator, 1Password, or Authy.</p>
              {enroll.secret ? (
                <p>
                  Manual secret:{" "}
                  <code className="break-all text-foreground">{enroll.secret}</code>
                </p>
              ) : null}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Backup codes</p>
            <p className="mb-2 text-xs text-muted-foreground">
              Store these somewhere safe. Each code works once.
            </p>
            <ul className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-card p-3 font-mono text-xs text-foreground">
              {enroll.backupCodes.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <button
              type="button"
              className={`${authSecondaryButtonClass} mt-2`}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(enroll.backupCodes.join("\n"));
                  setMessage("Backup codes copied to clipboard.");
                } catch {
                  setError("Unable to copy backup codes");
                }
              }}
            >
              Copy backup codes
            </button>
          </div>

          <form onSubmit={confirmEnable} className="space-y-3">
            <label className={authLabelClass}>
              <span>Enter a code from your app to finish</span>
              <input
                className={authInputClass}
                type="text"
                required
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                autoComplete="one-time-code"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button type="submit" disabled={pending} className={authPrimaryButtonClass}>
                {pending ? "Verifying…" : "Confirm and enable"}
              </button>
              <button
                type="button"
                className={authSecondaryButtonClass}
                onClick={() => {
                  setEnroll(null);
                  setVerifyCode("");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {enabled && showDisable ? (
        <form onSubmit={disableTwoFactor} className="space-y-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-xs text-muted-foreground">
            Enter your password to turn off two-factor authentication.
          </p>
          <label className={authLabelClass}>
            <span>Current password</span>
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
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-destructive/40 bg-destructive/10 px-4 text-sm font-medium text-destructive transition-all hover:bg-destructive/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
            >
              {pending ? "Disabling…" : "Disable 2FA"}
            </button>
            <button
              type="button"
              className={authSecondaryButtonClass}
              onClick={() => {
                setShowDisable(false);
                setPassword("");
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {enabled && !showDisable ? (
        <button type="button" className={authSecondaryButtonClass} onClick={() => setShowDisable(true)}>
          Disable two-factor authentication
        </button>
      ) : null}
    </div>
  );
}
