export type DownloadArtifact = {
  id: string;
  platform: "Windows" | "Android";
  title: string;
  description: string;
  fileName: string;
  /** Public path under /downloads/… */
  href: string;
  sizeLabel: string;
  version: string;
  recommended?: boolean;
};

/**
 * Installers served from `apps/web/public/downloads/`.
 * Rebuild + copy with `pnpm sync:downloads` after cutting a release.
 */
export const DOWNLOAD_ARTIFACTS: DownloadArtifact[] = [
  {
    id: "desktop-nsis",
    platform: "Windows",
    title: "Desktop installer (NSIS)",
    description: "Recommended Windows setup. Installs TaskFlow and creates a Start Menu shortcut.",
    fileName: "TaskFlow_0.8.0_x64-setup.exe",
    href: "/downloads/TaskFlow_0.8.0_x64-setup.exe",
    sizeLabel: "1.8 MB",
    version: "0.8.0",
    recommended: true,
  },
  {
    id: "desktop-msi",
    platform: "Windows",
    title: "Desktop installer (MSI)",
    description: "Enterprise-friendly Windows package for the same Tauri desktop shell.",
    fileName: "TaskFlow_0.8.0_x64_en-US.msi",
    href: "/downloads/TaskFlow_0.8.0_x64_en-US.msi",
    sizeLabel: "2.7 MB",
    version: "0.8.0",
  },
  {
    id: "mobile-apk",
    platform: "Android",
    title: "Android APK",
    description: "Sideload the Expo mobile app. Enable “Install unknown apps” for your browser/file manager.",
    fileName: "TaskFlow_0.7.0.apk",
    href: "/downloads/TaskFlow_0.7.0.apk",
    sizeLabel: "45 MB",
    version: "0.7.0",
    recommended: true,
  },
];
