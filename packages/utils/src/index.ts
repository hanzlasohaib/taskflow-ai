import type { TaskPriority, TaskStatus } from "@taskflow/types";

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function isOverdue(dueDate: string | Date | null | undefined, status: TaskStatus): boolean {
  if (!dueDate || status === "DONE" || status === "ARCHIVED") return false;
  const due = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  return due.getTime() < Date.now();
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done",
  ARCHIVED: "Archived",
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export function transcriptToTitle(transcript: string, maxLength = 80): string {
  const cleaned = transcript.trim().replace(/\s+/g, " ");
  if (!cleaned) return "Untitled task";
  const firstSentence = cleaned.split(/[.!?]/)[0]?.trim() ?? cleaned;
  if (firstSentence.length <= maxLength) return firstSentence;
  return `${firstSentence.slice(0, maxLength - 1).trimEnd()}…`;
}
