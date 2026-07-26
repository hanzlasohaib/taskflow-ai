# Public download artifacts

Files here are served at `https://<your-vercel-host>/downloads/<filename>` and listed on `/downloads`.

Rebuild and copy installers:

```bash
# Desktop (Windows)
$env:TAURI_WEB_URL = "https://taskflow-ai.vercel.app"
pnpm build:desktop
pnpm sync:downloads

# Mobile (Android release APK)
# On Windows, build from a short path (e.g. D:\tf) with node-linker=hoisted —
# the long DKS path exceeds CreateProcess MAX_PATH inside Gradle/CMake.
$env:EXPO_PUBLIC_API_URL = "https://taskflow-ai.vercel.app"
$env:EXPO_PUBLIC_APP_URL = "https://taskflow-ai.vercel.app"
$env:NODE_ENV = "production"
cd apps/mobile/android
.\gradlew.bat assembleRelease
cd ../../..
pnpm sync:downloads
```


Expected filenames (keep in sync with `apps/web/lib/downloads.ts`):

- `TaskFlow_0.8.0_x64-setup.exe`
- `TaskFlow_0.8.0_x64_en-US.msi`
- `TaskFlow_0.7.0.apk`
