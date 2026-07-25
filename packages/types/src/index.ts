export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "ARCHIVED";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface UserPublic {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  archived: number;
  overdue: number;
  completedThisWeek: number;
  byPriority: Record<TaskPriority, number>;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface SketchPoint {
  x: number;
  y: number;
}

export interface SketchStroke {
  id: string;
  color: string;
  width: number;
  points: SketchPoint[];
}

export interface SketchDocument {
  version: 1;
  width: number;
  height: number;
  strokes: SketchStroke[];
}

export interface Sketch {
  id: string;
  taskId: string;
  userId: string;
  storagePath?: string | null;
  /** Short-lived signed URL — never persist; present when storagePath exists. */
  imageUrl?: string | null;
  dataJson: SketchDocument;
  createdAt: string;
  updatedAt: string;
}
