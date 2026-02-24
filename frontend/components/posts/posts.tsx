'use client';

import { useQuery } from '@tanstack/react-query';
import { clientAxios } from '@/lib/axios/axios-client';
import { PostI } from '@/types/posts';
import PostsCard from './post-card';
import { PostsListSkeleton } from '@/components/skeletons/posts';
import { Separator } from '../ui/separator';

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

  if (isLoading) return <PostsListSkeleton />;

  if (error) {
    throw error;
  }

  const postsList = posts?.map((post) => (
    <PostsCard post={post} key={post.id} />
  ));

  return (
    <div className="space-y-1.5 mb-10">
      {postsList}
      <Separator />
      <div className="h-25 w-full flex items-center justify-center ">
        <span className="h-0.75 w-0.75 bg-gray-500 rounded-full"></span>
      </div>
    </div>
  );
}
