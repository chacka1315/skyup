'use client';

import { PostI, PostAuthorI } from '@/types';
import { Separator } from '../ui/separator';
import PostFooter from './single-post-footer';
import Image from 'next/image';
import UserAvatar from '../user-avatar';
import PostActionsMenu from './single-post-actions-menu';
import { useState } from 'react';
import EditPost from '../posts/edit-post';
import Link from 'next/link';
import { Button } from '../ui/button';
import { useQuery } from '@tanstack/react-query';
import { currentUserOptions } from '@/lib/query-options';
import { useFollowAuthor } from '@/hooks/use-follow';

export default function PostCard({ post }: { post: PostI }) {
  const [isEditing, setIsEditing] = useState(false);
  const { data: currentUser } = useQuery(currentUserOptions);

  const authorFollow = useFollowAuthor();

  const handleFollow = () => {
    authorFollow.send_follow(post);
  };
  return (
    <>
      <Separator />
      <div className="flex flex-col gap-1 pt-3">
        <section className="flex justify-between items-center px-3">
          <div className="flex gap-2">
            <UserAvatar user={post.author} />
            <PostAuthor author={post.author} />
          </div>
          <div className="flex items-center">
            {!(
              post.author.is_followed || post.author.id === currentUser?.id
            ) && (
              <Button
                type="submit"
                className="rounded-full px-2 py-1 h-fit text-[13px]"
                onClick={handleFollow}
              >
                Follow
              </Button>
            )}
            <PostActionsMenu post={post} setIsEditing={setIsEditing} />
          </div>
        </section>

        <section className="p-3">
          {isEditing ? (
            <EditPost setIsEditing={setIsEditing} post={post} />
          ) : (
            <Link href={`/posts/${post.id}`}>
              <p className="font-normal text-[13px] md:text-[14px]">
                {post.content}
              </p>
            </Link>
          )}
          {post.media_url && (
            <div className="w-full aspect-video relative mt-1">
              <PostMedia post={post} />
            </div>
          )}
        </section>
        <PostFooter post={post} />
      </div>
    </>
  );
}

type PostAuthorProps = {
  author: PostAuthorI;
};

function PostAuthor({ author }: PostAuthorProps) {
  return (
    <div className=" text-[13px] md:text-[15px] flex flex-col">
      <p className="font-semibold">{author.profile.name}</p>
      <p className="text-gray-500">@{author.username}</p>
    </div>
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
