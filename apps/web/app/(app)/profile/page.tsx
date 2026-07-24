import { ProfileEditor } from "@/components/profile/profile-editor";
import { getProfile } from "@/lib/profile";
import { requireSession } from "@/lib/session";
import { resolveAvatarUrl } from "@/lib/supabase-admin";

export default async function ProfilePage() {
  const session = await requireSession();
  const profile = await getProfile(session.user.id);
  const image = await resolveAvatarUrl(profile.image);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-10">
      <h1 className="mb-6 text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
        Profile
      </h1>
      <ProfileEditor
        name={profile.name}
        email={profile.email}
        emailVerified={profile.emailVerified}
        image={image}
        createdAt={profile.createdAt.toISOString()}
      />
    </main>
  );
}
