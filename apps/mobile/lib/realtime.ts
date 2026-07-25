import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { createClient, type RealtimeChannel, type SupabaseClient } from "@supabase/supabase-js";

import { fetchRealtimeToken } from "./api";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

const REFRESH_DEBOUNCE_MS = 250;
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;

let supabaseClient: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return supabaseClient;
}

/**
 * Subscribes to task postgres_changes for the signed-in user and calls onChange
 * (debounced) so lists/stats can refetch.
 */
export function useTaskRealtime(userId: string | null | undefined, onChange: () => void) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const tokenExpiresAtRef = useRef(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onChangeRef = useRef(onChange);
  const activeUserIdRef = useRef(userId);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

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
        onChangeRef.current();
      }, REFRESH_DEBOUNCE_MS);
    }

    function clearChannel() {
      const supabase = getSupabase();
      if (supabase && channelRef.current) {
        void supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    }

    async function connect() {
      if (cancelled || activeUserIdRef.current !== userId) return;

      const supabase = getSupabase();
      if (!supabase) return;

      const payload = await fetchRealtimeToken();
      if (!payload || cancelled || activeUserIdRef.current !== userId) return;

      tokenExpiresAtRef.current = payload.expiresAt;
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

      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      const refreshIn = Math.max(payload.expiresAt - Date.now() - TOKEN_REFRESH_BUFFER_MS, 30_000);
      refreshTimerRef.current = setTimeout(() => {
        void connect();
      }, refreshIn);
    }

    function onAppState(next: AppStateStatus) {
      if (next !== "active") return;
      onChangeRef.current();
      const needsToken =
        !tokenExpiresAtRef.current ||
        tokenExpiresAtRef.current - Date.now() < TOKEN_REFRESH_BUFFER_MS;
      if (needsToken || !channelRef.current) {
        void connect();
      }
    }

    void connect();
    const sub = AppState.addEventListener("change", onAppState);

    return () => {
      cancelled = true;
      sub.remove();
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      try {
        clearChannel();
      } catch {
        // ignore teardown errors
      }
    };
  }, [userId]);
}
