import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MenuSkeletonProps {
  /** The number of skeleton items to render. Defaults to 4. */
  count?: number;
  /** Whether to show the top header row ("Daily Menu" and actions). Defaults to true. */
  showHeader?: boolean;
  /** Whether to reserve space for the bottom action button in the card[cite: 2, 3]. Defaults to false. */
  shouldShowEditButton?: boolean;
  type?: "sheet" | "section";
}

export function MenuSkeleton({
  count = 4,
  showHeader = true,
  shouldShowEditButton = false,
  type,
}: MenuSkeletonProps) {
  return (
    <div className="col-span-1 w-full grid-cols-4 space-y-4 sm:col-span-5">
      {/* 1. Conditional Header Section: Present in MenuSection, hidden in MenuSheet */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-28" />{" "}
          {/* "Daily Menu" heading placeholder[cite: 4] */}
          {shouldShowEditButton && (
            <Skeleton className="h-9 w-32 rounded-md" />
          )}{" "}
          {/* CreateMenuDialog placeholder[cite: 4] */}
        </div>
      )}

      {/* 2. Grid Container: Uses responsive layout matching MenuSection[cite: 4] */}
      <div
        className={cn(
          "grid grid-cols-2 gap-4",
          type === "sheet" ? "sm:grid-cols-2" : "md:grid-cols-3",
        )}
      >
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="relative col-span-1 overflow-hidden pt-0">
            {/* Badge Placeholder */}
            <Skeleton className="absolute top-4 right-4 z-10 h-5 w-20 rounded-full" />

            {/* Aspect Video Image Placeholder */}
            <div className="relative aspect-video w-full">
              <Skeleton className="h-full w-full rounded-none" />
            </div>

            {/* Content Placeholders */}
            <CardContent className="mt-4 flex flex-col gap-2">
              {/* Title & Price Row */}
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-1/3" /> {/* Name */}
                <Skeleton className="h-5 w-16" /> {/* Price */}
              </div>

              {/* Description Lines */}
              <div className="mt-1 space-y-1.5">
                <Skeleton className="h-3 w-full" />
              </div>
            </CardContent>

            {/* Optional Edit Actions Footer[cite: 2, 3] */}
            {shouldShowEditButton && (
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
