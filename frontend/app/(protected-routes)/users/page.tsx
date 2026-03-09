import UsersTabs from '@/components/users/users-tabs';
import { Separator } from '@/components/ui/separator';

export default function Page() {
  return (
    <div>
      <UsersTabs />
      <Separator />
      <div className="h-25 w-full flex items-center justify-center ">
        <span className="h-0.75 w-0.75 bg-gray-500 rounded-full"></span>
      </div>
    </div>
  );
}
