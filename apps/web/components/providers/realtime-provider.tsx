"use client";

import { useTaskRealtime } from "@/hooks/use-task-realtime";

type RealtimeProviderProps = {
  userId: string;
  children: React.ReactNode;
};

/**
 * Mounts Task Realtime subscription for the authenticated shell.
 * Unsubscribes automatically on logout (layout unmount) / user change.
 */
export function RealtimeProvider({ userId, children }: RealtimeProviderProps) {
  useTaskRealtime(userId);
  return children;
}
