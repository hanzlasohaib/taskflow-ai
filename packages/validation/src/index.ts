import { z } from "zod";

export const taskStatusSchema = z.enum(["TODO", "IN_PROGRESS", "DONE", "ARCHIVED"]);
export const taskPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

/** Accepts ISO datetime or datetime-local form values (YYYY-MM-DDTHH:mm). */
const optionalDateTime = z
  .string()
  .trim()
  .optional()
  .nullable()
  .refine(
    (value) => {
      if (value == null || value === "") return true;
      const normalized = value.length === 16 ? `${value}:00.000Z` : value;
      return !Number.isNaN(Date.parse(normalized));
    },
    { message: "Invalid datetime" },
  )
  .transform((value) => {
    if (value == null || value === "") return null;
    if (value.length === 16) return `${value}:00.000Z`;
    return value;
  });

export const taskCreateSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).optional().nullable(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  dueDate: optionalDateTime,
});

export const taskUpdateSchema = taskCreateSchema.partial();

export const taskListQuerySchema = z.object({
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  q: z.string().trim().max(200).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(["createdAt", "dueDate", "priority", "title"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;
export type TaskListQuery = z.infer<typeof taskListQuerySchema>;
