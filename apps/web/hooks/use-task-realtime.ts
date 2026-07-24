"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";

import { getSupabaseBrowser } from "@/lib/supabase-browser";

const REFRESH_DEBOUNCE_MS = 250;
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000; // refresh 5 min before expiry

type TokenResponse = {
  token: string;
  expiresAt: number;
};

async function fetchRealtimeToken(): Promise<TokenResponse | null> {
  try {
    const res = await fetch("/api/realtime/token", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as TokenResponse;
    if (!data?.token || !data?.expiresAt) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Subscribes to Task postgres_changes for the signed-in user and refreshes
 * Server Component trees via debounced router.refresh().
 */
export function useTaskRealtime(userId: string | null | undefined) {
  const router = useRouter();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const tokenExpiresAtRef = useRef(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeUserIdRef = useRef(userId);

  useEffect(() => {
    activeUserIdRef.current = userId;
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    function scheduleRefresh() {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        debounceTimerRef.current = null;
        router.refresh();
      }, REFRESH_DEBOUNCE_MS);
    }

    function clearChannel() {
      const supabase = getSupabaseBrowser();
      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    }

    async function connect() {
      if (cancelled || activeUserIdRef.current !== userId) return;

      const payload = await fetchRealtimeToken();
      if (!payload || cancelled || activeUserIdRef.current !== userId) return;

      tokenExpiresAtRef.current = payload.expiresAt;

      let supabase: ReturnType<typeof getSupabaseBrowser>;
      try {
        supabase = getSupabaseBrowser();
      } catch {
        return;
      }

      clearChannel();
      await supabase.realtime.setAuth(payload.token);

      const channel = supabase
        .channel(`tasks:user:${userId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "task",
            filter: `userId=eq.${userId}`,
          },
          () => {
            scheduleRefresh();
          },
        )
        .subscribe();

      channelRef.current = channel;

      // Schedule token refresh before expiry
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      const refreshIn = Math.max(
        payload.expiresAt - Date.now() - TOKEN_REFRESH_BUFFER_MS,
        30_000,
      );
      refreshTimerRef.current = setTimeout(() => {
        void connect();
      }, refreshIn);
    }

    function onResume() {
      if (document.visibilityState !== "visible") return;
      router.refresh();
      const needsToken =
        !tokenExpiresAtRef.current ||
        tokenExpiresAtRef.current - Date.now() < TOKEN_REFRESH_BUFFER_MS;
      if (needsToken || !channelRef.current) {
        void connect();
      }
    }

    function onOnline() {
      router.refresh();
      void connect();
    }

    void connect();

    document.addEventListener("visibilitychange", onResume);
    window.addEventListener("online", onOnline);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onResume);
      window.removeEventListener("online", onOnline);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      try {
        clearChannel();
      } catch {
        // ignore teardown errors
      }
    };
  }, [userId, router]);
}
