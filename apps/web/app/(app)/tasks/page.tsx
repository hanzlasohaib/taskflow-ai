import Link from "next/link";
import { Plus } from "lucide-react";
import { taskListQuerySchema } from "@taskflow/validation";
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from "@taskflow/utils";
import type { TaskPriority, TaskStatus } from "@taskflow/types";

import { createTaskAction } from "@/app/(app)/tasks/actions";
import { PriorityBadge } from "@/components/tasks/priority-badge";
import { StatusBadge } from "@/components/tasks/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { requireSession } from "@/lib/session";
import { listTasks } from "@/lib/tasks";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const fieldClass =
  "w-full rounded-xl border border-border bg-input-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const labelClass = "grid gap-1.5 text-sm text-foreground";
const primaryBtnClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const secondaryBtnClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-foreground/[0.04] px-4 text-sm font-medium text-foreground transition-all hover:bg-foreground/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring";

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

  const query = parsed.success ? parsed.data : taskListQuerySchema.parse({});
  const result = await listTasks(session.user.id, query);

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 md:px-6 md:py-10">
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Tasks
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Create, search, and manage your work.</p>
      </div>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Create task</h2>
        <form action={createTaskAction} className="grid gap-3">
          <label className={labelClass}>
            Title
            <input name="title" required maxLength={200} className={fieldClass} placeholder="What needs doing?" />
          </label>
          <label className={labelClass}>
            Description
            <textarea
              name="description"
              rows={3}
              maxLength={5000}
              className={fieldClass}
              placeholder="Optional details"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={labelClass}>
              Status
              <select name="status" defaultValue="TODO" className={fieldClass}>
                {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Priority
              <select name="priority" defaultValue="MEDIUM" className={fieldClass}>
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
            <input name="dueDate" type="datetime-local" className={fieldClass} />
          </label>
          <button type="submit" className={`${primaryBtnClass} w-fit`}>
            <Plus className="h-4 w-4" aria-hidden />
            Add Task
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Filters</h2>
        <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className={labelClass}>
            Search
            <input
              name="q"
              defaultValue={query.q ?? ""}
              placeholder="Title contains…"
              className={fieldClass}
            />
          </label>
          <label className={labelClass}>
            Status
            <select name="status" defaultValue={query.status ?? ""} className={fieldClass}>
              <option value="">Any</option>
              {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Priority
            <select name="priority" defaultValue={query.priority ?? ""} className={fieldClass}>
              <option value="">Any</option>
              {Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Sort
            <select name="sort" defaultValue={query.sort} className={fieldClass}>
              <option value="createdAt">Created</option>
              <option value="dueDate">Due date</option>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
            </select>
          </label>
          <div className="flex items-end">
            <input type="hidden" name="order" value={query.order} />
            <button type="submit" className={`${secondaryBtnClass} w-full sm:w-auto`}>
              Apply
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-foreground">Results ({result.total})</h2>
          {result.totalPages > 1 ? (
            <p className="text-xs text-muted-foreground">
              Page {result.page} of {result.totalPages}
            </p>
          ) : null}
        </div>

        {result.items.length === 0 ? (
          <EmptyState title="No tasks found." description="Create a task above or clear your filters." />
        ) : (
          <ul className="space-y-2">
            {result.items.map((task) => (
              <li key={task.id}>
                <Link
                  href={`/tasks/${task.id}`}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-foreground/15 hover:bg-foreground/2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="min-w-0 space-y-2">
                    <p className="truncate font-medium text-foreground">{task.title}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={task.status as TaskStatus} dueDate={task.dueDate} />
                      <PriorityBadge priority={task.priority as TaskPriority} />
                      {task.dueDate ? (
                        <span className="text-[11px] text-muted-foreground">
                          Due {new Date(task.dueDate).toLocaleString()}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
