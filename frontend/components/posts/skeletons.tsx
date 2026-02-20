import { Skeleton } from '@/components/ui/skeleton';

export function PostSkeleton() {
  return (
    <div className="flex flex-col gap-2 w-100 mt-2">
      <div className=" flex items-center gap-4">
        <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
        <div className="space-y-2 w-full">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

export function PostsListSkeleton() {
  return (
    <div className="h-screen w-screen flex flex-col items-center gap-8 overflow-hidden">
      <PostSkeleton />
      <PostSkeleton />
      <PostSkeleton />
      <PostSkeleton />
    </div>
  );
}
