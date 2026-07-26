# TaskFlow Desktop (Tauri)

Native Windows shell that loads the TaskFlow **web app** in a Tauri 2 webview (ADR-006). No duplicate UI — login and CRUD are the same Next.js surfaces as the browser.

## Prerequisites

1. **Node.js 22+** and **pnpm 9+** (monorepo root).
2. **Rust** (stable) via [rustup](https://rustup.rs/):

   ```powershell
   winget install --id Rustlang.Rustup -e
   # reopen the terminal, then:
   rustc --version
   cargo --version
   ```

3. **MSVC C++ build tools** (Windows):
   - Install [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with workload **Desktop development with C++**, **or**
   - Full Visual Studio with the same C++ workload.
   - If `link.exe` / `cl.exe` are not on `PATH`, open a **x64 Native Tools** prompt, or run once:

     ```powershell
     & "${env:ProgramFiles(x86)}\Microsoft Visual Studio\2022\BuildTools\Common7\Tools\VsDevCmd.bat" -arch=x64
     ```
4. **WebView2 Runtime** — preinstalled on most Windows 10/11 machines. If the app fails to open a webview, install the [Evergreen Runtime](https://developer.microsoft.com/microsoft-edge/webview2/).
5. TaskFlow **web** reachable at the URL you configure (local `pnpm dev:web` or a deployed URL).

## Setup

```bash
# from repo root
pnpm install
cp apps/desktop/.env.example apps/desktop/.env
# optional: set TAURI_WEB_URL to a deployed app
```

## Develop

Start the web app (if using localhost), then the desktop shell:

```bash
pnpm dev:web
# other terminal
pnpm dev:desktop
```

`tauri dev` opens a **TaskFlow** window pointed at `TAURI_WEB_URL` (default `http://localhost:3000`).

## Environment

| Variable | Purpose |
| --- | --- |
| `TAURI_WEB_URL` | Absolute `http(s)` URL loaded in the webview |

Loaded from `apps/desktop/.env` at runtime (via `dotenvy`). Override in the shell if needed:

```powershell
$env:TAURI_WEB_URL = "https://your-deployment.example"
pnpm dev:desktop
```

## Smoke test (login + CRUD)

1. `pnpm dev:web` and `pnpm dev:desktop`.
2. In the desktop window: sign up / log in (same as browser).
3. Create, edit, complete, and delete a task.
4. Confirm session cookies work against the web origin (no separate desktop auth).

## Windows demo build

```bash
# from repo root — set production URL for a packaged demo
# PowerShell:
$env:TAURI_WEB_URL = "https://your-production-url"
pnpm build:desktop
```

Artifacts (typical paths):

- NSIS installer: `apps/desktop/src-tauri/target/release/bundle/nsis/TaskFlow_*_x64-setup.exe`
- MSI: `apps/desktop/src-tauri/target/release/bundle/msi/TaskFlow_*_x64_en-US.msi`
- Raw exe: `apps/desktop/src-tauri/target/release/taskflow-desktop.exe`

Launch the installer or exe and confirm the window loads the configured web URL.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev:desktop` | `tauri dev` from monorepo root |
| `pnpm build:desktop` | Release Windows bundles (NSIS + MSI) |
| `pnpm --filter @taskflow/desktop tauri -- info` | Print Tauri / host environment |

## Architecture notes

- Window title: **TaskFlow**
- No Rust business logic in v1 — webview only
- Future: tray quick-add, global hotkey, local notifications (see `docs/PLAN.md` §20)
