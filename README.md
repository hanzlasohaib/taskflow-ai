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
  extension/   Chrome MV3 stub (Phase 8)
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

## License

Private / internship project unless otherwise stated.
