import { DashboardView } from "@/components/dashboard/dashboard-view";
import { requireSession } from "@/lib/session";
import { getTaskStats, listTasks } from "@/lib/tasks";

export default async function DashboardPage() {
  const session = await requireSession();
  const [stats, list] = await Promise.all([
    getTaskStats(session.user.id),
    listTasks(session.user.id, {
      page: 1,
      pageSize: 50,
      sort: "createdAt",
      order: "desc",
    }),
  ]);

  return (
    <DashboardView
      mode="auth"
      userName={session.user.name || session.user.email}
      tasks={list.items}
      stats={stats}
    />
  );
}
