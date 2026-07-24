"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { taskCreateSchema, taskUpdateSchema } from "@taskflow/validation";

import { requireSession } from "@/lib/session";
import { createTask, deleteTask, updateTask } from "@/lib/tasks";

function formString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function formNullableString(formData: FormData, key: string): string | null | undefined {
  if (!formData.has(key)) return undefined;
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export async function createTaskAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const parsed = taskCreateSchema.safeParse({
    title: formString(formData, "title"),
    description: formNullableString(formData, "description"),
    status: formString(formData, "status"),
    priority: formString(formData, "priority"),
    dueDate: formNullableString(formData, "dueDate"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid task data");
  }

  const task = await createTask(session.user.id, parsed.data);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  redirect(`/tasks/${task.id}`);
}

export async function updateTaskAction(id: string, formData: FormData): Promise<void> {
  const session = await requireSession();
  const parsed = taskUpdateSchema.safeParse({
    title: formString(formData, "title"),
    description: formNullableString(formData, "description"),
    status: formString(formData, "status"),
    priority: formString(formData, "priority"),
    dueDate: formNullableString(formData, "dueDate"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid task data");
  }

  await updateTask(session.user.id, id, parsed.data);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath(`/tasks/${id}`);
}

export async function deleteTaskAction(id: string): Promise<void> {
  const session = await requireSession();
  await deleteTask(session.user.id, id);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  redirect("/tasks");
}
