import type { Task, TaskPriority, TaskStats, TaskStatus } from "@taskflow/types";
import { isOverdue } from "@taskflow/utils";

import { DEMO_TASKS, DEMO_USER_ID } from "@/lib/demo/seed";
import { readDemoStorage, writeDemoStorage } from "@/lib/demo/storage";

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `demo-${crypto.randomUUID()}`;
  }
  return `demo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function loadDemoTasks(): Task[] {
  const stored = readDemoStorage();
  if (stored?.tasks?.length) return stored.tasks;
  writeDemoStorage({ version: 1, tasks: DEMO_TASKS });
  return DEMO_TASKS.map((t) => ({ ...t }));
}

function persist(tasks: Task[]): Task[] {
  writeDemoStorage({ version: 1, tasks });
  return tasks;
}

export type DemoTaskInput = {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
};

function withCompletedAt(status: TaskStatus, previous?: Task): string | null {
  if (status === "DONE") {
    if (previous?.status === "DONE" && previous.completedAt) return previous.completedAt;
    return new Date().toISOString();
  }
  return null;
}

export function createDemoTask(input: DemoTaskInput, current: Task[]): Task[] {
  const now = new Date().toISOString();
  const status = input.status ?? "TODO";
  const task: Task = {
    id: newId(),
    userId: DEMO_USER_ID,
    title: input.title.trim(),
    description: input.description ?? null,
    status,
    priority: input.priority ?? "MEDIUM",
    dueDate: input.dueDate ?? null,
    completedAt: withCompletedAt(status),
    createdAt: now,
    updatedAt: now,
  };
  return persist([task, ...current]);
}

export function updateDemoTask(id: string, patch: Partial<DemoTaskInput>, current: Task[]): Task[] {
  const next = current.map((task) => {
    if (task.id !== id) return task;
    const status = patch.status ?? task.status;
    return {
      ...task,
      title: patch.title !== undefined ? patch.title.trim() : task.title,
      description: patch.description !== undefined ? patch.description : task.description,
      status,
      priority: patch.priority ?? task.priority,
      dueDate: patch.dueDate !== undefined ? patch.dueDate : task.dueDate,
      completedAt: withCompletedAt(status, task),
      updatedAt: new Date().toISOString(),
    };
  });
  return persist(next);
}

export function deleteDemoTask(id: string, current: Task[]): Task[] {
  return persist(current.filter((t) => t.id !== id));
}

export function computeDemoStats(tasks: Task[]): TaskStats {
  const byPriority: Record<TaskPriority, number> = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    URGENT: 0,
  };
  let todo = 0;
  let inProgress = 0;
  let done = 0;
  let archived = 0;
  let overdue = 0;
  let completedThisWeek = 0;
  const weekAgo = Date.now() - 7 * 86_400_000;

  for (const task of tasks) {
    byPriority[task.priority] += 1;
    if (task.status === "TODO") todo += 1;
    if (task.status === "IN_PROGRESS") inProgress += 1;
    if (task.status === "DONE") done += 1;
    if (task.status === "ARCHIVED") archived += 1;
    if (isOverdue(task.dueDate, task.status)) overdue += 1;
    if (task.completedAt && new Date(task.completedAt).getTime() >= weekAgo) {
      completedThisWeek += 1;
    }
  }

  return {
    total: tasks.length,
    todo,
    inProgress,
    done,
    archived,
    overdue,
    completedThisWeek,
    byPriority,
  };
}

export function resetDemoTasks(): Task[] {
  return persist(DEMO_TASKS.map((t) => ({ ...t })));
}
