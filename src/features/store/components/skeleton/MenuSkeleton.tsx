import { Skeleton } from "@/components/ui/skeleton";

export function MenuSkeleton() {
  return (
    <div className="w-full space-y-4 pt-2">
      {/* Header Row Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-9 w-32" />
      </div>

      {/* Grid Menu Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl border p-4 shadow-sm"
          >
            {/* Image Thumbnail placeholder */}
            <Skeleton className="h-16 w-16 shrink-0 rounded-lg" />

            {/* Text details placeholders */}
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="mt-1 h-4 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
