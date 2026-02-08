import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("skeleton", className)} />;
}

export function MovieCardSkeleton() {
  return (
    <div className="clay-card overflow-hidden">
      <Skeleton className="aspect-[2/3] w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative h-[80vh] w-full">
      <Skeleton className="absolute inset-0 rounded-none" />
      <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
        <Skeleton className="h-12 w-2/3 max-w-lg" />
        <Skeleton className="h-6 w-1/2 max-w-sm" />
        <div className="flex gap-3">
          <Skeleton className="h-12 w-40 rounded-[var(--clay-radius-sm)]" />
          <Skeleton className="h-12 w-40 rounded-[var(--clay-radius-sm)]" />
        </div>
      </div>
    </div>
  );
}

export function BentoGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      <div className="md:col-span-2 md:row-span-2">
        <MovieCardSkeleton />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  );
}
