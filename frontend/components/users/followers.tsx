import React from 'react';
import { TabsContent } from '../ui/tabs';
import { UsersSkeleton } from '../skeletons/users';
import { useQuery } from '@tanstack/react-query';
import { clientAxios } from '@/lib/axios/axios-client';
import { UserI } from '@/types';
import UserCard from './user-card';
import type { UserCardT } from '@/types';
import { useFollowUser } from '@/hooks/use-follow';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { UserIcon } from 'lucide-react';

export default function Followers() {
  const {
    data: followers,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['users', 'followers'],
    queryFn: async () => {
      const res = await clientAxios.get<UserI[]>('/relations/followers');
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

  const followersList = followers?.map((f) => {
    return (
      <UserCard user={f} key={f.id} kind="follower" followFns={followFns} />
    );
  });
  return (
    <TabsContent value="followers">
      {followers?.length ? followersList : <NoFollowers />}
    </TabsContent>
  );
}

function NoFollowers() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <UserIcon />
        </EmptyMedia>
        <EmptyTitle>No Followers Yet</EmptyTitle>
        <EmptyDescription>No user is following your account.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
