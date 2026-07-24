import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from "@taskflow/utils";
import type { TaskPriority, TaskStatus } from "@taskflow/types";

import { deleteTaskAction, updateTaskAction } from "@/app/(app)/tasks/actions";
import { PriorityBadge } from "@/components/tasks/priority-badge";
import { StatusBadge } from "@/components/tasks/status-badge";
import { AuthError, requireSession } from "@/lib/session";
import { getTaskForUser, TaskNotFoundError } from "@/lib/tasks";

type PageProps = {
  params: Promise<{ id: string }>;
};

const fieldClass =
  "w-full rounded-xl border border-border bg-input-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const labelClass = "grid gap-1.5 text-sm text-foreground";
const primaryBtnClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const dangerBtnClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-destructive/30 px-4 text-sm font-medium text-destructive transition-all hover:bg-destructive/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function toDateTimeLocal(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default async function TaskDetailPage({ params }: PageProps) {
  const session = await requireSession();
  const { id } = await params;

  let task;
  try {
    task = await getTaskForUser(session.user.id, id);
  } catch (error) {
    if (error instanceof TaskNotFoundError || error instanceof AuthError) {
      notFound();
    }
    throw error;
  }

  const updateWithId = updateTaskAction.bind(null, task.id);
  const deleteWithId = deleteTaskAction.bind(null, task.id);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 md:px-6 md:py-10">
      <div className="space-y-3">
        <Link
          href="/tasks"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Tasks
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl" style={{ fontFamily: "var(--font-display)" }}>
              Edit task
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">ID: {task.id}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={task.status as TaskStatus} dueDate={task.dueDate} />
            <PriorityBadge priority={task.priority as TaskPriority} />
          </div>
        </div>
      </div>

      <form action={updateWithId} className="grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <label className={labelClass}>
          Title
          <input name="title" required maxLength={200} defaultValue={task.title} className={fieldClass} />
        </label>
        <label className={labelClass}>
          Description
          <textarea
            name="description"
            rows={4}
            maxLength={5000}
            defaultValue={task.description ?? ""}
            className={fieldClass}
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className={labelClass}>
            Status
            <select name="status" defaultValue={task.status} className={fieldClass}>
              {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Priority
            <select name="priority" defaultValue={task.priority} className={fieldClass}>
              {Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className={labelClass}>
          Due date
          <input
            name="dueDate"
            type="datetime-local"
            defaultValue={toDateTimeLocal(task.dueDate)}
            className={fieldClass}
          />
        </label>
        <p className="text-xs text-muted-foreground">
          Completed: {task.completedAt ? new Date(task.completedAt).toLocaleString() : "—"}
        </p>
        <button type="submit" className={`${primaryBtnClass} w-fit`}>
          Save changes
        </button>
      </form>

      <form action={deleteWithId} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold text-foreground">Danger zone</h2>
        <p className="mb-4 text-xs text-muted-foreground">Permanently delete this task. This cannot be undone.</p>
        <button type="submit" className={dangerBtnClass}>
          Delete task
        </button>
      </form>
    </main>
  );
}
