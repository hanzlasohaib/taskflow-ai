function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

export const API_URL = trimTrailingSlash(import.meta.env.VITE_API_URL ?? "http://localhost:3000");
export const APP_URL = trimTrailingSlash(import.meta.env.VITE_APP_URL ?? "http://localhost:3000");
