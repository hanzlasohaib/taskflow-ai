import { useEffect, useState, type FormEvent } from "react";
import type { Task, TaskPriority } from "@taskflow/types";
import { TASK_PRIORITY_LABELS } from "@taskflow/utils";

import { ApiError, createTask, listRecentTasks } from "@/lib/api";
import { AuthError, getSession, signIn, signOut, type ExtensionUser } from "@/lib/auth";
import { APP_URL } from "@/lib/config";

const PRIORITIES: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

function openWeb(path: string) {
  void chrome.tabs.create({ url: `${APP_URL}${path}` });
}

export function Popup() {
  const [bootstrapping, setBootstrapping] = useState(true);
  const [user, setUser] = useState<ExtensionUser | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function refreshTasks() {
    const items = await listRecentTasks(5);
    setTasks(items);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const session = await getSession();
        if (cancelled) return;
        setUser(session);
        if (session) {
          await refreshTasks();
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to restore session");
        }
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSignIn(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const nextUser = await signIn(email.trim(), password);
      setUser(nextUser);
      setPassword("");
      await refreshTasks();
      setNotice("Signed in");
    } catch (err) {
      const message =
        err instanceof AuthError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Sign-in failed";
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await signOut();
      setUser(null);
      setTasks([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-out failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await createTask({ title: title.trim(), priority });
      setTitle("");
      setPriority("MEDIUM");
      await refreshTasks();
      setNotice("Task created");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not create task";
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  if (bootstrapping) {
    return (
      <div className="loading" role="status">
        Loading TaskFlow…
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="brand-name">TaskFlow</div>
          <div className="brand-sub">{user ? "Quick add" : "Sign in to continue"}</div>
        </div>
        {user ? (
          <div className="user-meta">
            <span className="user-email" title={user.email}>
              {user.email}
            </span>
            <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => void handleSignOut()}>
              Sign out
            </button>
          </div>
        ) : null}
      </header>

      {error ? (
        <div className="status status-error" role="alert">
          {error}
        </div>
      ) : null}
      {notice ? (
        <div className="status status-ok" role="status">
          {notice}
        </div>
      ) : null}

      {!user ? (
        <form className="card" onSubmit={(e) => void handleSignIn(e)}>
          <h2 className="card-title">Account</h2>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={busy}
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={busy}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      ) : (
        <>
          <form className="card" onSubmit={(e) => void handleCreate(e)}>
            <h2 className="card-title">New task</h2>
            <div className="field">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                name="title"
                type="text"
                required
                maxLength={200}
                placeholder="What needs doing?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={busy}
              />
            </div>
            <div className="row">
              <div className="field">
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  name="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  disabled={busy}
                >
                  {PRIORITIES.map((value) => (
                    <option key={value} value={value}>
                      {TASK_PRIORITY_LABELS[value]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field" style={{ justifyContent: "flex-end" }}>
                <label htmlFor="submit-task">&nbsp;</label>
                <button id="submit-task" type="submit" className="btn btn-primary btn-block" disabled={busy || !title.trim()}>
                  {busy ? "Saving…" : "Add task"}
                </button>
              </div>
            </div>
          </form>

          <section className="card">
            <h2 className="card-title">Recent</h2>
            {tasks.length === 0 ? (
              <p className="empty">No tasks yet — add one above.</p>
            ) : (
              <ul className="task-list">
                {tasks.map((task) => (
                  <li key={task.id}>
                    <button
                      type="button"
                      className="task-item"
                      onClick={() => openWeb(`/tasks/${task.id}`)}
                      title="Open in TaskFlow"
                    >
                      <span className="task-title">{task.title}</span>
                      <span className={`badge badge-${task.priority}`}>{TASK_PRIORITY_LABELS[task.priority]}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      <footer className="footer">
        <button type="button" className="link" onClick={() => openWeb("/dashboard")}>
          Open dashboard
        </button>
        <button type="button" className="link" onClick={() => openWeb("/tasks")}>
          All tasks
        </button>
      </footer>
    </div>
  );
}
