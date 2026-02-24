'use client';

import { ReplyI } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { clientAxios } from '@/lib/axios/axios-client';

import { notFound } from 'next/navigation';
import ReplyCard from './reply-card';
import { RepliesListSkeleton } from '../skeletons/replies';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '../ui/empty';
import { MessageCircle, RocketIcon } from 'lucide-react';
import { Button } from '../ui/button';

export default function Replies({ postId }: { postId: string }) {
  const {
    data: replies,
    error,
    isLoading,
  } = useQuery({
    queryFn: async () => {
      const res = await clientAxios.get<ReplyI[]>(`/posts/${postId}/replies/`);
      if (res.status === 404) {
        notFound();
      }
      return res.data;
    },
    queryKey: ['replies', 'list', postId],
    staleTime: Infinity,
  });

  if (isLoading) {
    return <RepliesListSkeleton />;
  }

  if (error || !replies) {
    throw error;
  }

  if (replies.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MessageCircle />
          </EmptyMedia>
          <EmptyTitle>No Replies Yet</EmptyTitle>
          <EmptyDescription>
            No one has replied to this post yet, be the first!
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" size="sm">
            Reply now <RocketIcon />
          </Button>
        </EmptyContent>
      </Empty>
    );
  }
  const repliesList = replies.map((reply) => (
    <ReplyCard reply={reply} key={reply.id} />
  ));

  return (
    <section className="space-y-2">
      {repliesList}
      <div className="h-25 w-full flex items-center justify-center ">
        <span className="h-0.75 w-0.75 bg-gray-500 rounded-full"></span>
      </div>
    </section>
  );
}
