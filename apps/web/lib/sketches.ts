import type { Prisma, Sketch as SketchRow } from "@prisma/client";
import type { Sketch as SketchDto, SketchDocument } from "@taskflow/types";
import type { SketchDocumentInput, SketchUpdateInput, SketchUpsertInput } from "@taskflow/validation";

import { prisma } from "@/lib/prisma";
import { resolveSketchUrl } from "@/lib/supabase-admin";
import { getTaskForUser, TaskNotFoundError } from "@/lib/tasks";

export class SketchNotFoundError extends Error {
  readonly code = "NOT_FOUND" as const;
  readonly status = 404;

  constructor(message = "Sketch not found") {
    super(message);
    this.name = "SketchNotFoundError";
  }
}

function asDocument(value: Prisma.JsonValue): SketchDocument {
  return value as unknown as SketchDocument;
}

export async function serializeSketch(row: SketchRow): Promise<SketchDto> {
  const imageUrl = await resolveSketchUrl(row.storagePath);
  return {
    id: row.id,
    taskId: row.taskId,
    userId: row.userId,
    storagePath: row.storagePath,
    imageUrl,
    dataJson: asDocument(row.dataJson),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getSketchByTaskId(userId: string, taskId: string) {
  await getTaskForUser(userId, taskId);
  const row = await prisma.sketch.findFirst({
    where: { taskId, userId },
  });
  if (!row) return null;
  return serializeSketch(row);
}

export async function getSketchForUser(userId: string, id: string) {
  const row = await prisma.sketch.findFirst({
    where: { id, userId },
  });
  if (!row) {
    throw new SketchNotFoundError();
  }
  return row;
}

export async function upsertSketch(
  userId: string,
  input: SketchUpsertInput,
  storagePath?: string | null,
) {
  await getTaskForUser(userId, input.taskId);

  const dataJson = input.dataJson as unknown as Prisma.InputJsonValue;
  const row = await prisma.sketch.upsert({
    where: { taskId: input.taskId },
    create: {
      taskId: input.taskId,
      userId,
      dataJson,
      storagePath: storagePath ?? null,
    },
    update: {
      dataJson,
      ...(storagePath !== undefined ? { storagePath } : {}),
      userId,
    },
  });

  return serializeSketch(row);
}

export async function updateSketch(
  userId: string,
  id: string,
  input: SketchUpdateInput,
  storagePath?: string | null,
) {
  const existing = await getSketchForUser(userId, id);

  if (input.dataJson === undefined && storagePath === undefined) {
    return serializeSketch(existing);
  }

  const row = await prisma.sketch.update({
    where: { id: existing.id },
    data: {
      ...(input.dataJson !== undefined
        ? { dataJson: input.dataJson as unknown as Prisma.InputJsonValue }
        : {}),
      ...(storagePath !== undefined ? { storagePath } : {}),
    },
  });

  return serializeSketch(row);
}

export async function deleteSketch(userId: string, id: string) {
  const existing = await getSketchForUser(userId, id);
  await prisma.sketch.delete({ where: { id: existing.id } });
  return existing;
}

export function emptySketchDocument(
  width = 800,
  height = 500,
): SketchDocumentInput {
  return { version: 1, width, height, strokes: [] };
}
