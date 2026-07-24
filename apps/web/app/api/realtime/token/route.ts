import { jsonError, jsonOk, unauthorizedError } from "@/lib/api";
import { AuthError, requireSession } from "@/lib/session";
import { mintRealtimeToken } from "@/lib/supabase-realtime-token";

export async function GET() {
  try {
    const session = await requireSession();
    const payload = await mintRealtimeToken(session.user.id);
    return jsonOk(payload);
  } catch (error) {
    if (error instanceof AuthError) {
      return unauthorizedError(error.message);
    }
    if (error instanceof Error && error.message.includes("SUPABASE_JWT_SECRET")) {
      return jsonError("CONFIG_ERROR", "Realtime is not configured", 503);
    }
    throw error;
  }
}
