import { taskCreateSchema, taskListQuerySchema } from "@taskflow/validation";

import { jsonOk, unauthorizedError, validationError } from "@/lib/api";
import { AuthError, requireSession } from "@/lib/session";
import { createTask, listTasks } from "@/lib/tasks";

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    const url = new URL(request.url);
    const parsed = taskListQuerySchema.safeParse(Object.fromEntries(url.searchParams.entries()));
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const result = await listTasks(session.user.id, parsed.data);
    return jsonOk(result);
  } catch (error) {
    if (error instanceof AuthError) {
      return unauthorizedError(error.message);
    }
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body: unknown = await request.json();
    const parsed = taskCreateSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const task = await createTask(session.user.id, parsed.data);
    return jsonOk(task, 201);
  } catch (error) {
    if (error instanceof AuthError) {
      return unauthorizedError(error.message);
    }
    throw error;
  }
}
