'use client';

import { PostI, PostAuthorI } from '@/types';
import { formatPostDate } from '@/lib/utils';
import { Separator } from '../ui/separator';
import PostFooter from './post-footer';
import Image from 'next/image';
import { useInView } from 'react-intersection-observer';
import UserAvatar from '../user-avatar';
import PostActionsMenu from './post-actions-menu';
import { useState } from 'react';
import EditPost from './edit-post';
import Link from 'next/link';

export default function PostsCard({
  post,
  type = 'post',
}: {
  post: PostI;
  type?: 'post' | 'bookmark';
}) {
  const { ref: postRef, inView: postIsInView } = useInView({
    triggerOnce: true,
  });

  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <Separator />
      <div className="flex items-start px-3 gap-2" ref={postRef}>
        <UserAvatar user={post.author} />
        <div className="w-full">
          <div className="flex justify-between items-center">
            <Link href={`/posts/${post.id}`}>
              <PostAuthor author={post.author} createdAt={post.created_at} />
            </Link>
            <PostActionsMenu
              post={post}
              setIsEditing={setIsEditing}
              postCardType={type}
            />
          </div>

          <section>
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
      <span className="h-0.5 w-0.5 bg-gray-500 rounded-full"></span>
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
