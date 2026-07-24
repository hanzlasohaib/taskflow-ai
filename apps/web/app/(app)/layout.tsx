import { redirect } from "next/navigation";

import { AppShell } from "@/components/shell/app-shell";
import { getSession } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }

  return <AppShell userName={session.user.name || session.user.email}>{children}</AppShell>;
}
