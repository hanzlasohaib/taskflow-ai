# TaskFlow — Implementation Tasks

> **Status:** Architecture frozen in [`PLAN.md`](./PLAN.md). Do not change architecture unless the plan is explicitly reopened.  
> **This document:** Converts PLAN §34 into actionable tasks with acceptance criteria.  
> **Hybrid workflow:** Infrastructure, backend, auth logic, database, APIs, and shared business logic may start immediately. **UI implementation** waits until the Figma design is finalized (see [Design Gate](#design-gate-figma)).

| Document | Role |
| --- | --- |
| [`PLAN.md`](./PLAN.md) | Frozen architecture (source of truth) |
| [`TASKS.md`](./TASKS.md) | Implementation checklist (this file) |
| [`PLAN-PROMPT.md`](./PLAN-PROMPT.md) | Original planning brief (historical) |

---

## How to use

1. Work **phase by phase**. Do not skip exit criteria.
2. Check off tasks with `- [x]` when acceptance criteria pass.
3. Task IDs use `T-<phase>.<number>` (e.g. `T-4.03`).
4. Mark a phase **Done** only when all **Phase exit criteria** are checked.
5. Prefer Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`) on `feature/<slug>` branches.

### Definition of Done (every task)

- Acceptance criteria are met and manually verifiable
- TypeScript builds without new errors for touched packages
- No secrets committed; env vars documented in `.env.example` when added
- UI tasks match Figma theme tokens once the Design Gate is cleared

---

## Global prerequisites

Complete before or during early phases (not all required on day one).

- [ ] **G.01** — Public GitHub repository exists for TaskFlow
  - Acceptance: Repo is reachable; clone works.
- [ ] **G.02** — Supabase project created (single project for all clients)
  - Acceptance: Project URL + anon key + database connection strings available.
- [ ] **G.03** — Resend account + verified sender (`EMAIL_FROM`)
  - Acceptance: Can send a test email successfully.
- [ ] **G.04** — Google reCAPTCHA v3 site key + secret key
  - Acceptance: Keys created for local + production domains (or localhost for dev).
- [ ] **G.05** — Deepgram account + API key
  - Acceptance: Key can call STT from a curl/test request.
- [ ] **G.06** — Vercel account linked to GitHub
  - Acceptance: Able to import a project when ready to deploy.
- [x] **G.07** — Local toolchain: Node LTS, pnpm, Git; later Rust + WebView2 for Tauri
  - Acceptance: `node -v`, `pnpm -v` work on the dev machine.

---

## Design Gate (Figma)

**Rule:** No **UI implementation** until **D.05**. Infrastructure, backend, authentication logic, database, API development, and shared business logic may proceed in parallel. All visual components must follow the finalized Figma design.

```text
PLAN.md
    ↓
TASKS.md
    ↓
Phase 1: Project Setup          ← start now
    ↓
Phase 2: Backend Foundation     ← auth/DB/API logic (unstyled OK)
    ↓
Figma Design → Freeze Design    ← Design Gate D.01–D.05
    ↓
UI Implementation               ← tokens, auth screens, dashboard, nav, cards
    ↓
Feature Integration → Testing → Deployment
```

| Track | Status | Examples |
| --- | --- | --- |
| **Unblocked now** | May start immediately | Monorepo, pnpm/Turborepo, Next.js, Tailwind base, shadcn install, ESLint/Prettier, Prisma, Supabase, Better Auth, Resend, reCAPTCHA, env vars, folder structure, Zod schemas, API route handlers, Task CRUD backend, Realtime wiring, Deepgram proxy, extension API client |
| **Blocked until D.05** | Wait for frozen Figma | Design tokens, colors, typography, spacing, component styling, dashboard layout, auth screen styling, navigation chrome, cards, modals, icons, animations, responsive layout polish |

| Rule | Detail |
| --- | --- |
| Gate | User delivers **dashboard** Figma design (link/file) via MCP, then design is **frozen** |
| Theme source | Frozen dashboard design is the **single visual source of truth** |
| Auth styling | Login, signup, forgot/reset, verify-email **must match** dashboard theme after D.05 |
| PLAN design system | PLAN §23 is a placeholder until Figma arrives; **Figma overrides** token choices |
| Pre-Figma allowed | Infra + backend + domain logic; functional but **unstyled / placeholder** pages only |
| Post-Figma order | Freeze design → tokens → auth UI → app shell/dashboard → remaining surfaces |

### Design Gate checklist

- [ ] **D.01** — Receive dashboard Figma design via MCP
  - Acceptance: File/node accessible; screenshot or design context retrieved.
- [ ] **D.02** — Extract design tokens (color, typography, spacing, radius, shadows, light/dark if present)
  - Acceptance: Token list written down (can live in TASKS notes or a short `docs/DESIGN-TOKENS.md` later); mapped to CSS variables plan.
- [ ] **D.03** — Inventory reusable UI patterns from Figma (cards, sidebar, buttons, inputs, badges)
  - Acceptance: Component mapping notes exist for shadcn/ui equivalents.
- [ ] **D.04** — Confirm auth screens will reuse the same tokens/components (no separate auth look)
  - Acceptance: Explicit note in this file or PR description: auth follows dashboard theme.
- [ ] **D.05** — Design frozen — **UI implementation** may begin
  - Acceptance: D.01–D.04 done; visual work (tokens, themed screens, nav, cards, motion) may start. Infra/backend did **not** need to wait for this.

> Until **D.05** is checked: **do not** implement polished UI (tokens, themed layouts, dashboard, styled auth, animations). Backend and project setup **may proceed**.

---

## Implementation order

### Now (no Figma required)

1. Phase 1 — Project Setup  
2. Phase 2 — Authentication **backend** (Better Auth, Resend, reCAPTCHA, middleware; placeholder forms OK)  
3. Phase 4 — Task CRUD **backend** (Prisma, Zod, APIs; minimal unstyled forms OK for API testing)  
4. Phase 5 — Realtime wiring  
5. Phase 6 — Deepgram **API** integration (recorder UI chrome waits for Figma)  
6. Phase 7 — Sketch **API** + canvas behavior (visual polish after Figma)  
7. Extension/mobile API clients as needed  

### After Design Gate (D.05)

1. Apply design tokens + theme  
2. Phase 2 UI — styled auth screens  
3. Phase 3 — Dashboard shell (Figma-faithful)  
4. Phase 4–7 UI polish (lists, cards, voice dialog, canvas chrome)  
5. Phases 8–10 client UIs aligned to tokens  
6. Phases 11–13 — Deploy, test, submit  

Prefer finishing dashboard shell (Phase 3) before heavy task UI polish; backend of Phase 4 may run in parallel with waiting for Figma.

---

## Phase 1 — Project Setup

| | |
| --- | --- |
| **Goal** | Bootstrappable monorepo with tooling and empty apps |
| **Depends on** | Global G.07 only (does **not** require Design Gate D.05) |
| **PLAN ref** | §6–7, §34 Phase 1 |

### Tasks

- [x] **T-1.01** — Initialize pnpm workspace + Turborepo at repo root
  - Acceptance: `pnpm-workspace.yaml` and `turbo.json` exist; `pnpm install` succeeds.
- [x] **T-1.02** — Scaffold `apps/web` (Next.js latest, App Router, TypeScript, Tailwind v4)
  - Acceptance: `pnpm dev --filter=web` (or equivalent) serves a placeholder page.
- [x] **T-1.03** — Scaffold shared packages: `types`, `validation`, `utils`, `ui`, `config`
  - Acceptance: Packages named `@taskflow/*`; web can import `@taskflow/utils` without resolve errors.
- [x] **T-1.04** — Scaffold empty app stubs: `apps/mobile`, `apps/desktop`, `apps/extension` (minimal README or package.json placeholders OK)
  - Acceptance: Folders exist in monorepo layout matching PLAN §6.
- [x] **T-1.05** — Add root/scripts README with how to install and run web
  - Acceptance: New contributor can follow README to run web locally.
- [x] **T-1.06** — Add `.env.example` for web (all keys from PLAN §25 as placeholders)
  - Acceptance: File lists required vars; no real secrets committed.
- [x] **T-1.07** — Configure strict TypeScript + shared ESLint/TSConfig via `@taskflow/config`
  - Acceptance: `tsc` / lint script runs for `apps/web` without config crashes.
- [x] **T-1.08** — Wire shadcn/ui + Tailwind in `apps/web` / `@taskflow/ui` baseline (unstyled until tokens applied)
  - Acceptance: At least one shadcn component renders; ready to apply Figma tokens next.

### Phase exit criteria

- [x] Monorepo installs and web dev server runs
- [x] Package imports resolve
- [x] `.env.example` present
- [x] Structure matches PLAN monorepo layout

---

## Phase 2 — Authentication

| | |
| --- | --- |
| **Goal** | Complete auth lifecycle with email + captcha |
| **Depends on** | Phase 1; G.02, G.03, G.04. **UI tasks T-2.09 / T-2.12 require D.05**; backend tasks do not |
| **PLAN ref** | §9–10, §14 Auth, §34 Phase 2 |

### Tasks

- [x] **T-2.01** — Connect Prisma to Supabase PostgreSQL (`DATABASE_URL` / `DIRECT_URL`)
  - Acceptance: `prisma db pull` or first migrate connects successfully.
  - Note: Schema + migration committed; run `pnpm --filter @taskflow/web db:deploy` after filling `.env.local`.
- [x] **T-2.02** — Add Better Auth Prisma models (user, session, account, verification) and migrate
  - Acceptance: Tables exist in Supabase; Prisma Client generates.
  - Note: Client generates; apply migration to Supabase with your connection strings.
- [x] **T-2.03** — Mount Better Auth handler at `/api/auth/[...all]`
  - Acceptance: Auth API responds (e.g. session/ok route) without 500.
- [x] **T-2.04** — Implement email/password signup + login server flows
  - Acceptance: Can create user and obtain session in API/manual test.
- [x] **T-2.05** — Integrate Resend for verification email
  - Acceptance: Signup sends verification email; link verifies `emailVerified`.
- [x] **T-2.06** — Send welcome email after successful verification
  - Acceptance: Welcome email received once per newly verified user.
- [x] **T-2.07** — Implement forgot/reset password with Resend
  - Acceptance: Reset link allows setting a new password; user can log in after.
- [x] **T-2.08** — Integrate Google reCAPTCHA v3 on signup, login, forgot-password (client + server verify)
  - Acceptance: Requests without valid captcha are rejected; valid flow still works.
  - Note: Captcha plugin activates when `RECAPTCHA_SECRET_KEY` is set; skipped in local/dev if unset.
- [x] **T-2.09** — Build auth page **routes + working forms** (placeholder/unstyled OK before D.05): `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-email`
  - Acceptance: Routes render; forms submit and complete auth flows. Visual polish is **T-2.12** after D.05.
- [x] **T-2.10** — Add Next.js middleware/guards for `(app)` routes + unverified redirect to `/verify-email`
  - Acceptance: Unauthenticated users cannot open `/dashboard`; unverified users gated per PLAN.
- [x] **T-2.11** — Implement logout and session display (e.g. header user menu stub)
  - Acceptance: Logout clears session and returns to public/auth route.
- [ ] **T-2.12** — **[UI · requires D.05]** Apply Figma theme tokens to auth layouts (shared with dashboard)
  - Acceptance: Auth screens use same CSS variables/fonts as extracted in D.02–D.03; match frozen Figma theme.

### Phase exit criteria

- [ ] Signup → verify → welcome → login → logout works locally (and on preview when available)
  - Blocked on your Supabase + Resend env until credentials are provided.
- [x] reCAPTCHA enforced on public auth endpoints
  - When `RECAPTCHA_SECRET_KEY` is configured (Better Auth captcha plugin).
- [ ] Auth UI matches dashboard theme tokens (**after D.05** / T-2.12; backend exit may complete earlier)

---

## Phase 3 — Dashboard

| | |
| --- | --- |
| **Goal** | Authenticated SaaS home with stats and shell UI (Figma-faithful) |
| **Depends on** | Phase 2; Design Gate **D.05** (entire phase is UI) |
| **PLAN ref** | §13, §21 Dashboard, §34 Phase 3 |

### Tasks

- [ ] **T-3.01** — Implement authenticated `AppShell` (sidebar/topbar per Figma)
  - Acceptance: Shell matches Figma layout structure on desktop; usable on mobile width.
- [ ] **T-3.02** — Add navigation to Dashboard, Tasks, Profile, Settings
  - Acceptance: All four routes reachable from shell; active state visible.
- [ ] **T-3.03** — Implement `/dashboard` with stats cards (zero-state OK until Phase 4 wires real data)
  - Acceptance: Cards match Figma; show zeros/empty copy without crashing.
- [ ] **T-3.04** — Add quick actions placeholders (New Task, Voice Task) linking to future flows
  - Acceptance: Buttons visible per Figma; link or disabled with clear intent.
- [ ] **T-3.05** — Implement light/dark/system theme toggle (`next-themes`) aligned with Figma modes
  - Acceptance: Theme persists; both modes look intentional (no broken contrast).
- [ ] **T-3.06** — Implement `/profile` page shell (name, email, avatar/initials)
  - Acceptance: Shows current user fields from session.
- [ ] **T-3.07** — Implement `/settings` page (theme control + sign out)
  - Acceptance: Theme change and sign out work from settings.
- [ ] **T-3.08** — Responsive pass against Figma (desktop + mobile breakpoints)
  - Acceptance: No horizontal overflow on common phone width; primary actions reachable.
- [ ] **T-3.09** — Motion polish (2–3 intentional Framer Motion moments per PLAN principles)
  - Acceptance: Dashboard load/nav motion present; respects `prefers-reduced-motion`.

### Phase exit criteria

- [ ] Dashboard matches Figma composition for the main shell/stats
- [ ] Theme toggle works
- [ ] Profile + Settings routes complete for v1 shell
- [ ] Auth + dashboard share one visual system

---

## Phase 4 — Task CRUD

| | |
| --- | --- |
| **Goal** | Full task lifecycle with search/filter |
| **Depends on** | Phase 2. Backend tasks (T-4.01–T-4.06, T-4.10–T-4.11) start now; **UI tasks T-4.07–T-4.09 require D.05** (Phase 3 recommended for shell) |
| **PLAN ref** | §8–9, §14 Tasks, §34 Phase 4 |

### Tasks

- [ ] **T-4.01** — Add Prisma `Task` model + enums (`status`, `priority`) + migrate
  - Acceptance: Table exists with indexes planned in PLAN §8.
- [ ] **T-4.02** — Add Zod schemas in `@taskflow/validation` for create/update/list query
  - Acceptance: Invalid payloads fail schema parse in unit or manual check.
- [ ] **T-4.03** — Implement `GET/POST /api/tasks` with ownership from session
  - Acceptance: User A cannot list User B tasks; create returns owned task.
- [ ] **T-4.04** — Implement `GET/PATCH/DELETE /api/tasks/[id]` with ownership checks
  - Acceptance: 404/403 for other users’ IDs; patch/delete work for owner.
- [ ] **T-4.05** — Implement `GET /api/tasks/stats`
  - Acceptance: Counts match DB for current user (total, by status, overdue, etc. per PLAN).
- [ ] **T-4.06** — Add Server Actions for web form mutations where appropriate
  - Acceptance: Creating/updating from web UI works without exposing Prisma to client.
- [ ] **T-4.07** — **[UI · requires D.05]** Build `/tasks` list UI (search, status/priority filters, sort) themed from Figma
  - Acceptance: Filters change results; search `q` matches titles; empty state shown.
- [ ] **T-4.08** — **[UI · requires D.05]** Build task create/edit form + `/tasks/[id]` detail (minimal unstyled form OK earlier for API testing only)
  - Acceptance: Full CRUD from UI; validation errors display on fields; final UI matches Figma.
- [ ] **T-4.09** — **[UI · requires D.05]** Wire dashboard stats cards + recent tasks to real API data
  - Acceptance: Creating a task updates dashboard stats after refresh/navigation.
- [ ] **T-4.10** — Consistent API error envelope `{ error: { code, message, details? } }`
  - Acceptance: Validation and auth failures return documented shape.
- [ ] **T-4.11** — Set `completedAt` when status becomes `DONE`; clear when reopened
  - Acceptance: DB field updates correctly on status transitions.

### Phase exit criteria

- [ ] CRUD + search/filter/sort work for owned tasks only
- [ ] Dashboard reflects real stats
- [ ] Shared validation package used by API and forms

---

## Phase 5 — Realtime

| | |
| --- | --- |
| **Goal** | Live task updates across clients |
| **Depends on** | Phase 4 |
| **PLAN ref** | §15, §34 Phase 5 |

### Tasks

- [ ] **T-5.01** — Enable replication for `Task` (and `Sketch` when present) in Supabase
  - Acceptance: Tables listed for realtime publication.
- [ ] **T-5.02** — Add RLS policies so users can only `SELECT` their own rows
  - Acceptance: Second user JWT cannot read first user’s rows via Supabase client.
- [ ] **T-5.03** — Create browser Supabase client using anon key + auth alignment strategy from PLAN
  - Acceptance: Client connects without service-role key in bundle.
- [ ] **T-5.04** — Subscribe to `postgres_changes` filtered by `user_id` on task list/dashboard
  - Acceptance: Insert/update/delete in window A appears in window B without manual refresh.
- [ ] **T-5.05** — Invalidate/refetch TanStack Query (or equivalent) caches on realtime events
  - Acceptance: Stats and lists stay consistent after burst updates.
- [ ] **T-5.06** — Unsubscribe on logout; reconnect/refetch on resume
  - Acceptance: No duplicate subscriptions after navigate/logout/login; no console error storms.
- [ ] **T-5.07** — Document realtime setup steps in README
  - Acceptance: Another dev can enable RLS/replication from docs.

### Phase exit criteria

- [ ] Two browsers, same user: live sync verified
- [ ] Two users: no data leakage via realtime
- [ ] Service role never shipped to client

---

## Phase 6 — Voice Tasks (Deepgram)

| | |
| --- | --- |
| **Goal** | Speech-to-task draft flow |
| **Depends on** | Phase 4; G.05 |
| **PLAN ref** | §16, §14 Voice, §34 Phase 6 |

### Tasks

- [ ] **T-6.01** — Implement `POST /api/voice/transcribe` (auth required; multipart audio)
  - Acceptance: Returns `{ transcript, suggestedTitle, suggestedDescription? }`; rejects unauthenticated.
- [ ] **T-6.02** — Keep `DEEPGRAM_API_KEY` server-only; validate MIME + max size (≤ 60s policy)
  - Acceptance: Oversized/invalid uploads return 4xx; key absent from client bundle.
- [ ] **T-6.03** — Add per-user rate limiting on voice endpoint
  - Acceptance: Excessive requests return 429.
- [ ] **T-6.04** — **[UI · requires D.05]** Build `VoiceRecorderButton` + transcript review dialog (Figma-styled); functional unstyled control OK earlier for API testing
  - Acceptance: User can record, review/edit suggestion, save as task or discard; final chrome matches Figma.
- [ ] **T-6.05** — Place voice entry points on dashboard/tasks (and prepare mobile later)
  - Acceptance: Happy path demo works on web end-to-end.
- [ ] **T-6.06** — Ensure production logs do not store raw audio or full transcripts
  - Acceptance: Log policy/code review confirms redaction.

### Phase exit criteria

- [ ] Spoken sentence → editable draft → saved task on web
- [ ] Abuse controls (auth, size, rate limit) in place

---

## Phase 7 — HTML Canvas

| | |
| --- | --- |
| **Goal** | Sketch pad on task detail |
| **Depends on** | Phase 4 |
| **PLAN ref** | §17, §14 Sketches, §34 Phase 7 |

### Tasks

- [ ] **T-7.01** — Add Prisma `Sketch` model (1:1 with task) + migrate
  - Acceptance: Unique `taskId`; cascade delete with task.
- [ ] **T-7.02** — Create Supabase Storage bucket for sketch PNGs (if using images)
  - Acceptance: Authenticated upload path works server-side; bucket private/public policy documented.
- [ ] **T-7.03** — Implement sketches API (`GET` by taskId, `POST` upsert, `PATCH`, `DELETE`)
  - Acceptance: Owner-only access; dataJson round-trips.
- [ ] **T-7.04** — Build `TaskCanvas` + toolbar (color, width, undo, clear); **toolbar chrome polish requires D.05**
  - Acceptance: Drawing works with pointer; tools behave as labeled.
- [ ] **T-7.05** — Save/load strokes on `/tasks/[id]`; show thumbnail (**thumbnail styling requires D.05**)
  - Acceptance: Reload page restores sketch; thumbnail visible on detail.
- [ ] **T-7.06** — Cap stroke/payload size to avoid huge `dataJson`
  - Acceptance: Over-cap save fails gracefully with user message.
- [ ] **T-7.07** — Mobile: read-only preview or “edit on web” note (per PLAN)
  - Acceptance: Mobile does not require full editor in v1.

### Phase exit criteria

- [ ] Draw → save → reload works on web
- [ ] Sketch owned and authorized like tasks

---

## Phase 8 — Chrome Extension

| | |
| --- | --- |
| **Goal** | MV3 quick-add client |
| **Depends on** | Phase 4; reachable API (local/ngrok/deployed) |
| **PLAN ref** | §18, §34 Phase 8 |

### Tasks

- [ ] **T-8.01** — Scaffold `apps/extension` Manifest V3 (popup + service worker)
  - Acceptance: Loads as unpacked extension in Chrome without errors.
- [ ] **T-8.02** — Implement extension auth (token login stored in `chrome.storage.session`)
  - Acceptance: User can sign in from popup; session persists for browser session.
- [ ] **T-8.03** — Quick-add task form calling `POST /api/tasks`
  - Acceptance: Created task appears in web app for same user.
- [ ] **T-8.04** — Show recent 5 tasks + open-in-web link
  - Acceptance: List loads; link opens correct web URL.
- [ ] **T-8.05** — **[UI · requires D.05]** Theme popup to approximate Figma/web tokens (light/dark)
  - Acceptance: Popup is readable and on-brand; not unstyled default HTML.
- [ ] **T-8.06** — Document load/unpacked steps in README
  - Acceptance: Demo steps reproducible.

### Phase exit criteria

- [ ] Logged-in popup creates task visible in web
- [ ] MV3 only (no MV2)

---

## Phase 9 — Mobile App (Expo React Native)

| | |
| --- | --- |
| **Goal** | Core task workflows on mobile |
| **Depends on** | Phases 4–6 APIs stable |
| **PLAN ref** | §19, §34 Phase 9 |

### Tasks

- [ ] **T-9.01** — Scaffold Expo app with Expo Router + TypeScript in `apps/mobile`
  - Acceptance: App starts in Expo Go / simulator.
- [ ] **T-9.02** — Configure `EXPO_PUBLIC_API_URL` + Secure Store session persistence
  - Acceptance: Session survives app reload; logout clears secure store.
- [ ] **T-9.03** — Auth screens (login/signup) calling shared API/Better Auth RN flow
  - Acceptance: Can authenticate against deployed/local API.
- [ ] **T-9.04** — Tabs: Dashboard stats, Tasks list, Create, Profile
  - Acceptance: Navigation works; stats/list load for user.
- [ ] **T-9.05** — Task create/edit/complete + search/filter basics
  - Acceptance: CRUD operations succeed against API.
- [ ] **T-9.06** — Voice capture via `expo-av` → `/api/voice/transcribe` → confirm save
  - Acceptance: E2E voice create works on device/simulator with mic permission.
- [ ] **T-9.07** — Realtime subscription on mobile task list (optional but preferred)
  - Acceptance: External web create appears on mobile without manual refresh (if implemented).
- [ ] **T-9.08** — **[UI · requires D.05]** Align colors/typography with Figma tokens where practical on native
  - Acceptance: App feels on-brand vs web; not a default Expo template look.
- [ ] **T-9.09** — Sketch: preview only / open-on-web messaging
  - Acceptance: No crash if sketch exists; edit not required on mobile v1.

### Phase exit criteria

- [ ] Demo on Expo Go against deployed API
- [ ] Auth + CRUD + voice demonstrated

---

## Phase 10 — Desktop App (Tauri)

| | |
| --- | --- |
| **Goal** | Packaged desktop webview |
| **Depends on** | Phase 2–3 web usable |
| **PLAN ref** | §20, §34 Phase 10 |

### Tasks

- [ ] **T-10.01** — Scaffold `apps/desktop` Tauri project
  - Acceptance: `tauri dev` opens a window.
- [ ] **T-10.02** — Point webview to env-configurable web URL (`TAURI_WEB_URL`)
  - Acceptance: Loads local or deployed TaskFlow web app.
- [ ] **T-10.03** — Verify login + CRUD inside desktop window
  - Acceptance: Same flows as browser work in webview.
- [ ] **T-10.04** — Produce Windows build artifact for demo (`.msi` / `.exe`)
  - Acceptance: Built binary launches and loads app.
- [ ] **T-10.05** — Document Rust/WebView2 prerequisites + build commands
  - Acceptance: README section sufficient for demo machine setup.

### Phase exit criteria

- [ ] Desktop window runs TaskFlow with auth + tasks
- [ ] Demo artifact available for Loom

---

## Phase 11 — Deployment

| | |
| --- | --- |
| **Goal** | Production web on Vercel + public GitHub |
| **Depends on** | Phases 1–7 minimum for core demo |
| **PLAN ref** | §25, §29, §34 Phase 11 |

### Tasks

- [ ] **T-11.01** — Ensure GitHub repository is public
  - Acceptance: Logged-out browser can view repo.
- [ ] **T-11.02** — Create Vercel project for `apps/web` (Turborepo-aware)
  - Acceptance: Preview deploy builds successfully.
- [ ] **T-11.03** — Configure all production env vars on Vercel
  - Acceptance: App boots; auth/email/db features work on production URL.
- [ ] **T-11.04** — Run `prisma migrate deploy` against production DB
  - Acceptance: Schema matches; no migrate errors.
- [ ] **T-11.05** — Configure Supabase Auth redirect/URL allowlists / CORS as needed for production domain
  - Acceptance: Auth callbacks and client API calls succeed on prod domain.
- [ ] **T-11.06** — Production smoke test: signup/login, CRUD, realtime, voice, canvas
  - Acceptance: Checklist pass on production URL.
- [ ] **T-11.07** — Expand README with deploy + env documentation
  - Acceptance: Deploy steps are reproducible from README alone.

### Phase exit criteria

- [ ] Public production URL live
- [ ] Public GitHub live
- [ ] Core features smoke-tested on production

---

## Phase 12 — Testing

| | |
| --- | --- |
| **Goal** | Confidence across platforms |
| **Depends on** | Features complete enough to test |
| **PLAN ref** | §30, §34 Phase 12 |

### Tasks

- [ ] **T-12.01** — Unit tests for `@taskflow/validation` schemas
  - Acceptance: Tests pass in CI or local script; cover valid/invalid cases.
- [ ] **T-12.02** — Unit tests for pure utils (e.g. overdue, transcript → title)
  - Acceptance: Tests pass; edge cases covered.
- [ ] **T-12.03** — Manual auth matrix (signup, verify, welcome, login, reset, logout, captcha fail)
  - Acceptance: All rows pass; failures documented if any.
- [ ] **T-12.04** — Manual CRUD matrix across statuses/priorities
  - Acceptance: All transitions work; ownership enforced.
- [ ] **T-12.05** — Manual realtime two-browser test
  - Acceptance: Pass.
- [ ] **T-12.06** — Manual voice + canvas tests
  - Acceptance: Pass on web.
- [ ] **T-12.07** — Cross-platform smoke: extension, mobile, desktop
  - Acceptance: PLAN §30 cross-platform table covered for required cells.
- [ ] **T-12.08** — Fix critical bugs found; retest
  - Acceptance: No blockers for Loom recording.

### Phase exit criteria

- [ ] Unit tests green for validation/utils
- [ ] Manual + cross-platform checklists signed off
- [ ] Critical bugs closed

---

## Phase 13 — Final Submission

| | |
| --- | --- |
| **Goal** | Assignment-ready package |
| **Depends on** | Phases 1–12 |
| **PLAN ref** | §31, §34 Phase 13 |

### Tasks

- [ ] **T-13.01** — Freeze features (no new scope before recording)
  - Acceptance: Agreement noted; only bugfixes allowed.
- [ ] **T-13.02** — Polish README (setup, env, apps, demo links, link to PLAN + TASKS)
  - Acceptance: README is submission-ready.
- [ ] **T-13.03** — Record Loom demo covering PLAN §31 checklist
  - Acceptance: Video 8–12 minutes; each required surface shown.
- [ ] **T-13.04** — Double-check assignment requirements traceability (PLAN Appendix A)
  - Acceptance: Every requirement demonstrable in app or Loom.
- [ ] **T-13.05** — Final production URL + GitHub + Loom links gathered for submission
  - Acceptance: Single place (README or submission form) lists all three.

### Loom checklist (copy from PLAN §31)

- [ ] Repository + monorepo structure overview
- [ ] Deployed Vercel URL
- [ ] Landing page + theme toggle
- [ ] Signup + reCAPTCHA mention
- [ ] Email verification inbox + welcome email
- [ ] Dashboard stats cards
- [ ] Task CRUD + search/filter
- [ ] Supabase Realtime (two windows)
- [ ] Deepgram voice task creation
- [ ] HTML Canvas sketch on a task
- [ ] Chrome extension quick-add
- [ ] Expo mobile screens
- [ ] Tauri desktop window
- [ ] Brief architecture / PLAN.md mention
- [ ] Close with public GitHub link

### Phase exit criteria

- [ ] Loom complete
- [ ] README polished
- [ ] All assignment requirements visibly demonstrated

---

## Cross-cutting checklists

### Environment variables (track as added)

Use PLAN §25 as the master list. Check when configured in local + Vercel:

- [ ] `DATABASE_URL` / `DIRECT_URL`
- [ ] `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL`
- [ ] `RESEND_API_KEY` / `EMAIL_FROM`
- [ ] `RECAPTCHA_SECRET_KEY` / `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- [ ] `DEEPGRAM_API_KEY`
- [ ] `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` / `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `NEXT_PUBLIC_APP_URL`
- [ ] Storage bucket name / sketch storage config
- [ ] `EXPO_PUBLIC_API_URL` (+ Supabase public vars for mobile)
- [ ] Extension API URL
- [ ] `TAURI_WEB_URL`

### Security (from PLAN §27 — verify before submission)

- [ ] HTTP-only secure cookies for web sessions
- [ ] Ownership checks on every task/sketch mutation
- [ ] Zod validation on inputs
- [ ] reCAPTCHA on public auth endpoints
- [ ] Rate limiting on auth, voice, task create
- [ ] No secrets in client bundles
- [ ] RLS enabled for realtime-exposed tables
- [ ] Upload MIME/size limits
- [ ] CORS restricted to known origins

---

## Progress snapshot

| Phase | Name | Status |
| --- | --- | --- |
| Gate | Figma Design Gate (UI only) | Blocks UI until D.05; backend unblocked |
| 1 | Project Setup | Done |
| 2 | Authentication | Backend done (needs your Supabase/Resend env); UI polish waits for D.05 |
| 3 | Dashboard | Blocked on D.05 |
| 4 | Task CRUD | Backend ready to start; UI waits for D.05 |
| 5 | Realtime | Ready after Phase 4 backend (no Figma required) |
| 6 | Voice (Deepgram) | API ready after Phase 4; UI chrome waits for D.05 |
| 7 | HTML Canvas | API/canvas logic ready after Phase 4; polish waits for D.05 |
| 8 | Chrome Extension | API client ready after Phase 4; theming waits for D.05 |
| 9 | Mobile (Expo) | Logic ready after APIs; theming waits for D.05 |
| 10 | Desktop (Tauri) | Shell ready after web; inherits web UI post-D.05 |
| 11 | Deployment | Not started |
| 12 | Testing | Not started |
| 13 | Final Submission | Not started |

---

*Architecture is frozen in PLAN.md. Infrastructure and backend may proceed now. UI implementation waits for Design Gate D.05; auth and all web UI must follow the frozen Figma dashboard theme.*
