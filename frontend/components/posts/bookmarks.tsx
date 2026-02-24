'use client';

import { useQuery } from '@tanstack/react-query';
import { clientAxios } from '@/lib/axios/axios-client';
import { PostI } from '@/types/posts';
import PostsCard from './post-card';
import { PostsListSkeleton } from '@/components/skeletons/posts';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '../ui/empty';
import { BookmarkIcon, MessageCircle, RocketIcon } from 'lucide-react';
import { Button } from '../ui/button';

export default function Bookmarks() {
  const {
    data: bookmarks,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['posts', 'bookmarks'],
    queryFn: async () => {
      const res = await clientAxios.get<PostI[]>('/posts/bookmarks/');
      return res.data;
    },
    staleTime: Infinity,
    retry: false,
  });

  if (bookmarks?.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BookmarkIcon />
          </EmptyMedia>
          <EmptyTitle>No Bookmarks Yet</EmptyTitle>
          <EmptyDescription>
            You have not bookmarked a post yet...
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }
  const postsList = bookmarks?.map((b) => (
    <PostsCard post={b} key={b.id} type="bookmark" />
  ));

  if (isLoading) return <PostsListSkeleton />;

  if (error) {
    throw error;
  }

  return <div className="space-y-1.5 mb-10">{postsList}</div>;
}
