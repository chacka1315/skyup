import React from 'react';
import { TabsContent } from '../ui/tabs';
import { UsersSkeleton } from '../skeletons/users';
import { useQuery } from '@tanstack/react-query';
import { clientAxios } from '@/lib/axios/axios-client';
import { UserI } from '@/types';
import UserCard from './user-card';
import { useFollowUser } from '@/hooks/use-follow';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { UserIcon } from 'lucide-react';

export default function Followings() {
  const {
    data: followings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['users', 'followings'],
    queryFn: async () => {
      const res = await clientAxios.get<UserI[]>('/relations/followings');
      return res.data;
    },
    staleTime: 1000 * 60 * 10,
  });

  const followFns = useFollowUser();

  if (isLoading) {
    return <UsersSkeleton />;
  }

  if (error) {
    throw error;
  }

  const followingsList = followings?.map((f) => {
    return (
      <UserCard kind="following" user={f} key={f.id} followFns={followFns} />
    );
  });
  return (
    <TabsContent value="followings">
      {!followingsList?.length ? <NoFollowings /> : followingsList}
    </TabsContent>
  );
}

function NoFollowings() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <UserIcon />
        </EmptyMedia>
        <EmptyTitle>No Followings Yet</EmptyTitle>
        <EmptyDescription>You have not followed a user.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
