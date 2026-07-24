import { Skeleton } from "@/components/ui/skeleton";

export default function TasksLoading() {
  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 md:px-6 md:py-10">
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-56" />
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
      <Skeleton className="h-28 w-full rounded-2xl" />
      <div className="space-y-2">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
      </div>
    </main>
  );
}
