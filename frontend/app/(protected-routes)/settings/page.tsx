import Title from '@/components/title';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyDescription,
  EmptyContent,
  EmptyTitle,
} from '@/components/ui/empty';
import { Settings } from 'lucide-react';
import React from 'react';

export default function Page() {
  return (
    <div>
      <Title title="Settings" />
      <hr />
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Settings />
          </EmptyMedia>
          <EmptyTitle>No Settings Yet :(</EmptyTitle>
          <EmptyDescription>
            Actually, this feature is not implemented yet. Stay tuned!
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          You will be able to change your password, username and email address
          here.
        </EmptyContent>
      </Empty>
    </div>
  );
}
