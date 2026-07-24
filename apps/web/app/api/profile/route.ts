import { z } from "zod";

import { jsonOk, unauthorizedError, validationError } from "@/lib/api";
import { getProfile, updateProfile } from "@/lib/profile";
import { AuthError, requireSession } from "@/lib/session";
import { resolveAvatarUrl } from "@/lib/supabase-admin";

const patchSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
});

export async function GET() {
  try {
    const session = await requireSession();
    const profile = await getProfile(session.user.id);
    const image = await resolveAvatarUrl(profile.image);
    return jsonOk({
      ...profile,
      image,
      role: "Member" as const,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return unauthorizedError(error.message);
    }
    throw error;
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireSession();
    const body: unknown = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const profile = await updateProfile(session.user.id, parsed.data);
    const image = await resolveAvatarUrl(profile.image);
    return jsonOk({
      ...profile,
      image,
      role: "Member" as const,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return unauthorizedError(error.message);
    }
    throw error;
  }
}
