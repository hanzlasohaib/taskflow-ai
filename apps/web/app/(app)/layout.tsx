import { redirect } from "next/navigation";

import { RealtimeProvider } from "@/components/providers/realtime-provider";
import { AppShell } from "@/components/shell/app-shell";
import { getSession } from "@/lib/session";
import { resolveAvatarUrl } from "@/lib/supabase-admin";

/** Auth cookie / headers — never statically prerender this segment. */
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }

  const userImage = await resolveAvatarUrl(session.user.image);

  return (
    <AppShell userName={session.user.name || session.user.email} userImage={userImage}>
      <RealtimeProvider userId={session.user.id}>{children}</RealtimeProvider>
    </AppShell>
  );
}
