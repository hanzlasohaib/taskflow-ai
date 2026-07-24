import Link from "next/link";
import { taskListQuerySchema } from "@taskflow/validation";
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS, getDisplayStatusLabel } from "@taskflow/utils";

import { createTaskAction } from "@/app/(app)/tasks/actions";
import { requireSession } from "@/lib/session";
import { listTasks } from "@/lib/tasks";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function TasksPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await requireSession();
  const params = await searchParams;

  const parsed = taskListQuerySchema.safeParse({
    status: first(params.status) || undefined,
    priority: first(params.priority) || undefined,
    q: first(params.q) || undefined,
    page: first(params.page) || undefined,
    pageSize: first(params.pageSize) || undefined,
    sort: first(params.sort) || undefined,
    order: first(params.order) || undefined,
  });

  const query = parsed.success
    ? parsed.data
    : taskListQuerySchema.parse({});

  const result = await listTasks(session.user.id, query);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Tasks</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and filter tasks. Polished list UI (T-4.07) follows this shell.
          </p>
        </div>
      </div>

      <section className="space-y-3 border border-slate-200 p-4">
        <h2 className="text-lg font-medium">Create task</h2>
        <form action={createTaskAction} className="grid gap-3">
          <label className="grid gap-1 text-sm">
            Title
            <input name="title" required maxLength={200} className="border border-slate-300 px-2 py-1" />
          </label>
          <label className="grid gap-1 text-sm">
            Description
            <textarea name="description" rows={3} maxLength={5000} className="border border-slate-300 px-2 py-1" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1 text-sm">
              Status
              <select name="status" defaultValue="TODO" className="border border-slate-300 px-2 py-1">
                {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              Priority
              <select name="priority" defaultValue="MEDIUM" className="border border-slate-300 px-2 py-1">
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
            <input name="dueDate" type="datetime-local" className="border border-slate-300 px-2 py-1" />
          </label>
          <button type="submit" className="w-fit border border-slate-900 bg-slate-900 px-3 py-2 text-sm text-white">
            Create
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Filters</h2>
        <form className="grid gap-3 border border-slate-200 p-4 md:grid-cols-4">
          <label className="grid gap-1 text-sm">
            Search
            <input
              name="q"
              defaultValue={query.q ?? ""}
              placeholder="Title contains…"
              className="border border-slate-300 px-2 py-1"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Status
            <select name="status" defaultValue={query.status ?? ""} className="border border-slate-300 px-2 py-1">
              <option value="">Any</option>
              {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            Priority
            <select name="priority" defaultValue={query.priority ?? ""} className="border border-slate-300 px-2 py-1">
              <option value="">Any</option>
              {Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            Sort
            <select name="sort" defaultValue={query.sort} className="border border-slate-300 px-2 py-1">
              <option value="createdAt">Created</option>
              <option value="dueDate">Due date</option>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
            </select>
          </label>
          <input type="hidden" name="order" value={query.order} />
          <button type="submit" className="w-fit border border-slate-300 px-3 py-2 text-sm">
            Apply
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">
          Results ({result.total})
        </h2>
        {result.items.length === 0 ? (
          <p className="text-sm text-slate-600">No tasks yet. Create one above.</p>
        ) : (
          <ul className="divide-y divide-slate-200 border border-slate-200">
            {result.items.map((task) => (
              <li key={task.id} className="flex items-start justify-between gap-4 px-3 py-3">
                <div>
                  <Link href={`/tasks/${task.id}`} className="font-medium text-slate-900 underline">
                    {task.title}
                  </Link>
                  <p className="mt-1 text-xs text-slate-500">
                    {getDisplayStatusLabel(task)} · {TASK_PRIORITY_LABELS[task.priority]}
                    {task.dueDate ? ` · due ${new Date(task.dueDate).toLocaleString()}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
        {result.totalPages > 1 ? (
          <p className="text-xs text-slate-500">
            Page {result.page} of {result.totalPages}
          </p>
        ) : null}
      </section>
    </main>
  );
}
