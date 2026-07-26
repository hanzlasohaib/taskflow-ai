import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { createClient, type RealtimeChannel, type SupabaseClient } from "@supabase/supabase-js";

import { fetchRealtimeToken } from "./api";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

const REFRESH_DEBOUNCE_MS = 250;
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;

type ChangeListener = () => void;

let supabaseClient: SupabaseClient | null = null;
let channel: RealtimeChannel | null = null;
let activeUserId: string | null = null;
let tokenExpiresAt = 0;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let connectInFlight: Promise<void> | null = null;
let appStateSub: { remove: () => void } | null = null;

const listeners = new Set<ChangeListener>();

function getSupabase(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return supabaseClient;
}

function notifyListeners() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    for (const listener of listeners) {
      try {
        listener();
      } catch {
        // ignore listener errors
      }
    }
  }, REFRESH_DEBOUNCE_MS);
}

async function clearChannel() {
  const supabase = getSupabase();
  if (!supabase || !channel) {
    channel = null;
    return;
  }
  const current = channel;
  channel = null;
  await supabase.removeChannel(current).catch(() => undefined);
}

async function connect(userId: string) {
  if (connectInFlight) {
    await connectInFlight;
    if (activeUserId === userId && channel) return;
  }

  connectInFlight = (async () => {
    const supabase = getSupabase();
    if (!supabase || listeners.size === 0) return;

    const payload = await fetchRealtimeToken();
    if (!payload || listeners.size === 0 || activeUserId !== userId) return;

    tokenExpiresAt = payload.expiresAt;
    await clearChannel();
    await supabase.realtime.setAuth(payload.token);

    // Unique topic per connect so a stale subscribed channel is never reused.
    const next = supabase
      .channel(`tasks:user:${userId}:${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "task",
          filter: `userId=eq.${userId}`,
        },
        () => {
          notifyListeners();
        },
      );

    channel = next;
    next.subscribe();

    if (refreshTimer) clearTimeout(refreshTimer);
    const refreshIn = Math.max(payload.expiresAt - Date.now() - TOKEN_REFRESH_BUFFER_MS, 30_000);
    refreshTimer = setTimeout(() => {
      void connect(userId);
    }, refreshIn);
  })();

  try {
    await connectInFlight;
  } finally {
    connectInFlight = null;
  }
}

function onAppState(next: AppStateStatus) {
  if (next !== "active" || !activeUserId || listeners.size === 0) return;
  notifyListeners();
  const needsToken = !tokenExpiresAt || tokenExpiresAt - Date.now() < TOKEN_REFRESH_BUFFER_MS;
  if (needsToken || !channel) {
    void connect(activeUserId);
  }
}

async function ensureConnected(userId: string) {
  if (activeUserId !== userId) {
    activeUserId = userId;
    await clearChannel();
  }

  if (!appStateSub) {
    appStateSub = AppState.addEventListener("change", onAppState);
  }

  if (!channel) {
    await connect(userId);
  }
}

async function releaseListener(listener: ChangeListener) {
  listeners.delete(listener);
  if (listeners.size > 0) return;

  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  if (appStateSub) {
    appStateSub.remove();
    appStateSub = null;
  }
  activeUserId = null;
  tokenExpiresAt = 0;
  await clearChannel();
}

/**
 * Subscribes to task postgres_changes for the signed-in user and calls onChange
 * (debounced) so lists/stats can refetch.
 *
 * Multiple screens may call this hook — they share one Realtime channel.
 */
export function useTaskRealtime(userId: string | null | undefined, onChange: () => void) {
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!userId) return;

    const listener: ChangeListener = () => {
      onChangeRef.current();
    };

    listeners.add(listener);
    void ensureConnected(userId);

    return () => {
      void releaseListener(listener);
    };
  }, [userId]);
}
