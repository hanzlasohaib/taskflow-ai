import type { Task } from "@taskflow/types";

export const DEMO_STORAGE_KEY = "taskflow-demo-v1";

export type DemoPersisted = {
  version: 1;
  tasks: Task[];
};

export function readDemoStorage(): DemoPersisted | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DemoPersisted;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.tasks)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeDemoStorage(data: DemoPersisted): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(data));
}
