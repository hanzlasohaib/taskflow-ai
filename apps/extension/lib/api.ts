import type { ApiErrorBody, Task, TaskPriority } from "@taskflow/types";
import { taskCreateSchema } from "@taskflow/validation";

import { API_URL } from "./config";
import { getSessionToken } from "./storage";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

type ListTasksResponse = {
  items: Task[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

async function authHeaders(json = false): Promise<HeadersInit> {
  const token = await getSessionToken();
  const headers: Record<string, string> = {};
  if (json) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function parseError(response: Response): Promise<ApiError> {
  let code = "REQUEST_FAILED";
  let message = response.statusText || "Request failed";
  try {
    const body = (await response.json()) as ApiErrorBody;
    if (body?.error?.code) code = body.error.code;
    if (body?.error?.message) message = body.error.message;
  } catch {
    // keep defaults
  }
  return new ApiError(response.status, code, message);
}

export async function createTask(input: {
  title: string;
  priority?: TaskPriority;
}): Promise<Task> {
  const parsed = taskCreateSchema.parse({
    title: input.title,
    priority: input.priority ?? "MEDIUM",
    status: "TODO",
  });

  const response = await fetch(`${API_URL}/api/tasks`, {
    method: "POST",
    headers: await authHeaders(true),
    body: JSON.stringify(parsed),
  });

  if (!response.ok) throw await parseError(response);
  return (await response.json()) as Task;
}

export async function listRecentTasks(limit = 5): Promise<Task[]> {
  const params = new URLSearchParams({
    page: "1",
    pageSize: String(limit),
    sort: "createdAt",
    order: "desc",
  });

  const response = await fetch(`${API_URL}/api/tasks?${params}`, {
    method: "GET",
    headers: await authHeaders(),
  });

  if (!response.ok) throw await parseError(response);
  const body = (await response.json()) as ListTasksResponse;
  return body.items ?? [];
}
