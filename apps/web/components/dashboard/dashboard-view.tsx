"use client";

import type { Task, TaskPriority, TaskStats, TaskStatus } from "@taskflow/types";
import {
  formatGreeting,
  formatLongDate,
  formatRelativeDue,
  getDisplayStatus,
  getDisplayStatusLabel,
  isActiveTask,
  isOverdue,
  TASK_PRIORITY_LABELS,
} from "@taskflow/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Award,
  Calendar,
  Check,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileAudio,
  Flag,
  Flame,
  Hash,
  Mic,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Sparkles,
  Target,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type ElementType } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

import { useShellActions } from "@/components/shell/app-shell";
import { UserAvatar } from "@/components/shell/user-avatar";
import { PriorityBadge } from "@/components/tasks/priority-badge";
import { PriorityDot, StatusBadge } from "@/components/tasks/status-badge";
import type { DemoTaskInput } from "@/lib/demo/store";
import { cn } from "@/lib/utils";

export type DashboardMode = "demo" | "auth";

type DashboardViewProps = {
  mode?: DashboardMode;
  userName: string;
  tasks: Task[];
  stats: TaskStats;
  onCreateTask?: (input: DemoTaskInput) => void;
  onUpdateTask?: (id: string, patch: DemoTaskInput) => void;
  onDeleteTask?: (id: string) => void;
};

type FilterType = "all" | "in-progress" | "todo" | "overdue" | "completed";

const PRODUCTIVITY = [
  { day: "Mon", score: 72 },
  { day: "Tue", score: 85 },
  { day: "Wed", score: 68 },
  { day: "Thu", score: 91 },
  { day: "Fri", score: 78 },
  { day: "Sat", score: 55 },
  { day: "Sun", score: 82 },
];

function StatChip({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-border bg-foreground/[0.04] px-3 py-2">
      <Icon className="h-3.5 w-3.5 shrink-0" style={{ color }} aria-hidden />
      <div>
        <p className="text-sm leading-none font-semibold text-foreground">{value}</p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function matchesFilter(task: Task, filter: FilterType): boolean {
  if (!isActiveTask(task.status)) return false;
  if (filter === "all") return true;
  return getDisplayStatus(task) === filter;
}

export function DashboardView({
  mode = "auth",
  userName,
  tasks,
  stats,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
}: DashboardViewProps) {
  const isDemo = mode === "demo";
  const { openAi, openVoice, requireAccount } = useShellActions();
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftStatus, setDraftStatus] = useState<TaskStatus>("TODO");
  const [draftPriority, setDraftPriority] = useState<TaskPriority>("MEDIUM");
  const firstName = userName.split(" ")[0] ?? userName;

  const activeTasks = useMemo(() => tasks.filter((t) => isActiveTask(t.status)), [tasks]);

  const selected = useMemo(
    () => activeTasks.find((t) => t.id === selectedId) ?? null,
    [activeTasks, selectedId],
  );

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return activeTasks
      .filter((t) => matchesFilter(t, filter))
      .filter((t) => !q || t.title.toLowerCase().includes(q) || (t.description ?? "").toLowerCase().includes(q));
  }, [activeTasks, filter, search]);

  const dueThisWeek = activeTasks.filter((t) => {
    if (!t.dueDate || t.status === "DONE") return false;
    const due = new Date(t.dueDate).getTime();
    const week = Date.now() + 7 * 86_400_000;
    return due <= week;
  }).length;

  const activeTotal = stats.total - stats.archived;
  const productivityPct =
    activeTotal === 0
      ? 0
      : Math.round(((stats.done + stats.completedThisWeek) / Math.max(activeTotal, 1)) * 50 + 34);

  const today = new Date().getDate();
  const year = new Date().getFullYear();
  const month = new Date().getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7;
  const calDays: Array<number | null> = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (calDays.length % 7 !== 0) calDays.push(null);

  const deadlineDays = new Set(
    activeTasks
      .filter((t) => t.dueDate && t.status !== "DONE")
      .map((t) => new Date(t.dueDate!).getDate())
      .filter((d) => d !== today),
  );

  const filters: { id: FilterType; label: string }[] = [
    { id: "all", label: "All" },
    { id: "in-progress", label: "In Progress" },
    { id: "todo", label: "Todo" },
    { id: "overdue", label: "Overdue" },
    { id: "completed", label: "Completed" },
  ];

  const statCards = [
    { label: "Total Tasks", value: activeTotal, change: "—", icon: CheckSquare, color: "#536DFE" },
    { label: "Completed", value: stats.done, change: `+${stats.completedThisWeek}`, icon: Check, color: "#22C55E" },
    { label: "In Progress", value: stats.inProgress, change: "—", icon: Activity, color: "#536DFE" },
    { label: "Pending", value: stats.todo, change: "—", icon: Clock, color: "#F59E0B" },
    { label: "Overdue", value: stats.overdue, change: "—", icon: AlertTriangle, color: "#EF4444" },
    {
      label: "High Priority",
      value: activeTasks.filter((t) => t.priority === "HIGH" || t.priority === "URGENT").length,
      change: "—",
      icon: Flag,
      color: "#8B5CF6",
    },
  ];

  return (
    <div className="min-h-full">
      <section className="px-4 pt-6 pb-6 md:px-8 md:pt-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-1.5 font-mono text-xs text-muted-foreground">{formatLongDate()}</p>
            <h1 className="mb-2 text-[28px] leading-tight font-bold text-foreground">
              {formatGreeting()}, {firstName}
            </h1>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
              {dueThisWeek > 0
                ? `${dueThisWeek} task${dueThisWeek === 1 ? "" : "s"} due this week — stay focused on the highest priority items.`
                : "You're clear for the week — create a task or capture one by voice."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <StatChip icon={Flame} label="Day streak" value="—" color="#F59E0B" />
            <StatChip icon={Check} label="Done today" value={String(stats.completedThisWeek)} color="#22C55E" />
            <StatChip icon={Target} label="Productivity" value={`${productivityPct}%`} color="#536DFE" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isDemo ? (
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" aria-hidden /> Add Task
            </button>
          ) : (
            <Link
              href="/tasks"
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" aria-hidden /> Add Task
            </Link>
          )}
          <button
            type="button"
            onClick={openVoice}
            className="flex items-center gap-2 rounded-xl border border-border bg-foreground/[0.04] px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:border-foreground/12 hover:bg-foreground/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
          >
            <Mic className="h-4 w-4 text-primary" aria-hidden /> Voice Task
          </button>
          <button
            type="button"
            disabled
            title="Canvas arrives in a later phase"
            className="flex items-center gap-2 rounded-xl border border-border bg-foreground/[0.04] px-4 py-2.5 text-sm font-medium text-foreground opacity-70 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Pencil className="h-4 w-4 text-secondary" aria-hidden /> Canvas
          </button>
          <button
            type="button"
            onClick={openAi}
            className="flex items-center gap-2 rounded-xl border border-border bg-foreground/[0.04] px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:border-foreground/12 hover:bg-foreground/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
          >
            <Sparkles className="h-4 w-4 text-accent" aria-hidden /> AI Assistant
          </button>
          {isDemo ? (
            <button
              type="button"
              onClick={() => requireAccount("sync")}
              className="flex items-center gap-2 rounded-xl border border-border bg-foreground/[0.04] px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:border-foreground/12 hover:bg-foreground/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Sync
            </button>
          ) : null}
        </div>

        <div className="mt-4">
          <label className="sr-only" htmlFor="demo-task-search">
            Search tasks
          </label>
          <input
            id="demo-task-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter tasks by title or description…"
            className="w-full max-w-md rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </section>

      <section className="mb-8 px-4 md:px-8" aria-label="Task statistics">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {statCards.map(({ label, value, change, icon: Icon, color }) => (
            <div
              key={label}
              className="cursor-default rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-foreground/12"
            >
              <div className="mb-3 flex items-start justify-between">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${color}18` }}
                >
                  <Icon className="h-4 w-4" style={{ color }} aria-hidden />
                </div>
                <span
                  className={cn(
                    "font-mono text-[10px] font-medium",
                    change.startsWith("+") && change !== "+0"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-muted-foreground",
                  )}
                >
                  {change}
                </span>
              </div>
              <p className="mb-0.5 text-2xl font-bold text-foreground">{value}</p>
              <p className="text-[11px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-8 px-4 pb-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
        <div className="min-w-0 space-y-8">
          <section aria-labelledby="todays-tasks-heading">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 id="todays-tasks-heading" className="text-base font-semibold text-foreground">
                Today&apos;s Tasks
              </h2>
              <div
                className="flex items-center gap-0.5 rounded-xl border border-border bg-foreground/[0.04] p-1"
                role="tablist"
                aria-label="Filter tasks"
              >
                {filters.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    role="tab"
                    aria-selected={filter === f.id}
                    onClick={() => setFilter(f.id)}
                    className={cn(
                      "rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      filter === f.id
                        ? "bg-foreground/10 text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {shown.length === 0 ? (
                <div className="flex items-center justify-center rounded-2xl border border-dashed border-border py-10 text-sm text-muted-foreground">
                  No tasks in this category
                </div>
              ) : (
                shown.map((task) => (
                  <motion.button
                    key={task.id}
                    type="button"
                    layout
                    onClick={() => setSelectedId(task.id)}
                    whileHover={{ x: 2 }}
                    transition={{ duration: 0.12 }}
                    className={cn(
                      "group flex w-full cursor-pointer items-center gap-4 rounded-2xl border px-4 py-3.5 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      selectedId === task.id
                        ? "border-primary/40 bg-primary/5"
                        : "border-border bg-card hover:border-foreground/12 hover:bg-foreground/[0.02]",
                      isOverdue(task.dueDate, task.status) && selectedId !== task.id && "border-red-500/20",
                    )}
                  >
                    <PriorityDot priority={task.priority} />
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "text-sm font-medium",
                            task.status === "DONE"
                              ? "text-muted-foreground line-through"
                              : "text-foreground",
                          )}
                        >
                          {task.title}
                        </span>
                        <PriorityBadge priority={task.priority} />
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" aria-hidden />
                          {formatRelativeDue(task.dueDate)}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <UserAvatar name={userName} size="xs" />
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </section>

          <section aria-labelledby="voice-notes-heading">
            <div className="mb-4 flex items-center justify-between">
              <h2 id="voice-notes-heading" className="text-base font-semibold text-foreground">
                Voice Notes
              </h2>
              <span className="text-[11px] text-muted-foreground">Coming with Deepgram</span>
            </div>
            <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <FileAudio className="h-4 w-4 text-primary" aria-hidden />
              </div>
              <p className="text-sm text-muted-foreground">
                Voice notes will appear here after Phase 6. Use Voice Task in the sidebar to preview the recording UI.
              </p>
              <button
                type="button"
                disabled
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] text-muted-foreground"
              >
                <Play className="h-3 w-3" aria-hidden /> Play · Convert to Task
              </button>
            </div>
          </section>
        </div>

        <aside className="space-y-4" aria-label="Context panel">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.18 }}
                className="rounded-2xl border border-border bg-card p-4"
              >
                <div className="mb-3 flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-1.5">
                      <StatusBadge status={selected.status} dueDate={selected.dueDate} />
                      <PriorityBadge priority={selected.priority} />
                    </div>
                    <h3 className="text-sm leading-snug font-semibold text-foreground">{selected.title}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-foreground/5 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Close task details"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {selected.description ? (
                  <p className="mb-4 text-[11px] leading-relaxed text-muted-foreground">{selected.description}</p>
                ) : null}

                <div className="mb-4 grid grid-cols-2 gap-1.5">
                  {[
                    { label: "Due Date", value: formatRelativeDue(selected.dueDate), icon: Calendar },
                    {
                      label: "Updated",
                      value: new Date(selected.updatedAt).toLocaleDateString(),
                      icon: RefreshCw,
                    },
                    {
                      label: "Status",
                      value: getDisplayStatusLabel(selected),
                      icon: Hash,
                    },
                    {
                      label: "Priority",
                      value: TASK_PRIORITY_LABELS[selected.priority],
                      icon: Flag,
                    },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="rounded-xl border border-border bg-foreground/[0.02] px-2.5 py-2">
                      <div className="mb-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Icon className="h-3 w-3" aria-hidden />
                        {label}
                      </div>
                      <p className="truncate text-[11px] font-medium text-foreground">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {isDemo ? (
                    <>
                      {selected.status !== "DONE" ? (
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateTask?.(selected.id, { title: selected.title, status: "DONE" });
                          }}
                          className="rounded-xl bg-primary px-3 py-2 text-[11px] font-semibold text-primary-foreground transition-all hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Mark complete
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateTask?.(selected.id, { title: selected.title, status: "TODO" });
                          }}
                          className="rounded-xl border border-border px-3 py-2 text-[11px] font-medium text-foreground transition-all hover:bg-foreground/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Reopen
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteTask?.(selected.id);
                          setSelectedId(null);
                        }}
                        className="inline-flex items-center gap-1 rounded-xl border border-destructive/30 px-3 py-2 text-[11px] font-medium text-destructive transition-all hover:bg-destructive/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Trash2 className="h-3 w-3" aria-hidden /> Delete
                      </button>
                    </>
                  ) : (
                    <Link
                      href={`/tasks/${selected.id}`}
                      className="rounded-xl bg-primary px-3 py-2 text-[11px] font-semibold text-primary-foreground transition-all hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Open full editor
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    className="rounded-xl border border-border px-3 py-2 text-[11px] font-medium text-foreground transition-all hover:bg-foreground/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="default-panel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="rounded-2xl border border-border bg-card p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">
                      {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </span>
                    <div className="flex gap-1">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground">
                        <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
                      </span>
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground">
                        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                      </span>
                    </div>
                  </div>
                  <div className="mb-1 grid grid-cols-7 gap-0.5">
                    {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                      <div key={`${d}-${i}`} className="py-1 text-center text-[10px] font-medium text-muted-foreground">
                        {d}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-0.5">
                    {calDays.map((day, i) => {
                      if (!day) return <div key={`e-${i}`} />;
                      const isToday = day === today;
                      const isDeadline = deadlineDays.has(day) && !isToday;
                      const isPast = day < today;
                      return (
                        <div
                          key={day}
                          className={cn(
                            "flex aspect-square items-center justify-center rounded-lg text-[11px] font-medium transition-all",
                            isToday && "bg-primary text-white shadow-md shadow-primary/30",
                            isDeadline && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                            !isToday && !isDeadline && !isPast && "text-foreground",
                            isPast && !isToday && "text-muted-foreground/40",
                          )}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
                    <span className="text-sm font-semibold text-foreground">AI Insights</span>
                  </div>
                  <div className="mb-3">
                    <div className="mb-1.5 flex items-end justify-between">
                      <span className="text-[11px] text-muted-foreground">Productivity Score</span>
                      <span className="font-mono text-sm font-bold text-foreground">{productivityPct}%</span>
                    </div>
                    <div className="h-14">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={PRODUCTIVITY} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
                          <defs>
                            <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#536DFE" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="#536DFE" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <Area
                            type="monotone"
                            dataKey="score"
                            stroke="#536DFE"
                            strokeWidth={1.5}
                            fill="url(#pg)"
                            dot={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div>
                    {[
                      { label: "Most productive", value: "Thursday", icon: Award },
                      { label: "Focus hours", value: "—", icon: Target },
                      { label: "Completed this week", value: String(stats.completedThisWeek), icon: Flame },
                      { label: "Overdue", value: String(stats.overdue), icon: Clock },
                    ].map(({ label, value, icon: Icon }) => (
                      <div
                        key={label}
                        className="flex items-center justify-between border-t border-border py-2 first:border-t-0"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-3 w-3 text-muted-foreground" aria-hidden />
                          <span className="text-[11px] text-muted-foreground">{label}</span>
                        </div>
                        <span className="font-mono text-[11px] font-medium text-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 border-t border-border pt-3">
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      <span className="font-medium text-primary">AI Tip:</span> Tackle overdue and high-priority items
                      first during your peak focus window.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" aria-hidden />
                    <span className="text-sm font-semibold text-foreground">Upcoming Deadlines</span>
                  </div>
                  <div className="space-y-3">
                    {activeTasks.filter((t) => t.status !== "DONE").slice(0, 4).length === 0 ? (
                      <p className="text-[11px] text-muted-foreground">No upcoming deadlines</p>
                    ) : (
                      activeTasks
                        .filter((t) => t.status !== "DONE")
                        .slice(0, 4)
                        .map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setSelectedId(t.id)}
                            className="flex w-full items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <PriorityDot priority={t.priority} />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[11px] font-medium text-foreground">{t.title}</p>
                              <p className="text-[10px] text-muted-foreground">{formatRelativeDue(t.dueDate)}</p>
                            </div>
                            <PriorityBadge priority={t.priority} />
                          </button>
                        ))
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">Notifications</span>
                    <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                      Live soon
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    Realtime notifications arrive in Phase 5. Deadline and mention alerts will show here.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </div>

      <AnimatePresence>
        {createOpen && isDemo ? (
          <>
            <motion.button
              type="button"
              aria-label="Close create dialog backdrop"
              className="fixed inset-0 z-40 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCreateOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="create-demo-task-title"
              className="fixed top-1/2 left-1/2 z-50 w-[min(92vw,440px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-5 shadow-2xl"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
            >
              <h2 id="create-demo-task-title" className="mb-4 text-sm font-semibold text-foreground">
                Add demo task
              </h2>
              <form
                className="grid gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!draftTitle.trim()) return;
                  onCreateTask?.({
                    title: draftTitle,
                    status: draftStatus,
                    priority: draftPriority,
                  });
                  setDraftTitle("");
                  setDraftStatus("TODO");
                  setDraftPriority("MEDIUM");
                  setCreateOpen(false);
                }}
              >
                <label className="grid gap-1 text-xs text-muted-foreground">
                  Title
                  <input
                    required
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    autoFocus
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="grid gap-1 text-xs text-muted-foreground">
                    Status
                    <select
                      value={draftStatus}
                      onChange={(e) => setDraftStatus(e.target.value as TaskStatus)}
                      className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="TODO">Todo</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Completed</option>
                    </select>
                  </label>
                  <label className="grid gap-1 text-xs text-muted-foreground">
                    Priority
                    <select
                      value={draftPriority}
                      onChange={(e) => setDraftPriority(e.target.value as TaskPriority)}
                      className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </label>
                </div>
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateOpen(false)}
                    className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-foreground/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
