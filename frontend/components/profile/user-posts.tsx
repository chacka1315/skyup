'use client';

import { useQuery } from '@tanstack/react-query';
import { clientAxios } from '@/lib/axios/axios-client';
import { PostI } from '@/types/posts';
import PostsCard from '../posts/post-card';
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
import { RocketIcon, StickerIcon } from 'lucide-react';
import useAppStore from '@/lib/store/store';

export default function UserPosts({
  user_id,
  isMe,
}: {
  user_id: string;
  isMe: boolean;
}) {
  const {
    data: posts,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['user-posts', user_id],
    queryFn: async () => {
      const res = await clientAxios.get<PostI[]>(`/users/${user_id}/posts/`);
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) return <PostsListSkeleton />;

  if (error) {
    throw error;
  }

  const postsList = posts?.map((post) => (
    <PostsCard post={post} key={post.id} />
  ));

  return (
    <div className="space-y-1.5 mb-10">
      {postsList?.length === 0 ? <NoPosts isMe={isMe} /> : postsList}
      <Separator />
      <div className="h-25 w-full flex items-center justify-center ">
        <span className="h-0.75 w-0.75 bg-gray-500 rounded-full"></span>
      </div>
    </div>
  );
}

function NoPosts({ isMe }: { isMe: boolean }) {
  const setPostAreaIsOpen = useAppStore(
    (state) => state.setCreatePostAreaIsOpen,
  );

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <StickerIcon />
        </EmptyMedia>
        <EmptyTitle>No Posts Yet</EmptyTitle>
        <EmptyDescription>
          {isMe
            ? 'You have not published posts yet.'
            : 'This user has not published posts yet.'}
        </EmptyDescription>
      </EmptyHeader>
      {isMe && (
        <EmptyContent>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPostAreaIsOpen(true)}
          >
            Create post now <RocketIcon />
          </Button>
        </EmptyContent>
      )}
    </Empty>
  );
}
