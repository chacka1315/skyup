import { Skeleton } from '@/components/ui/skeleton';

export function ReplySkeleton() {
  return (
    <div className="flex gap-2 w-full max-w-176 px-4 md:px-8">
      <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
      <div className="w-full flex flex-col  gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className=" h-30 md:h-40 w-full" />
      </div>
    </div>
  );
}

export function RepliesListSkeleton() {
  return (
    <div className="w-full flex flex-col items-center gap-5">
      <ReplySkeleton />
      <ReplySkeleton />
      <ReplySkeleton />
      <ReplySkeleton />
    </div>
  );
}
