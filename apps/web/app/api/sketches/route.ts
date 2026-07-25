import { sketchUpsertSchema, type SketchUpsertInput } from "@taskflow/validation";
import type { NextResponse } from "next/server";

import { jsonError, jsonOk, unauthorizedError, validationError } from "@/lib/api";
import {
  getSketchByTaskId,
  upsertSketch,
} from "@/lib/sketches";
import { AuthError, requireSession } from "@/lib/session";
import {
  getSketchesBucket,
  getSupabaseAdmin,
  sketchObjectPath,
} from "@/lib/supabase-admin";
import { TaskNotFoundError } from "@/lib/tasks";

const MAX_PNG_BYTES = 1 * 1024 * 1024;

type ParseResult =
  | { data: SketchUpsertInput; file: File | null }
  | { error: NextResponse };

async function parseUpsertBody(request: Request): Promise<ParseResult> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const taskId = String(form.get("taskId") ?? "");
    const rawJson = form.get("dataJson");
    let dataJson: unknown;
    if (typeof rawJson === "string") {
      try {
        dataJson = JSON.parse(rawJson);
      } catch {
        return { error: jsonError("VALIDATION_ERROR", "dataJson must be valid JSON", 400) };
      }
    } else {
      return { error: jsonError("VALIDATION_ERROR", "dataJson is required", 400) };
    }

    const parsed = sketchUpsertSchema.safeParse({ taskId, dataJson });
    if (!parsed.success) {
      return { error: validationError(parsed.error) };
    }

    const file = form.get("file");
    return {
      data: parsed.data,
      file: file instanceof File ? file : null,
    };
  }

  const body: unknown = await request.json();
  const parsed = sketchUpsertSchema.safeParse(body);
  if (!parsed.success) {
    return { error: validationError(parsed.error) };
  }
  return { data: parsed.data, file: null };
}

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    const taskId = new URL(request.url).searchParams.get("taskId");
    if (!taskId) {
      return jsonError("VALIDATION_ERROR", "taskId is required", 400);
    }

    const sketch = await getSketchByTaskId(session.user.id, taskId);
    return jsonOk({ sketch });
  } catch (error) {
    if (error instanceof AuthError) {
      return unauthorizedError(error.message);
    }
    if (error instanceof TaskNotFoundError) {
      return jsonError(error.code, error.message, error.status);
    }
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const parsed = await parseUpsertBody(request);
    if ("error" in parsed) {
      return parsed.error;
    }

    const { data, file } = parsed;
    let storagePath: string | undefined;

    if (file) {
      if (file.type !== "image/png") {
        return jsonError("VALIDATION_ERROR", "Sketch image must be PNG", 400);
      }
      if (file.size <= 0 || file.size > MAX_PNG_BYTES) {
        return jsonError("PAYLOAD_TOO_LARGE", "Sketch PNG must be 1 MB or smaller", 413);
      }

      try {
        const bytes = Buffer.from(await file.arrayBuffer());
        const path = sketchObjectPath(session.user.id, data.taskId);
        const supabase = getSupabaseAdmin();
        const { error: uploadError } = await supabase.storage
          .from(getSketchesBucket())
          .upload(path, bytes, {
            contentType: "image/png",
            upsert: true,
            cacheControl: "3600",
          });

        if (!uploadError) {
          storagePath = path;
        }
        // Soft-fail PNG: strokes still persist when storage/bucket is missing.
      } catch {
        // Soft-fail PNG upload.
      }
    }

    const sketch = await upsertSketch(session.user.id, data, storagePath);
    return jsonOk(sketch, 201);
  } catch (error) {
    if (error instanceof AuthError) {
      return unauthorizedError(error.message);
    }
    if (error instanceof TaskNotFoundError) {
      return jsonError(error.code, error.message, error.status);
    }
    throw error;
  }
}
