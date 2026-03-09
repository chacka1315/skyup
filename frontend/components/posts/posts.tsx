'use client';

import { useQuery } from '@tanstack/react-query';
import { clientAxios } from '@/lib/axios/axios-client';
import { PostI } from '@/types/posts';
import PostsCard from './post-card';
import { PostsListSkeleton } from '@/components/skeletons/posts';
import { Separator } from '../ui/separator';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '../ui/empty';
import { Button } from '../ui/button';
import { FeatherIcon, RocketIcon, StickerIcon } from 'lucide-react';
import Link from 'next/link';
import useAppStore from '@/lib/store/store';

export default function Posts() {
  const {
    data: posts,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['posts', 'feed'],
    queryFn: async () => {
      const res = await clientAxios.get<PostI[]>('/posts/');
      return res.data;
    },
    staleTime: Infinity,
    retry: false,
  });

  const setPostAreaIsOpen = useAppStore(
    (state) => state.setCreatePostAreaIsOpen,
  );
  const postAreaIsOpen = useAppStore((state) => state.createPostAreaIsOpen);

  if (isLoading) return <PostsListSkeleton />;

  if (error) {
    throw error;
  }

  const postsList = posts?.map((post) => (
    <PostsCard post={post} key={post.id} />
  ));

  return (
    <div className="relative space-y-1.5 mb-10">
      {postsList?.length === 0 ? <NoPosts /> : postsList}
      <Separator />
      <div className="h-25 w-full flex items-center justify-center ">
        <span className="h-0.75 w-0.75 bg-gray-500 rounded-full"></span>
      </div>
      <Button
        className="h-12 w-12 lg:hidden gap-0 rounded-full fixed bottom-12 right-8"
        onClick={() => setPostAreaIsOpen(!postAreaIsOpen)}
      >
        +<FeatherIcon />
      </Button>
    </div>
  );
}

function NoPosts() {
  const setUsersTab = useAppStore((state) => state.setSelectedUsersTab);
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <StickerIcon />
        </EmptyMedia>
        <EmptyTitle>Your News Feed Is Empty</EmptyTitle>
        <EmptyDescription>
          None of your followings users have published yet. You must follow some
          users to see there posts.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link href="/users" onClick={() => setUsersTab('all')}>
          <Button variant="outline" size="sm">
            Start follow some users <RocketIcon />
          </Button>
        </Link>
      </EmptyContent>
    </Empty>
  );
}
