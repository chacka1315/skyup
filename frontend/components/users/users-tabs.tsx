'use client';

import useAppStore from '@/lib/store/store';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import Followers from './followers';
import Followings from './followings';
import AllUsers from './all-users';
import Title from '../title';

export default function UsersTabs() {
  const selectedTab = useAppStore((state) => state.selectedUsersTab);

  return (
    <>
      <Title title="Users" />
      <Tabs defaultValue={selectedTab} className="flex py-2.5 ">
        <div className="max-w-160 w-full self-center px-3">
          <TabsList className="w-full">
            <TabsTrigger value="followers" className="">
              Followers
            </TabsTrigger>
            <TabsTrigger value="followings">Followings</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </div>
        <Followers />
        <Followings />
        <AllUsers />
      </Tabs>
    </>
  );
}
