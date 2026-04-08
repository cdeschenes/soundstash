import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-surface-2", className)}
    />
  );
}

export function TrackCardSkeleton() {
  return (
    <div className="flex gap-4 p-4 border border-border rounded-lg">
      <Skeleton className="h-16 w-16 rounded flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <TrackCardSkeleton key={i} />
      ))}
    </div>
  );
}
