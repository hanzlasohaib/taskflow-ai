import { Button } from "@taskflow/ui";
import { TASK_STATUS_LABELS } from "@taskflow/utils";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-16">
      <div className="space-y-2">
        <p className="text-sm font-medium tracking-wide text-teal-700 uppercase">TaskFlow</p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
          Project setup complete
        </h1>
        <p className="max-w-xl text-slate-600">
          Monorepo, Next.js, Tailwind CSS v4, and shared packages are wired. UI tokens and themed
          screens wait for the frozen Figma dashboard (Design Gate D.05).
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button">shadcn Button baseline</Button>
        <span className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
          Sample status: {TASK_STATUS_LABELS.TODO}
        </span>
      </div>
    </main>
  );
}
