# TaskFlow Chrome Extension (MV3)

Quick-add popup + email sign-in against the TaskFlow Next.js API. Load unpacked in Chrome Developer mode (not published to the Web Store in v1).

## Prerequisites

1. TaskFlow web API running (`pnpm dev:web` → `http://localhost:3000`).
2. In `apps/web/.env` (or `.env.local`):
   - `BETTER_AUTH_TRUSTED_ORIGINS=chrome-extension://akjpgdhgfhpppafgdfhaebceaklfgjcc`
   - Leave `RECAPTCHA_SECRET_KEY` empty for local extension sign-in (popup does not embed reCAPTCHA).
3. Copy `apps/extension/.env.example` → `apps/extension/.env` if needed (`VITE_API_URL` / `VITE_APP_URL`).

The extension ID is stable via the public `key` in `manifest.config.ts`.

## Install dependencies

From the monorepo root:

```bash
pnpm install
```

## Build / develop

```bash
# One-shot build → apps/extension/dist
pnpm build:extension

# Or watch mode (reload the extension in Chrome after changes)
pnpm dev:extension
```

## Load unpacked in Chrome

1. Open `chrome://extensions`.
2. Enable **Developer mode** (top-right).
3. Click **Load unpacked**.
4. Select `apps/extension/dist`.
5. Pin **TaskFlow** to the toolbar.

After rebuilds, click the refresh icon on the extension card.

## Demo checklist

1. Sign in with a verified TaskFlow account (same email/password as the web app).
2. Quick-add a task with a title + priority.
3. Confirm it appears under **Recent** and in the web app (`/tasks`).
4. Click a recent task to open `{VITE_APP_URL}/tasks/{id}`.

## Auth notes

- Session token is stored in `chrome.storage.session` (cleared when the browser session ends).
- API calls send `Authorization: Bearer <token>` (requires Better Auth `bearer()` on the server).
- If sign-in fails with a captcha/origin error, unset reCAPTCHA locally and confirm `BETTER_AUTH_TRUSTED_ORIGINS` matches the extension ID on `chrome://extensions`.
