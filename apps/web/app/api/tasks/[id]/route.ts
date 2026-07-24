import { taskUpdateSchema } from "@taskflow/validation";

import { jsonOk, notFoundError, unauthorizedError, validationError } from "@/lib/api";
import { AuthError, requireSession } from "@/lib/session";
import { deleteTask, getTaskForUser, TaskNotFoundError, updateTask } from "@/lib/tasks";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await requireSession();
    const { id } = await context.params;
    const task = await getTaskForUser(session.user.id, id);
    return jsonOk(task);
  } catch (error) {
    if (error instanceof AuthError) {
      return unauthorizedError(error.message);
    }
    if (error instanceof TaskNotFoundError) {
      return notFoundError(error.message);
    }
    throw error;
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await requireSession();
    const { id } = await context.params;
    const body: unknown = await request.json();
    const parsed = taskUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const task = await updateTask(session.user.id, id, parsed.data);
    return jsonOk(task);
  } catch (error) {
    if (error instanceof AuthError) {
      return unauthorizedError(error.message);
    }
    if (error instanceof TaskNotFoundError) {
      return notFoundError(error.message);
    }
    throw error;
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await requireSession();
    const { id } = await context.params;
    await deleteTask(session.user.id, id);
    return jsonOk({ ok: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return unauthorizedError(error.message);
    }
    if (error instanceof TaskNotFoundError) {
      return notFoundError(error.message);
    }
    throw error;
  }
}
