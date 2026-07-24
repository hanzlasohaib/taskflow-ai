import type { Task } from "@taskflow/types";

const now = Date.now();
const day = 86_400_000;

function iso(offsetMs: number): string {
  return new Date(now + offsetMs).toISOString();
}

/** Seed tasks for the public interactive demo — never written to the database. */
export const DEMO_USER_ID = "demo-guest";

export const DEMO_TASKS: Task[] = [
  {
    id: "demo-t1",
    userId: DEMO_USER_ID,
    title: "Implement OAuth2 authentication flow",
    description:
      "Set up Google and GitHub OAuth providers with session management and refresh token rotation.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    dueDate: iso(6 * 60 * 60 * 1000),
    completedAt: null,
    createdAt: iso(-2 * day),
    updatedAt: iso(-12 * 60 * 1000),
  },
  {
    id: "demo-t2",
    userId: DEMO_USER_ID,
    title: "Deploy backend API to production",
    description: "Deploy the API with Docker containers and configure auto-scaling.",
    status: "TODO",
    priority: "HIGH",
    dueDate: iso(2 * day),
    completedAt: null,
    createdAt: iso(-3 * day),
    updatedAt: iso(-1 * day),
  },
  {
    id: "demo-t3",
    userId: DEMO_USER_ID,
    title: "Prepare Loom walkthrough for client",
    description: "Record a product demo covering onboarding and the analytics dashboard.",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: iso(3 * day),
    completedAt: null,
    createdAt: iso(-1 * day),
    updatedAt: iso(-3 * 60 * 60 * 1000),
  },
  {
    id: "demo-t4",
    userId: DEMO_USER_ID,
    title: "Fix dashboard performance regression",
    description: "Investigate and resolve latency introduced in the latest chart rendering update.",
    status: "TODO",
    priority: "URGENT",
    dueDate: iso(-1 * day),
    completedAt: null,
    createdAt: iso(-5 * day),
    updatedAt: iso(-1 * day),
  },
  {
    id: "demo-t5",
    userId: DEMO_USER_ID,
    title: "Design system token audit",
    description: "Audit Tailwind tokens and component library for consistency before v2.0.",
    status: "DONE",
    priority: "MEDIUM",
    dueDate: iso(-2 * day),
    completedAt: iso(-2 * day),
    createdAt: iso(-7 * day),
    updatedAt: iso(-2 * day),
  },
  {
    id: "demo-t6",
    userId: DEMO_USER_ID,
    title: "Write OpenAPI 3.1 documentation",
    description: "Document REST endpoints with examples and publish docs.",
    status: "TODO",
    priority: "LOW",
    dueDate: iso(5 * day),
    completedAt: null,
    createdAt: iso(-4 * day),
    updatedAt: iso(-4 * 60 * 60 * 1000),
  },
];
