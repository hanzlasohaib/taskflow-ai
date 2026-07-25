# TaskFlow Mobile (Expo)

Expo React Native app for core TaskFlow workflows: auth, dashboard stats, task CRUD, voice create, realtime list updates, and sketch open-on-web.

## Prerequisites

1. TaskFlow web API running (`pnpm dev:web` → `http://localhost:3000`).
2. For a **physical device / Expo Go**, use your machine’s LAN IP (not `localhost`):
   - `EXPO_PUBLIC_API_URL=http://192.168.x.x:3000`
   - Ensure the phone is on the same Wi‑Fi and the Next.js server is reachable on that IP.
3. In `apps/web/.env` (or `.env.local`):
   - Leave `RECAPTCHA_SECRET_KEY` empty for local mobile sign-in/sign-up (no reCAPTCHA on mobile).
   - If Better Auth rejects the request origin, add your LAN API origin to `BETTER_AUTH_TRUSTED_ORIGINS`.
4. Copy `.env.example` → `.env` and fill Supabase public values for realtime (same as web).

### Android native build (`expo run:android`)

Phase 9 demos can use **Expo Go** (`pnpm dev:mobile`) — no Android SDK required.

For a native debug build (`npx expo run:android`):

1. Install [Android Studio](https://developer.android.com/studio) with an SDK (usually `C:\Users\<you>\AppData\Local\Android\Sdk`).
2. Either set a user env var `ANDROID_HOME` to that path, **or** create `apps/mobile/android/local.properties` (gitignored):

```properties
sdk.dir=C:/Users/<you>/AppData/Local/Android/Sdk
```

3. Use **JDK 17** (not 21/25). JDK 25 breaks CMake with  
   `WARNING: A restricted method in java.lang.System has been called` on  
   `:react-native-screens:configureCMakeDebug` / `:react-native-worklets:configureCMakeDebug`.
   - Install Temurin 17 (e.g. `winget install EclipseAdoptium.Temurin.17.JDK`).
   - Point Gradle at it in `%USERPROFILE%\.gradle\gradle.properties`:

```properties
org.gradle.java.home=C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.19.10-hotspot
```

   - Or for one terminal session:

```powershell
$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot"
$env:Path="$env:JAVA_HOME\bin;$env:Path"
cd android; .\gradlew.bat --stop; cd ..
npx expo run:android
```

4. Start an emulator or plug in a device with USB debugging, then rerun `npx expo run:android`.

## Setup

```bash
# from repo root
pnpm install
cp apps/mobile/.env.example apps/mobile/.env
# edit apps/mobile/.env
pnpm dev:mobile
```

Then open in Expo Go (scan QR) or press `a` / `i` for an emulator.

## Environment

| Variable | Purpose |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | Next.js API base (LAN IP for devices) |
| `EXPO_PUBLIC_APP_URL` | Web app for forgot password, verify email, sketch edit |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL (realtime) |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (realtime) |

## Auth notes

- Session token is stored in **expo-secure-store** and survives reloads.
- API calls send `Authorization: Bearer <token>` (requires Better Auth `bearer()` on the server).
- Email verification and password reset open in the system browser against the web app.
- Logout clears Secure Store (best-effort server sign-out).

## Features (v1)

- Login / signup
- Tabs: Dashboard, Tasks (search/filter), Create (form + voice), Profile
- Task detail: edit, complete, delete
- Voice: `expo-av` → `POST /api/voice/transcribe` → confirm save
- Realtime: Supabase channel refreshes task list / stats
- Sketch: preview image when available; otherwise “Edit sketch on web”

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev:mobile` | Start Expo from monorepo root |
| `pnpm --filter @taskflow/mobile typecheck` | TypeScript check |
