# TaskFlow

AI-powered, cross-platform task management app (web, mobile, desktop, Chrome extension).

Architecture is frozen in [`docs/PLAN.md`](docs/PLAN.md). Implementation checklist: [`docs/TASKS.md`](docs/TASKS.md).

## Prerequisites

- Node.js 22+ (LTS)
- [pnpm](https://pnpm.io/) 9+ (`npm install -g pnpm`)

## Monorepo layout

```text
apps/
  web/         Next.js (App Router) — primary web app + API host
  mobile/      Expo stub (Phase 9)
  desktop/     Tauri stub (Phase 10)
  extension/   Chrome MV3 quick-add (Phase 8)
packages/
  config/      Shared TSConfig / ESLint
  types/       Shared domain types
  utils/       Pure helpers
  validation/  Zod schemas
  ui/          Shared web UI primitives (shadcn-style baseline)
docs/
  PLAN.md
  TASKS.md
```

## Setup

```bash
pnpm install
```

Copy env template for the web app:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Fill in values when you reach Phase 2+ (Supabase, Better Auth, Resend, etc.).

## Develop (web)

```bash
pnpm dev:web
```

Open [http://localhost:3000](http://localhost:3000).

Or run all app `dev` scripts via Turborepo:

```bash
pnpm dev
```

## Other scripts

| Command | Description |
| --- | --- |
| `pnpm build` | Build all packages/apps |
| `pnpm lint` | Lint via Turborepo |
| `pnpm typecheck` | Typecheck via Turborepo |
| `pnpm format` | Format with Prettier |

## Authentication setup (Phase 2)

1. Create a Supabase project and copy the Postgres connection strings into `apps/web/.env.local` (`DATABASE_URL` + `DIRECT_URL`).
2. Set `BETTER_AUTH_SECRET` (e.g. `openssl rand -base64 32`) and `BETTER_AUTH_URL` / `NEXT_PUBLIC_APP_URL`.
3. Add Resend (`RESEND_API_KEY`, `EMAIL_FROM`) for verification, welcome, and password-reset emails.
4. Optionally add Google reCAPTCHA v3 keys. If unset, captcha is skipped for local development.
5. Apply migrations:

```bash
pnpm --filter @taskflow/web db:deploy
# or during local iteration:
pnpm --filter @taskflow/web db:migrate
```

6. Run the web app and exercise `/signup`, email verify, `/login`, `/forgot-password`.

## Design / UI note

Auth, dashboard, and tasks share the frozen Figma Make theme tokens (`apps/web/app/globals.css`). Guest mode at `/` uses the same shell with a Guest Mode badge and soft-gates for account-only features.

## Avatars (Supabase Storage)

1. Create a **private** Storage bucket named `avatars` (or set `AVATARS_BUCKET`).
2. Set a **1 MB** file size limit on the bucket (matches app validation).
3. Set `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.
4. Profile → Edit Photo uploads a cropped 256×256 WEBP to `{userId}/avatar.webp` (upsert).
5. `User.image` stores only the **object path** (`{userId}/avatar.webp`). At read time the server mints a short-lived signed URL for the browser — never persist signed or public URLs.

## Realtime setup (Phase 5)

Task list and dashboard stay live across tabs via Supabase Realtime (`postgres_changes` on `"task"`). CRUD still goes through the Next.js API / Prisma; the browser only **subscribes**.

### 1. Env

In `apps/web/.env.local`:

| Variable | Where to find it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API → `anon` `public` key |
| `SUPABASE_JWT_SECRET` | Project Settings → API → JWT Secret (**server-only**) |

Never put `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_JWT_SECRET` in client code or `NEXT_PUBLIC_*` vars.

### 2. Apply migration (RLS + publication)

```bash
pnpm --filter @taskflow/web db:deploy
```

This migration:

- Enables RLS on `"task"` with `SELECT` only when `(auth.jwt() ->> 'sub') = "userId"`
- Grants `SELECT` to `authenticated` / `anon` (RLS still filters rows)
- Adds `"task"` to the `supabase_realtime` publication

Prisma writes use the DB URL (bypasses RLS). Realtime clients use a short-lived JWT minted by `GET /api/realtime/token` after a Better Auth session check (`sub` = Better Auth user id).

### 3. Verify in Supabase Dashboard (optional)

- **Database → Publications**: `"task"` listed under `supabase_realtime`
- **Authentication is not required** for TaskFlow users (Better Auth owns sessions); Realtime auth is the custom JWT above

### 4. Manual tests

1. **Same user, two browsers** — sign in as the same account in two windows; create/edit/delete a task in A; B should update without a manual refresh.
2. **Two users** — sign in as user B in another browser; B must not see user A’s tasks via list UI or realtime (RLS + `userId` filter).

## Voice tasks (Phase 6)

Speech-to-task uses Deepgram via a server proxy. The API key never ships to the browser.

### 1. Env

In `apps/web/.env.local`:

| Variable | Notes |
| --- | --- |
| `DEEPGRAM_API_KEY` | Deepgram console → API key (**server-only**) |

### 2. Happy path

1. Sign in, allow microphone access when prompted.
2. Open **Voice Task** from the dashboard, sidebar, or Tasks page.
3. Record up to **60 seconds**, stop, wait for transcription.
4. Edit the suggested title/description, then **Save task** (or Discard).

Limits: authenticated only; max **5 MB** audio; **10** transcribe requests per user per minute. Production logs record `userId` / size / status only — never raw audio or full transcripts.

## Task sketches (Phase 7)

Each task can have one freehand sketch pad on `/tasks/[id]`. Strokes live in Postgres (`dataJson`); an optional PNG snapshot goes to Supabase Storage for thumbnails / future mobile preview.

### 1. Migrate

```bash
pnpm --filter @taskflow/web db:deploy
```

This creates the `sketch` table (1:1 with `task`), enables RLS for Realtime, and publishes `"sketch"` to `supabase_realtime`.

### 2. Storage (optional PNG)

1. Create a **private** Storage bucket named `sketches` (or set `BLOB_OR_STORAGE_BUCKET`).
2. Set a **1 MB** file size limit on the bucket.
3. Ensure `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are set (same as avatars).

Without the bucket, stroke save/load still works; PNG upload is skipped with a storage/config error only when a file is sent and storage is misconfigured. The client still generates a PNG on save when possible.

### 3. Happy path

1. Open a task detail page.
2. Draw on the Sketch canvas (color, width, undo, clear).
3. **Save sketch**, then hard-reload — strokes restore.
4. Caps: ≤ 256 KB JSON, 500 strokes, 20k points total.

**Mobile (Phase 9):** full canvas edit stays on web; mobile should show a read-only preview (or “edit on web”) when that app lands.

## License

Private / internship project unless otherwise stated.
