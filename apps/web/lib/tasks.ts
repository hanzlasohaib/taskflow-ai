import type { Prisma, Task, TaskPriority, TaskStatus } from "@prisma/client";
import type { Task as TaskDto, TaskStats } from "@taskflow/types";
import type { TaskCreateInput, TaskListQuery, TaskUpdateInput } from "@taskflow/validation";

import { prisma } from "@/lib/prisma";

export class TaskNotFoundError extends Error {
  readonly code = "NOT_FOUND" as const;
  readonly status = 404;

  constructor(message = "Task not found") {
    super(message);
    this.name = "TaskNotFoundError";
  }
}

function toDate(value: string | null | undefined): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return new Date(value);
}

function resolveCompletedAt(
  nextStatus: TaskStatus | undefined,
  previousStatus?: TaskStatus,
  previousCompletedAt?: Date | null,
): Date | null | undefined {
  if (nextStatus === undefined) return undefined;
  if (nextStatus === "DONE") {
    if (previousStatus === "DONE") return previousCompletedAt ?? new Date();
    return new Date();
  }
  if (previousStatus === "DONE" || previousCompletedAt) {
    return null;
  }
  return undefined;
}

export function serializeTask(task: Task): TaskDto {
  return {
    id: task.id,
    userId: task.userId,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate?.toISOString() ?? null,
    completedAt: task.completedAt?.toISOString() ?? null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

export async function listTasks(userId: string, query: TaskListQuery) {
  const where: Prisma.TaskWhereInput = {
    userId,
    ...(query.status ? { status: query.status } : {}),
    ...(query.priority ? { priority: query.priority } : {}),
    ...(query.q
      ? {
          title: {
            contains: query.q,
            mode: "insensitive",
          },
        }
      : {}),
    ...((query.from || query.to) && {
      dueDate: {
        ...(query.from ? { gte: new Date(query.from) } : {}),
        ...(query.to ? { lte: new Date(query.to) } : {}),
      },
    }),
  };

  const skip = (query.page - 1) * query.pageSize;

  const [total, tasks] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.findMany({
      where,
      orderBy: { [query.sort]: query.order },
      skip,
      take: query.pageSize,
    }),
  ]);

  return {
    items: tasks.map(serializeTask),
    page: query.page,
    pageSize: query.pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
  };
}

export async function createTask(userId: string, input: TaskCreateInput) {
  const status = (input.status ?? "TODO") as TaskStatus;
  const priority = (input.priority ?? "MEDIUM") as TaskPriority;
  const completedAt = resolveCompletedAt(status);

  const task = await prisma.task.create({
    data: {
      userId,
      title: input.title,
      description: input.description ?? null,
      status,
      priority,
      dueDate: toDate(input.dueDate) ?? null,
      completedAt: completedAt === undefined ? null : completedAt,
    },
  });

  return serializeTask(task);
}

export async function getTaskForUser(userId: string, id: string) {
  const task = await prisma.task.findFirst({
    where: { id, userId },
  });
  if (!task) {
    throw new TaskNotFoundError();
  }
  return serializeTask(task);
}

export async function updateTask(userId: string, id: string, input: TaskUpdateInput) {
  const existing = await prisma.task.findFirst({
    where: { id, userId },
  });
  if (!existing) {
    throw new TaskNotFoundError();
  }

  const nextStatus = input.status as TaskStatus | undefined;
  const completedAt = resolveCompletedAt(nextStatus, existing.status, existing.completedAt);

  const task = await prisma.task.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.status !== undefined ? { status: input.status as TaskStatus } : {}),
      ...(input.priority !== undefined ? { priority: input.priority as TaskPriority } : {}),
      ...(input.dueDate !== undefined ? { dueDate: toDate(input.dueDate) ?? null } : {}),
      ...(completedAt !== undefined ? { completedAt } : {}),
    },
  });

  return serializeTask(task);
}

export async function deleteTask(userId: string, id: string) {
  const existing = await prisma.task.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!existing) {
    throw new TaskNotFoundError();
  }

  await prisma.task.delete({ where: { id } });
}

export async function getTaskStats(userId: string): Promise<TaskStats> {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [groupedStatus, groupedPriority, overdue, completedThisWeek] = await Promise.all([
    prisma.task.groupBy({
      by: ["status"],
      where: { userId },
      _count: { _all: true },
    }),
    prisma.task.groupBy({
      by: ["priority"],
      where: { userId },
      _count: { _all: true },
    }),
    prisma.task.count({
      where: {
        userId,
        dueDate: { lt: now },
        status: { notIn: ["DONE", "ARCHIVED"] },
      },
    }),
    prisma.task.count({
      where: {
        userId,
        completedAt: { gte: weekAgo },
      },
    }),
  ]);

  const statusCounts: Record<TaskStatus, number> = {
    TODO: 0,
    IN_PROGRESS: 0,
    DONE: 0,
    ARCHIVED: 0,
  };
  for (const row of groupedStatus) {
    statusCounts[row.status] = row._count._all;
  }

  const byPriority: Record<TaskPriority, number> = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    URGENT: 0,
  };
  for (const row of groupedPriority) {
    byPriority[row.priority] = row._count._all;
  }

  const total =
    statusCounts.TODO + statusCounts.IN_PROGRESS + statusCounts.DONE + statusCounts.ARCHIVED;

  return {
    total,
    todo: statusCounts.TODO,
    inProgress: statusCounts.IN_PROGRESS,
    done: statusCounts.DONE,
    archived: statusCounts.ARCHIVED,
    overdue,
    completedThisWeek,
    byPriority,
  };
}
