import Title from '@/components/title';
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
      <Title title="Notifications" />
      <hr />
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BellIcon />
          </EmptyMedia>
          <EmptyTitle>No Notifications Ye :(</EmptyTitle>
          <EmptyDescription>
            Actually, this feature is not implemented yet. Stay tuned.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          Here, you will be able to see some notifications about new follow
          requests.
        </EmptyContent>
      </Empty>
    </div>
  );
}
