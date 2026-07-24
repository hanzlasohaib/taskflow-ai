import type { TaskPriority, TaskStatus } from "@taskflow/types";

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** True when an active (non-done, non-archived) task is past its due date. */
export function isOverdue(dueDate: string | Date | null | undefined, status: TaskStatus): boolean {
  if (!dueDate || status === "DONE" || status === "ARCHIVED") return false;
  const due = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  return due.getTime() < Date.now();
}

export function isArchived(status: TaskStatus): boolean {
  return status === "ARCHIVED";
}

/** Active dashboard tasks — excludes archived. */
export function isActiveTask(status: TaskStatus): boolean {
  return status !== "ARCHIVED";
}

/**
 * UI presentation status — never expose backend enum names in the UI.
 * `overdue` is computed only for active past-due tasks (not a backend status).
 * `archived` maps 1:1 from ARCHIVED.
 */
export type DisplayStatus = "todo" | "in-progress" | "completed" | "overdue" | "archived";

export const DISPLAY_STATUS_LABELS: Record<DisplayStatus, string> = {
  todo: "Todo",
  "in-progress": "In Progress",
  completed: "Completed",
  overdue: "Overdue",
  archived: "Archived",
};

/**
 * Maps backend status (+ due date) to UI presentation.
 * - TODO → Todo (or Overdue if past due)
 * - IN_PROGRESS → In Progress (or Overdue if past due)
 * - DONE → Completed
 * - ARCHIVED → Archived (never Overdue)
 */
export function getDisplayStatus(input: {
  status: TaskStatus;
  dueDate?: string | Date | null;
}): DisplayStatus {
  if (input.status === "ARCHIVED") return "archived";
  if (input.status === "DONE") return "completed";
  if (isOverdue(input.dueDate, input.status)) return "overdue";
  if (input.status === "IN_PROGRESS") return "in-progress";
  return "todo";
}

export function getDisplayStatusLabel(input: {
  status: TaskStatus;
  dueDate?: string | Date | null;
}): string {
  return DISPLAY_STATUS_LABELS[getDisplayStatus(input)];
}

/** Backend status → stable UI label (forms/selects). Overdue is never a select option. */
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "Todo",
  IN_PROGRESS: "In Progress",
  DONE: "Completed",
  ARCHIVED: "Archived",
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

/**
 * Single source of truth for priority colors across TaskRow, badges, dots,
 * dashboard lists, deadlines, details, /tasks, board, and future cards.
 * Solid fills: Urgent red-500 · High orange-500 · Medium blue-500 · Low slate-400
 */
const PRIORITY_TONES: Record<
  TaskPriority,
  { color: string; badge: string }
> = {
  URGENT: {
    color: "bg-red-500",
    badge: "bg-red-500/10 text-red-500 border-red-500/20 dark:text-red-400",
  },
  HIGH: {
    color: "bg-orange-500",
    badge: "bg-orange-500/10 text-orange-500 border-orange-500/20 dark:text-orange-400",
  },
  MEDIUM: {
    color: "bg-blue-500",
    badge: "bg-blue-500/10 text-blue-500 border-blue-500/20 dark:text-blue-400",
  },
  LOW: {
    color: "bg-slate-400",
    badge: "bg-slate-400/10 text-slate-400 border-slate-400/20 dark:text-slate-400",
  },
};

/** Solid priority fill (`bg-*`) — use for dots, markers, and any hard priority color. */
export function getPriorityColorClass(priority: TaskPriority): string {
  return PRIORITY_TONES[priority].color;
}

/** Soft badge chrome derived from the same priority tones. */
export function getPriorityBadgeClass(priority: TaskPriority): string {
  return PRIORITY_TONES[priority].badge;
}

/** @deprecated Prefer getPriorityColorClass — kept as a Record for map-style access. */
export const PRIORITY_DOT_CLASS: Record<TaskPriority, string> = {
  URGENT: PRIORITY_TONES.URGENT.color,
  HIGH: PRIORITY_TONES.HIGH.color,
  MEDIUM: PRIORITY_TONES.MEDIUM.color,
  LOW: PRIORITY_TONES.LOW.color,
};

/** @deprecated Prefer getPriorityBadgeClass — kept as a Record for map-style access. */
export const PRIORITY_BADGE_CLASS: Record<TaskPriority, string> = {
  URGENT: PRIORITY_TONES.URGENT.badge,
  HIGH: PRIORITY_TONES.HIGH.badge,
  MEDIUM: PRIORITY_TONES.MEDIUM.badge,
  LOW: PRIORITY_TONES.LOW.badge,
};

export const DISPLAY_STATUS_BADGE_CLASS: Record<DisplayStatus, string> = {
  todo: "bg-slate-500/10 text-slate-500 border-slate-500/20 dark:text-slate-400",
  "in-progress": "bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-400",
  completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
  overdue: "bg-red-500/10 text-red-500 border-red-500/20 dark:text-red-400",
  archived: "bg-slate-500/10 text-slate-500 border-slate-500/20 dark:text-slate-400",
};

export const DISPLAY_STATUS_DOT_CLASS: Record<DisplayStatus, string> = {
  todo: "bg-slate-400",
  "in-progress": "bg-primary",
  completed: "bg-emerald-500",
  overdue: "bg-red-500",
  archived: "bg-slate-400",
};

export function transcriptToTitle(transcript: string, maxLength = 80): string {
  const cleaned = transcript.trim().replace(/\s+/g, " ");
  if (!cleaned) return "Untitled task";
  const firstSentence = cleaned.split(/[.!?]/)[0]?.trim() ?? cleaned;
  if (firstSentence.length <= maxLength) return firstSentence;
  return `${firstSentence.slice(0, maxLength - 1).trimEnd()}…`;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

export function formatGreeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function formatLongDate(date = new Date()): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelativeDue(dueDate: string | null | undefined): string {
  if (!dueDate) return "No due date";
  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return "No due date";

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDue = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const dayDiff = Math.round((startOfDue.getTime() - startOfToday.getTime()) / 86_400_000);

  const time = due.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  if (dayDiff === 0) return `Today, ${time}`;
  if (dayDiff === -1) return "Yesterday";
  if (dayDiff === 1) return `Tomorrow, ${time}`;
  return due.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}
