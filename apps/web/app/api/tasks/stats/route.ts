import { jsonOk, unauthorizedError } from "@/lib/api";
import { AuthError, requireSession } from "@/lib/session";
import { getTaskStats } from "@/lib/tasks";

export async function GET() {
  try {
    const session = await requireSession();
    const stats = await getTaskStats(session.user.id);
    return jsonOk(stats);
  } catch (error) {
    if (error instanceof AuthError) {
      return unauthorizedError(error.message);
    }
    throw error;
  }
}
