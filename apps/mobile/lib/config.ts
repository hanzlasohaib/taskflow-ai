function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

export const API_URL = trimTrailingSlash(
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000",
);

export const APP_URL = trimTrailingSlash(
  process.env.EXPO_PUBLIC_APP_URL ?? process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000",
);

export const SUPABASE_URL = trimTrailingSlash(process.env.EXPO_PUBLIC_SUPABASE_URL ?? "");

export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";
