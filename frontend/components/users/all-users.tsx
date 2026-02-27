import React from 'react';
import { TabsContent } from '../ui/tabs';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Search, UserIcon, LoaderIcon, SearchAlert } from 'lucide-react';
import { UsersSkeleton } from '../skeletons/users';
import { useQuery } from '@tanstack/react-query';
import UserCard from './user-card';
import { UserI } from '@/types';
import { clientAxios } from '@/lib/axios/axios-client';
import { useFollowUser } from '@/hooks/use-follow';
import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

export default function AllUsers() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const followFns = useFollowUser();

  const {
    data: allUsers,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['users', 'all'],
    queryFn: async () => {
      console.log('Searching all users');
      const res = await clientAxios.get<UserI[]>('/users/');
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: searchedUsers,
    isLoading: searchIsLoading,
    error: searchError,
  } = useQuery({
    queryKey: ['users', 'all', searchQuery],
    queryFn: async () => {
      console.log('Searching users with query:', searchQuery);
      if (searchQuery.length > 50) return [];
      const res = await clientAxios.get<UserI[]>('/users/', {
        params: {
          name: searchQuery,
        },
      });

      return res.data;
    },
    staleTime: 1000 * 60 * 5,
    enabled: searchQuery.length > 0 && searchQuery.length <= 50,
  });

  const debounceSearch = useDebouncedCallback(
    (value) => setSearchQuery(value),
    500,
  );

  if (isLoading) {
    return <UsersSkeleton />;
  }

  if (error) {
    throw error;
  }

  let usersList: React.ReactNode[] | undefined = [];

  if (searchQuery.length) {
    usersList = searchedUsers?.map((user) => {
      return (
        <UserCard user={user} key={user.id} kind="all" followFns={followFns} />
      );
    });
  } else {
    usersList = allUsers?.map((user) => {
      return (
        <UserCard user={user} key={user.id} kind="all" followFns={followFns} />
      );
    });
  }

  return (
    <TabsContent value="all" className="flex flex-col">
      <div className="max-w-160 w-full self-center px-3 mb-4">
        <InputGroup className="w-full rounded-md">
          <InputGroupInput
            placeholder="Search..."
            maxLength={50}
            onChange={(e) => debounceSearch(e.target.value)}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            {searchIsLoading ? (
              <LoaderIcon className="animate-spin size-5 stroke-[2px]" />
            ) : (
              searchQuery && `${searchedUsers?.length} results`
            )}
          </InputGroupAddon>
        </InputGroup>
      </div>
      {usersList?.length === 0 ? <NoUser query={searchQuery} /> : usersList}
    </TabsContent>
  );
}

function NoUser({ query }: { query: string }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchAlert />
        </EmptyMedia>
        <EmptyTitle>No User Found</EmptyTitle>
        <EmptyDescription>
          <p>No user name mathes your search:</p>
          <p className="text-primary italic">{query}</p>
          <p>Try another name.</p>
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
