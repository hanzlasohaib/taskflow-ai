"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { authClient, useSession } from "@/lib/auth-client";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  async function handleLogout() {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  if (isPending) {
    return <p className="p-8 text-sm text-slate-500">Loading session…</p>;
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium tracking-wide text-teal-700 uppercase">TaskFlow</p>
          <h1 className="text-3xl font-semibold text-slate-900">Dashboard</h1>
          <p className="mt-2 text-slate-600">
            Placeholder shell. Stats UI waits for Figma (Phase 3 / Design Gate D.05).
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          Log out
        </button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
        <p>
          Signed in as <strong>{session?.user.name}</strong> ({session?.user.email})
        </p>
        <p className="mt-1">Email verified: {session?.user.emailVerified ? "yes" : "no"}</p>
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link className="underline" href="/profile">
          Profile (stub)
        </Link>
        <Link className="underline" href="/settings">
          Settings (stub)
        </Link>
        <Link className="underline" href="/tasks">
          Tasks (stub)
        </Link>
      </div>
    </main>
  );
}
