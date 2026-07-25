import { NextResponse } from "next/server";

import { jsonError, jsonOk, unauthorizedError } from "@/lib/api";
import {
  DeepgramConfigError,
  DeepgramUpstreamError,
  suggestTaskFromTranscript,
  transcribeAudio,
} from "@/lib/deepgram";
import { checkRateLimit } from "@/lib/rate-limit";
import { AuthError, requireSession } from "@/lib/session";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024;
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

const ALLOWED_BASE_TYPES = new Set([
  "audio/webm",
  "audio/ogg",
  "audio/mp4",
  "audio/mpeg",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
]);

function normalizeMime(type: string): string {
  return type.split(";")[0]?.trim().toLowerCase() ?? "";
}

function isAllowedMime(type: string): boolean {
  return ALLOWED_BASE_TYPES.has(normalizeMime(type));
}

export async function POST(request: Request) {
  let userId: string | undefined;
  let byteLength = 0;

  try {
    const session = await requireSession();
    userId = session.user.id;

    const limited = checkRateLimit(`voice:transcribe:${userId}`, {
      limit: RATE_LIMIT,
      windowMs: RATE_WINDOW_MS,
    });
    if (!limited.ok) {
      logVoice("rate_limited", userId, byteLength, 429);
      return NextResponse.json(
        {
          error: {
            code: "RATE_LIMITED",
            message: "Too many voice requests. Try again shortly.",
          },
        },
        {
          status: 429,
          headers: { "Retry-After": String(limited.retryAfterSec) },
        },
      );
    }

    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      logVoice("validation", userId, byteLength, 400);
      return jsonError("VALIDATION_ERROR", "Audio file is required", 400);
    }

    byteLength = file.size;

    if (!isAllowedMime(file.type)) {
      logVoice("validation", userId, byteLength, 400);
      return jsonError(
        "VALIDATION_ERROR",
        "Audio must be webm, ogg, mp4, mpeg, or wav",
        400,
      );
    }

    if (file.size <= 0) {
      logVoice("validation", userId, byteLength, 400);
      return jsonError("VALIDATION_ERROR", "Audio file is empty", 400);
    }

    if (file.size > MAX_BYTES) {
      logVoice("validation", userId, byteLength, 413);
      return jsonError("PAYLOAD_TOO_LARGE", "Audio must be 5 MB or smaller", 413);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType = normalizeMime(file.type) || "audio/webm";
    const transcript = await transcribeAudio(buffer, contentType);

    if (!transcript) {
      logVoice("empty_transcript", userId, byteLength, 422);
      return jsonError(
        "EMPTY_TRANSCRIPT",
        "Could not detect speech. Try again.",
        422,
      );
    }

    const suggestion = suggestTaskFromTranscript(transcript);
    logVoice("ok", userId, byteLength, 200);

    return jsonOk({
      transcript,
      suggestedTitle: suggestion.suggestedTitle,
      ...(suggestion.suggestedDescription
        ? { suggestedDescription: suggestion.suggestedDescription }
        : {}),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return unauthorizedError(error.message);
    }
    if (error instanceof DeepgramConfigError) {
      logVoice("config", userId, byteLength, 503);
      return jsonError("CONFIG_ERROR", "Voice transcription is not configured", 503);
    }
    if (error instanceof DeepgramUpstreamError) {
      logVoice("upstream", userId, byteLength, 502);
      return jsonError("UPSTREAM_ERROR", "Transcription service failed", 502);
    }
    logVoice("error", userId, byteLength, 500);
    throw error;
  }
}

/** Structured log — never includes audio bytes or transcript text. */
function logVoice(
  event: string,
  userId: string | undefined,
  byteLength: number,
  status: number,
) {
  console.info(
    JSON.stringify({
      scope: "voice.transcribe",
      event,
      userId: userId ?? null,
      byteLength,
      status,
    }),
  );
}
