import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { BellIcon } from 'lucide-react';
import React from 'react';

export default function Page() {
  return (
    <div>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BellIcon />
          </EmptyMedia>
          <EmptyTitle>No Notifications Yet</EmptyTitle>
          <EmptyDescription>
            Actually, this feature is not implemented yet. I will add it soon.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>Comming soon...</EmptyContent>
      </Empty>
    </div>
  );
}
