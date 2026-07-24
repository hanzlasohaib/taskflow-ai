import { NextResponse } from "next/server";

import type { ApiErrorBody } from "@taskflow/types";

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonError(
  code: string,
  message: string,
  status: number,
  details?: unknown,
) {
  const body: ApiErrorBody = {
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  };
  return NextResponse.json(body, { status });
}

export function validationError(error: { flatten: () => unknown }) {
  return jsonError("VALIDATION_ERROR", "Invalid request", 400, error.flatten());
}

export function unauthorizedError(message = "Authentication required") {
  return jsonError("UNAUTHORIZED", message, 401);
}

export function notFoundError(message = "Resource not found") {
  return jsonError("NOT_FOUND", message, 404);
}
