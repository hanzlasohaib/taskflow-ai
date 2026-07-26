import { redirect } from "next/navigation";

import { DemoDashboard } from "@/components/demo/demo-dashboard";
import { getSession } from "@/lib/session";

/** Session cookies via `headers()` — never statically prerender. */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSession();
  if (session?.user?.id && session.user.emailVerified) {
    redirect("/dashboard");
  }

  return <DemoDashboard />;
}
