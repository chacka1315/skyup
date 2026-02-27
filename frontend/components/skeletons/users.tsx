import { Skeleton } from '../ui/skeleton';

function UserSkeleton() {
  return (
    <div className="flex gap-2 w-full max-w-176 px-4 md:px-8">
      <Skeleton className="h-8  w-8 rounded-full shrink-0" />
      <div className="w-full flex flex-col gap-2">
        <Skeleton className="h-3 w-30" />
        <Skeleton className="h-2 w-20" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}

export function UsersSkeleton() {
  return (
    <div className="w-full  flex flex-col items-center gap-6 mt-5">
      <UserSkeleton />
      <UserSkeleton />
      <UserSkeleton />
      <UserSkeleton />
      <UserSkeleton />
      <UserSkeleton />
    </div>
  );
}
