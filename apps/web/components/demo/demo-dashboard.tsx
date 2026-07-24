"use client";

import type { Task } from "@taskflow/types";
import { useCallback, useEffect, useMemo, useState } from "react";

import { DashboardView } from "@/components/dashboard/dashboard-view";
import { AppShell } from "@/components/shell/app-shell";
import {
  computeDemoStats,
  createDemoTask,
  deleteDemoTask,
  loadDemoTasks,
  updateDemoTask,
  type DemoTaskInput,
} from "@/lib/demo/store";

export function DemoDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTasks(loadDemoTasks());
    setReady(true);
  }, []);

  const stats = useMemo(() => computeDemoStats(tasks), [tasks]);

  const onCreateTask = useCallback((input: DemoTaskInput) => {
    setTasks((current) => createDemoTask(input, current));
  }, []);

  const onUpdateTask = useCallback((id: string, patch: DemoTaskInput) => {
    setTasks((current) => updateDemoTask(id, patch, current));
  }, []);

  const onDeleteTask = useCallback((id: string) => {
    setTasks((current) => deleteDemoTask(id, current));
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading demo workspace…
      </div>
    );
  }

  return (
    <AppShell variant="demo" userName="Guest">
      <div className="border-b border-border bg-card/40 px-4 py-4 md:px-8">
        <p className="text-xs font-medium tracking-wide text-primary uppercase">TaskFlow</p>
        <h1 className="mt-1 text-xl font-bold text-foreground md:text-2xl" style={{ fontFamily: "var(--font-display)" }}>
          Try the product before you sign up
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Explore the dashboard, edit demo tasks, and switch themes. Everything stays in this browser until you create
          an account.
        </p>
      </div>
      <DashboardView
        mode="demo"
        userName="Guest"
        tasks={tasks}
        stats={stats}
        onCreateTask={onCreateTask}
        onUpdateTask={onUpdateTask}
        onDeleteTask={onDeleteTask}
      />
    </AppShell>
  );
}
