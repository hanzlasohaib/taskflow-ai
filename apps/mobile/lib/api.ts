import type {
  ApiErrorBody,
  Sketch,
  Task,
  TaskPriority,
  TaskStats,
  TaskStatus,
} from "@taskflow/types";
import { taskCreateSchema, taskUpdateSchema } from "@taskflow/validation";

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

export type Profile = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
};

export type VoiceTranscribeResult = {
  transcript: string;
  suggestedTitle: string;
  suggestedDescription?: string | null;
};

export type ListTasksParams = {
  q?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  page?: number;
  pageSize?: number;
  sort?: "createdAt" | "dueDate" | "priority" | "title";
  order?: "asc" | "desc";
};

async function authHeaders(json = false): Promise<Record<string, string>> {
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

export async function listTasks(params: ListTasksParams = {}): Promise<ListTasksResponse> {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.status) search.set("status", params.status);
  if (params.priority) search.set("priority", params.priority);
  search.set("page", String(params.page ?? 1));
  search.set("pageSize", String(params.pageSize ?? 50));
  search.set("sort", params.sort ?? "createdAt");
  search.set("order", params.order ?? "desc");

  const response = await fetch(`${API_URL}/api/tasks?${search}`, {
    method: "GET",
    headers: await authHeaders(),
  });
  if (!response.ok) throw await parseError(response);
  return (await response.json()) as ListTasksResponse;
}

export async function getTask(id: string): Promise<Task> {
  const response = await fetch(`${API_URL}/api/tasks/${id}`, {
    method: "GET",
    headers: await authHeaders(),
  });
  if (!response.ok) throw await parseError(response);
  return (await response.json()) as Task;
}

export async function createTask(input: {
  title: string;
  description?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string | null;
}): Promise<Task> {
  const parsed = taskCreateSchema.parse({
    title: input.title,
    description: input.description,
    priority: input.priority ?? "MEDIUM",
    status: input.status ?? "TODO",
    dueDate: input.dueDate,
  });

  const response = await fetch(`${API_URL}/api/tasks`, {
    method: "POST",
    headers: await authHeaders(true),
    body: JSON.stringify(parsed),
  });
  if (!response.ok) throw await parseError(response);
  return (await response.json()) as Task;
}

export async function updateTask(
  id: string,
  input: {
    title?: string;
    description?: string | null;
    priority?: TaskPriority;
    status?: TaskStatus;
    dueDate?: string | null;
  },
): Promise<Task> {
  const parsed = taskUpdateSchema.parse(input);
  const response = await fetch(`${API_URL}/api/tasks/${id}`, {
    method: "PATCH",
    headers: await authHeaders(true),
    body: JSON.stringify(parsed),
  });
  if (!response.ok) throw await parseError(response);
  return (await response.json()) as Task;
}

export async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/tasks/${id}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
  if (!response.ok && response.status !== 204) throw await parseError(response);
}

export async function getTaskStats(): Promise<TaskStats> {
  const response = await fetch(`${API_URL}/api/tasks/stats`, {
    method: "GET",
    headers: await authHeaders(),
  });
  if (!response.ok) throw await parseError(response);
  return (await response.json()) as TaskStats;
}

export async function getProfile(): Promise<Profile> {
  const response = await fetch(`${API_URL}/api/profile`, {
    method: "GET",
    headers: await authHeaders(),
  });
  if (!response.ok) throw await parseError(response);
  return (await response.json()) as Profile;
}

export async function updateProfile(input: { name: string }): Promise<Profile> {
  const response = await fetch(`${API_URL}/api/profile`, {
    method: "PATCH",
    headers: await authHeaders(true),
    body: JSON.stringify(input),
  });
  if (!response.ok) throw await parseError(response);
  return (await response.json()) as Profile;
}

export async function getSketchForTask(taskId: string): Promise<Sketch | null> {
  const response = await fetch(`${API_URL}/api/sketches?taskId=${encodeURIComponent(taskId)}`, {
    method: "GET",
    headers: await authHeaders(),
  });
  if (!response.ok) throw await parseError(response);
  const body = (await response.json()) as { sketch: Sketch | null };
  return body.sketch ?? null;
}

export async function transcribeVoice(uri: string, mimeType = "audio/mp4"): Promise<VoiceTranscribeResult> {
  const token = await getSessionToken();
  const form = new FormData();
  form.append("file", {
    uri,
    type: mimeType,
    name: "recording.m4a",
  } as unknown as Blob);

  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}/api/voice/transcribe`, {
    method: "POST",
    headers,
    body: form,
  });
  if (!response.ok) throw await parseError(response);
  return (await response.json()) as VoiceTranscribeResult;
}

export async function fetchRealtimeToken(): Promise<{ token: string; expiresAt: number } | null> {
  try {
    const response = await fetch(`${API_URL}/api/realtime/token`, {
      method: "GET",
      headers: await authHeaders(),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { token?: string; expiresAt?: number };
    if (!data?.token || !data?.expiresAt) return null;
    return { token: data.token, expiresAt: data.expiresAt };
  } catch {
    return null;
  }
}
