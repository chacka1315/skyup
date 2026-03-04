'use client';

import React from 'react';
import { TrendsSkeleton } from './skeletons/posts';
import { useQuery } from '@tanstack/react-query';
import { clientAxios } from '@/lib/axios/axios-client';
import { PostI } from '@/types';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { formatPostDate } from '@/lib/utils';
import { HeartIcon, MessageCircleIcon } from 'lucide-react';
import Link from 'next/link';

export default function Trends() {
  const {
    data: trends,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['posts', 'trends'],
    queryFn: async () => {
      const res = await clientAxios.get<PostI[]>(`/posts/trends/`);
      return res.data;
    },
    staleTime: Infinity,
  });

  if (error) {
    throw error;
  }

  const trendsList = trends?.map((trend) => (
    <TrendCard trend={trend} key={trend.id} />
  ));

  return (
    <div className="flex justify-baseline px-5 py-1 h-screen border-l  border-gray-200 sticky top-0 right-0 w-full">
      <div className="w-90 px-3 h-fit pt-1 pb-5 space-y-2 bg-gray-200 rounded-md">
        <div>
          <p className="font-bold text-[20px]">What&apos;s happening?</p>
          <p className="text-gray-500 text-sm">Trending on Skyup</p>
        </div>
        {isLoading ? (
          <TrendsSkeleton />
        ) : (
          <div className="space-y-3">{trendsList}</div>
        )}
      </div>
    </div>
  );
}

function TrendCard({ trend }: { trend: PostI }) {
  return (
    <Link href={`/posts/${trend.id}`} className="flex gap-2 w-full max-w-105 ">
      <div className="w-full space-y-1">
        <div className=" flex items-center gap-1">
          <Avatar className="size-6">
            <AvatarImage src={trend.author.profile.avatar_url ?? undefined} />
            <AvatarFallback className="bg-primary font-bold text-primary-foreground">
              {trend.author.profile.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <section className=" text-[13px]  flex items-center gap-2">
            <p className="font-semibold">{trend.author.profile.name}</p>
            <span className="h-0.5 w-0.5 bg-gray-500 rounded-full"></span>
            <p className=" text-gray-500">{formatPostDate(trend.created_at)}</p>
          </section>
        </div>
        <p className="text-[14px]">{trend.content.slice(0, 60) + '...'}</p>
        <div className="flex items-center gap-2 text-[12px]">
          <p className="flex items-center">
            <MessageCircleIcon className="size-3" /> {trend.replies_count}
          </p>
          <p className="flex items-center">
            <HeartIcon className="size-3" /> {trend.likes_count}
          </p>
        </div>
      </div>
      {trend.media_url && <TrendMedia trend={trend} />}
    </Link>
  );
}

function TrendMedia({ trend }: { trend: PostI }) {
  if (trend.media_type === 'image' && trend.media_url) {
    return (
      <Image
        src={trend.media_url}
        alt="trend image"
        className="rounded-md h-20 w-20 shrink-0"
        width={80}
        height={80}
      />
    );
  } else if (trend.media_type === 'video' && trend.media_url) {
    return (
      <video
        controls
        controlsList="play"
        className=" w-20 h-20 rounded-md object-cover"
        src={trend.media_url}
      ></video>
    );
  } else {
    return null;
  }
}
