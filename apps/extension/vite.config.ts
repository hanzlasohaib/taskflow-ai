import path from "node:path";
import { crx } from "@crxjs/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

import manifest from "./manifest.config";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  process.env.VITE_API_URL = env.VITE_API_URL || "http://localhost:3000";
  process.env.VITE_APP_URL = env.VITE_APP_URL || "http://localhost:3000";

  return {
    plugins: [react(), crx({ manifest })],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    build: {
      outDir: "dist",
      emptyOutDir: true,
    },
    server: {
      cors: {
        origin: [/chrome-extension:\/\//],
      },
    },
  };
});
