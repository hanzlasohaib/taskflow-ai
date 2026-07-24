import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="px-4 py-8 md:px-8">
      <div className="mb-6 space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <div className="flex flex-wrap gap-2.5">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-2">
          <Skeleton className="mb-4 h-8 w-full max-w-md" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  );
}
