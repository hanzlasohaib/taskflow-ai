import Link from "next/link";
import { notFound } from "next/navigation";
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from "@taskflow/utils";

import { deleteTaskAction, updateTaskAction } from "@/app/(app)/tasks/actions";
import { AuthError, requireSession } from "@/lib/session";
import { getTaskForUser, TaskNotFoundError } from "@/lib/tasks";

type PageProps = {
  params: Promise<{ id: string }>;
};

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
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-10">
      <div>
        <p className="text-sm text-slate-500">
          <Link href="/tasks" className="underline">
            ← Tasks
          </Link>
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">Edit task</h1>
        <p className="mt-1 text-sm text-slate-600">ID: {task.id}</p>
      </div>

      <form action={updateWithId} className="grid gap-3 border border-slate-200 p-4">
        <label className="grid gap-1 text-sm">
          Title
          <input
            name="title"
            required
            maxLength={200}
            defaultValue={task.title}
            className="border border-slate-300 px-2 py-1"
          />
        </label>
        <label className="grid gap-1 text-sm">
          Description
          <textarea
            name="description"
            rows={4}
            maxLength={5000}
            defaultValue={task.description ?? ""}
            className="border border-slate-300 px-2 py-1"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1 text-sm">
            Status
            <select name="status" defaultValue={task.status} className="border border-slate-300 px-2 py-1">
              {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            Priority
            <select name="priority" defaultValue={task.priority} className="border border-slate-300 px-2 py-1">
              {Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="grid gap-1 text-sm">
          Due date
          <input
            name="dueDate"
            type="datetime-local"
            defaultValue={toDateTimeLocal(task.dueDate)}
            className="border border-slate-300 px-2 py-1"
          />
        </label>
        <p className="text-xs text-slate-500">
          completedAt: {task.completedAt ? new Date(task.completedAt).toLocaleString() : "—"}
        </p>
        <button type="submit" className="w-fit border border-slate-900 bg-slate-900 px-3 py-2 text-sm text-white">
          Save changes
        </button>
      </form>

      <form action={deleteWithId}>
        <button type="submit" className="border border-red-600 px-3 py-2 text-sm text-red-700">
          Delete task
        </button>
      </form>
    </main>
  );
}
