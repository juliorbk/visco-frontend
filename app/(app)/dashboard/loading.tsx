import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-36 rounded-md" />
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4 shadow-xs">
            <div className="flex items-start justify-between">
              <Skeleton className="size-9 rounded-lg" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-28" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
            <Skeleton className="h-6 w-40 mb-4" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </div>
        <div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card shadow-xs">
            <div className="px-5 py-4 border-b border-border">
              <Skeleton className="h-6 w-40" />
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="px-5 py-3 border-t border-border flex gap-4">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card shadow-xs p-5">
              <Skeleton className="h-5 w-36 mb-3" />
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="flex items-center gap-3 p-3 rounded-lg ring-1 ring-border mb-2">
                  <Skeleton className="size-9 rounded-md shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-44" />
                  </div>
                  <Skeleton className="size-8 rounded-md" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
