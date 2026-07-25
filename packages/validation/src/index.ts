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

const MAX_SKETCH_JSON_BYTES = 256 * 1024;
const MAX_STROKES = 500;
const MAX_POINTS_PER_STROKE = 2000;
const MAX_POINTS_TOTAL = 20_000;

export const sketchPointSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
});

export const sketchStrokeSchema = z.object({
  id: z.string().trim().min(1).max(64),
  color: z.string().trim().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/),
  width: z.number().positive().max(64),
  points: z.array(sketchPointSchema).min(1).max(MAX_POINTS_PER_STROKE),
});

export const sketchDocumentSchema = z
  .object({
    version: z.literal(1),
    width: z.number().int().positive().max(4000),
    height: z.number().int().positive().max(4000),
    strokes: z.array(sketchStrokeSchema).max(MAX_STROKES),
  })
  .superRefine((doc, ctx) => {
    const totalPoints = doc.strokes.reduce((sum, stroke) => sum + stroke.points.length, 0);
    if (totalPoints > MAX_POINTS_TOTAL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Sketch has too many points (max ${MAX_POINTS_TOTAL})`,
        path: ["strokes"],
      });
    }
    const bytes = new TextEncoder().encode(JSON.stringify(doc)).byteLength;
    if (bytes > MAX_SKETCH_JSON_BYTES) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Sketch payload exceeds ${MAX_SKETCH_JSON_BYTES} bytes`,
        path: ["strokes"],
      });
    }
  });

export const sketchUpsertSchema = z.object({
  taskId: z.string().trim().min(1),
  dataJson: sketchDocumentSchema,
});

export const sketchUpdateSchema = z.object({
  dataJson: sketchDocumentSchema.optional(),
});

export type SketchDocumentInput = z.infer<typeof sketchDocumentSchema>;
export type SketchUpsertInput = z.infer<typeof sketchUpsertSchema>;
export type SketchUpdateInput = z.infer<typeof sketchUpdateSchema>;

export const SKETCH_LIMITS = {
  maxJsonBytes: MAX_SKETCH_JSON_BYTES,
  maxStrokes: MAX_STROKES,
  maxPointsPerStroke: MAX_POINTS_PER_STROKE,
  maxPointsTotal: MAX_POINTS_TOTAL,
} as const;
