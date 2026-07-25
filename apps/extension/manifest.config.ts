import { defineManifest } from "@crxjs/vite-plugin";

/**
 * Dev public key — keeps a stable unpacked extension ID:
 * chrome-extension://akjpgdhgfhpppafgdfhaebceaklfgjcc
 */
const DEV_PUBLIC_KEY =
  "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAg3e10mNW8rcFREDhNq+ovQbLDC8q2nGGioF7YsPSR94XKyB6qTy+8jYoi8TaHM0c2/LJXdXFhw20ruT/qfOnDjc3KbBjlCBaIjmiDRIuTMAl3FzRZs0hwF+5T0ryusTq3G/pPgDt/ByXXCPcg2SKeCboS+ISUsANx7SzD6C4xsnhtUtJ4mVYqC3KhAhnspu5BXLdVJoIvhVvzW6TXLtd9dsXWvkueCE86VPC8j5yYughWQppIA2YTWVxACuJDElXHrUUniAAkoTSBMEVoJHcrRLbb2n+i7LeTNZ1myz24WyF2SOoBCJMS+lgys+UXsQpkufI4CY46o9lzaHUffGvzQIDAQAB";

export const EXTENSION_ORIGIN = "chrome-extension://akjpgdhgfhpppafgdfhaebceaklfgjcc";

export default defineManifest(() => {
  const apiUrl = process.env.VITE_API_URL ?? "http://localhost:3000";
  const apiOrigin = new URL(apiUrl).origin;

  return {
    manifest_version: 3,
    name: "TaskFlow",
    description: "Quick-add tasks to TaskFlow without leaving your tab.",
    version: "0.6.0",
    key: DEV_PUBLIC_KEY,
    action: {
      default_title: "TaskFlow",
      default_popup: "popup/index.html",
    },
    background: {
      service_worker: "background/service-worker.ts",
      type: "module",
    },
    permissions: ["storage", "tabs"],
    host_permissions: [`${apiOrigin}/*`],
  };
});
