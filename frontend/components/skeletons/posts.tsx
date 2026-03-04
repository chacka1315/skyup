import { Skeleton } from '@/components/ui/skeleton';

export function PostSkeleton() {
  return (
    <div className="flex flex-col gap-2 w-full max-w-176 px-4 md:px-8">
      <div className=" flex items-center gap-4">
        <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
        <Skeleton className="h-4 w-full" />
      </div>
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

export function PostsListSkeleton() {
  return (
    <div className="h-screen w-full  flex flex-col items-center gap-8 mt-1">
      <PostSkeleton />
      <PostSkeleton />
      <PostSkeleton />
      <PostSkeleton />
    </div>
  );
}

export function SinglePostSkeleton() {
  return <PostSkeleton />;
}

function TrendSkeleton() {
  return (
    <div className="flex gap-2 w-full max-w-105 ">
      <div className="w-full space-y-1">
        <div className=" flex items-center gap-4">
          <Skeleton className="h-6 w-6 shrink-0 rounded-full  bg-white" />
          <Skeleton className="h-4 w-full rounded-full  bg-white" />
        </div>
        <Skeleton className="h-13 w-full  bg-white" />
      </div>
      <Skeleton className="h-20 w-20 rounded-md shrink-0 bg-white" />
    </div>
  );
}

export function TrendsSkeleton() {
  return (
    <div className=" w-full flex flex-col items-center gap-8 mt-1">
      <TrendSkeleton />
      <TrendSkeleton />
      <TrendSkeleton />
      <TrendSkeleton />
    </div>
  );
}
