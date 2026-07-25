import { sketchUpdateSchema } from "@taskflow/validation";

import { jsonError, jsonOk, unauthorizedError, validationError } from "@/lib/api";
import {
  deleteSketch,
  getSketchForUser,
  SketchNotFoundError,
  updateSketch,
} from "@/lib/sketches";
import { AuthError, requireSession } from "@/lib/session";
import {
  getSketchesBucket,
  getSupabaseAdmin,
  sketchObjectPath,
} from "@/lib/supabase-admin";

const MAX_PNG_BYTES = 1 * 1024 * 1024;

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await requireSession();
    const { id } = await context.params;
    const contentType = request.headers.get("content-type") ?? "";

    let dataJson: unknown | undefined;
    let file: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const rawJson = form.get("dataJson");
      if (typeof rawJson === "string" && rawJson.length > 0) {
        try {
          dataJson = JSON.parse(rawJson);
        } catch {
          return jsonError("VALIDATION_ERROR", "dataJson must be valid JSON", 400);
        }
      }
      const formFile = form.get("file");
      file = formFile instanceof File ? formFile : null;
    } else {
      const body: unknown = await request.json();
      if (body && typeof body === "object" && "dataJson" in body) {
        dataJson = (body as { dataJson: unknown }).dataJson;
      }
    }

    const parsed = sketchUpdateSchema.safeParse(
      dataJson !== undefined ? { dataJson } : {},
    );
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    let storagePath: string | undefined;
    if (file) {
      if (file.type !== "image/png") {
        return jsonError("VALIDATION_ERROR", "Sketch image must be PNG", 400);
      }
      if (file.size <= 0 || file.size > MAX_PNG_BYTES) {
        return jsonError("PAYLOAD_TOO_LARGE", "Sketch PNG must be 1 MB or smaller", 413);
      }

      const existing = await getSketchForUser(session.user.id, id);
      storagePath = sketchObjectPath(session.user.id, existing.taskId);
      const bytes = Buffer.from(await file.arrayBuffer());
      const supabase = getSupabaseAdmin();
      const { error: uploadError } = await supabase.storage
        .from(getSketchesBucket())
        .upload(storagePath, bytes, {
          contentType: "image/png",
          upsert: true,
          cacheControl: "3600",
        });
      if (uploadError) {
        return jsonError("STORAGE_ERROR", uploadError.message || "Failed to upload sketch image", 500);
      }
    }

    const sketch = await updateSketch(session.user.id, id, parsed.data, storagePath);
    return jsonOk(sketch);
  } catch (error) {
    if (error instanceof AuthError) {
      return unauthorizedError(error.message);
    }
    if (error instanceof SketchNotFoundError) {
      return jsonError(error.code, error.message, error.status);
    }
    if (error instanceof Error && error.message.includes("Supabase Storage")) {
      return jsonError("CONFIG_ERROR", "Sketch storage is not configured", 503);
    }
    throw error;
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await requireSession();
    const { id } = await context.params;
    const existing = await deleteSketch(session.user.id, id);

    if (existing.storagePath) {
      try {
        const supabase = getSupabaseAdmin();
        await supabase.storage.from(getSketchesBucket()).remove([existing.storagePath]);
      } catch {
        // Best-effort storage cleanup; DB row already deleted.
      }
    }

    return jsonOk({ ok: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return unauthorizedError(error.message);
    }
    if (error instanceof SketchNotFoundError) {
      return jsonError(error.code, error.message, error.status);
    }
    throw error;
  }
}
