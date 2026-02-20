'use client';

import React, { useState } from 'react';
import { PostI, PostAuthorI } from '@/types';
import { formatPostDate } from '@/lib/utils';
import { Separator } from '../ui/separator';
import PostFooter from './post-footer';
import Image from 'next/image';
import { useInView } from 'react-intersection-observer';
import UserAvatar from '../user-avatar';
import { Button } from '../ui/button';
import {
  ArchiveXIcon,
  BookmarkIcon,
  EllipsisVerticalIcon,
  MessagesSquareIcon,
  SquarePenIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useQuery } from '@tanstack/react-query';
import { currentUserOptions } from '@/lib/query-options';

export default function PostsCard({ post }: { post: PostI }) {
  const { ref: postRef, inView: postIsInView } = useInView({
    triggerOnce: true,
  });

  return (
    <>
      <Separator />
      <div className="flex items-start px-3 gap-2" ref={postRef}>
        <UserAvatar user={post.author} />
        <div className="w-full">
          <div className="flex justify-between items-center">
            <PostAuthor author={post.author} createdAt={post.created_at} />
            <PostActionsMenu post={post} />
          </div>

          <section>
            <p className="font-normal text-[13px] md:text-[14px]">
              {post.content}
            </p>
            {post.media_url && (
              <div className="w-full aspect-video relative mt-1">
                {postIsInView && <PostMedia post={post} />}
              </div>
            )}
          </section>
          <PostFooter post={post} />
        </div>
      </div>
    </>
  );
}

type PostAuthorProps = {
  author: PostAuthorI;
  createdAt: string;
};

function PostAuthor({ author, createdAt }: PostAuthorProps) {
  return (
    <section className=" text-[13px] md:text-[15px] flex items-center gap-2">
      <p className="font-semibold">{author.profile.name}</p>
      <p className="text-gray-500">@{author.username}</p>
      <span className="h-1 w-1 bg-gray-500 rounded-full"></span>
      <p className=" text-gray-500">{formatPostDate(createdAt)}</p>
    </section>
  );
}

function PostMedia({ post }: { post: PostI }) {
  if (post.media_type == 'image' && post.media_url) {
    return (
      <Image
        src={post.media_url}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        alt="post image"
        className="rounded-md "
        loading="eager"
      />
    );
  } else if (post.media_type == 'video' && post.media_url) {
    return (
      <video
        controls
        className=" w-full h-auto max-h-130 rounded-md"
        src={post.media_url}
      ></video>
    );
  } else {
    return null;
  }
}

function PostActionsMenu({ post }: { post: PostI }) {
  const { data: currentUser } = useQuery(currentUserOptions);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          <EllipsisVerticalIcon />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem>
          <MessagesSquareIcon /> View replies
        </DropdownMenuItem>

        {!post.is_bookmarked_by_me && post.author_id !== currentUser?.id && (
          <DropdownMenuItem>
            <BookmarkIcon /> Bookmark
          </DropdownMenuItem>
        )}
        {post.author_id == currentUser?.id && (
          <>
            <DropdownMenuItem>
              <SquarePenIcon />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive">
              <ArchiveXIcon />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
