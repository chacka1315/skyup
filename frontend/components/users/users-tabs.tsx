'use client';

import useAppStore from '@/lib/store/store';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import Followers from './followers';
import Followings from './followings';
import AllUsers from './all-users';
import Title from '../title';
import { Separator } from '../ui/separator';

export default function UsersTabs() {
  const selectedTab = useAppStore((state) => state.selectedUsersTab);
  const setSelectedTab = useAppStore((state) => state.setSelectedUsersTab);

  return (
    <>
      <Title title="Users" />
      <Separator />
      <Tabs defaultValue={selectedTab} className="flex py-2.5 ">
        <div className="max-w-160 w-full self-center px-3">
          <TabsList className="w-full">
            <TabsTrigger
              value="followers"
              onClick={() => setSelectedTab('followers')}
            >
              Followers
            </TabsTrigger>
            <TabsTrigger
              value="followings"
              onClick={() => setSelectedTab('followings')}
            >
              Followings
            </TabsTrigger>
            <TabsTrigger value="all" onClick={() => setSelectedTab('all')}>
              All
            </TabsTrigger>
          </TabsList>
        </div>
        <Followers />
        <Followings />
        <AllUsers />
      </Tabs>
    </>
  );
}
