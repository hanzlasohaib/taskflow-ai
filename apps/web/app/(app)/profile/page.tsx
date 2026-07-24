import { requireSession } from "@/lib/session";
import { getInitials } from "@taskflow/utils";

export default async function ProfilePage() {
  const session = await requireSession();
  const name = session.user.name || "User";
  const initials = getInitials(name);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
        Profile
      </h1>
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-semibold text-primary"
            style={{ backgroundColor: "#536DFE22", boxShadow: "0 0 0 1.5px #536DFE44" }}
            aria-hidden
          >
            {initials}
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">{name}</p>
            <p className="text-sm text-muted-foreground">{session.user.email}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Email verified: {session.user.emailVerified ? "Yes" : "No"}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
