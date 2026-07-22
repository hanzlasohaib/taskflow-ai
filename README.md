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

## Design / UI note

Infrastructure and backend can proceed now. **UI theming** (tokens, dashboard, styled auth) waits until the Figma dashboard design is frozen (Design Gate **D.05** in `docs/TASKS.md`).

## License

Private / internship project unless otherwise stated.
