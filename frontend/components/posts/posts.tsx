'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { clientAxios } from '@/lib/axios/axios-client';
import { PostI } from '@/types/posts';
import PostsCard from './post-card';
import { PostsListSkeleton } from '@/components/posts/skeletons';

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
    retry: false,
  });

  const postsList = posts?.map((post) => (
    <PostsCard post={post} key={post.id} />
  ));

  if (isLoading) return <PostsListSkeleton />;

  if (error) {
    throw error;
  }

  return <div className="space-y-1.5 mb-10">{postsList}</div>;
}
