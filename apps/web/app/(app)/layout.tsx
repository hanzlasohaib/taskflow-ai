import { redirect } from "next/navigation";

import { AppShell } from "@/components/shell/app-shell";
import { getSession } from "@/lib/session";
import { resolveAvatarUrl } from "@/lib/supabase-admin";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }

  const userImage = await resolveAvatarUrl(session.user.image);

  return (
    <AppShell userName={session.user.name || session.user.email} userImage={userImage}>
      {children}
    </AppShell>
  );
}
