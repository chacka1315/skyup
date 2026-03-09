'use client';

import React from 'react';
import { PostI } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { clientAxios } from '@/lib/axios/axios-client';
import { SinglePostSkeleton } from '../skeletons/posts';
import { notFound } from 'next/navigation';
import PostCard from './single-post-card';
import { isAxiosError } from 'axios';

export default function SinglePost({ postId }: { postId: string }) {
  const {
    data: post,
    error,
    isLoading,
  } = useQuery({
    queryFn: async () => {
      const res = await clientAxios.get<PostI>(`/posts/${postId}/`);

      return res.data;
    },
    queryKey: ['posts', 'detail', postId],
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return <SinglePostSkeleton />;
  }

  if (error || !post) {
    if (isAxiosError(error) && error.response?.status === 404) {
      notFound();
    } else {
      throw error;
    }
  }

  return <PostCard post={post} />;
}
