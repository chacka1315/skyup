'use client';

import { Button } from '../ui/button';
import {
  BookmarkIcon,
  CalendarDaysIcon,
  HeartIcon,
  MessageCircleIcon,
} from 'lucide-react';
import { PostI } from '@/types';
import clsx from 'clsx';
import { usePostBookmark } from '@/hooks/use-post-bookmark';
import { usePostLike } from '@/hooks/use-post-like ';
import { Separator } from '../ui/separator';
import { formatPostTime, formatSinglePostDate } from '@/lib/utils';

export default function PostFooter({ post }: { post: PostI }) {
  const bookmark = usePostBookmark(post.id);
  const like = usePostLike(post.id);

  const handleLike = () => {
    like.toggle(post.is_liked_by_me ? 'remove' : 'add');
  };

  const handleBookmark = () => {
    bookmark.toggle(post.is_bookmarked_by_me ? 'remove' : 'add');
  };

  return (
    <section className="">
      <div className=" text-gray-500 flex px-3 gap-1 items-center">
        <CalendarDaysIcon className="size-4" />
        <p>{formatPostTime(post.created_at)}</p>
        <span className="h-0.5 w-0.5 bg-gray-500 rounded-full"></span>
        <p>{formatSinglePostDate(post.created_at)}</p>
      </div>
      <Separator />
      <div className="flex items-center justify-start gap-4 px-3 py-2 mt-1 flex-wrap">
        <p className="text-gray-500">
          <span className="font-bold text-black">{post.replies_count}</span>{' '}
          replies
        </p>

        <p className="text-gray-500">
          <span className="font-bold text-black">{post.likes_count}</span> likes
        </p>
        <p className="text-gray-500">
          <span className="font-bold text-black">{post.bookmarks_count}</span>{' '}
          bookmarks
        </p>
      </div>
      <Separator />
      <div className="flex items-center justify-start gap-16 px-3 py-2 mt-1">
        <Button
          className="text-gray-500 font-normal gap-0.5 has-[>svg]:px-1 has-[>svg]:py-1 h-fit"
          variant="ghost"
        >
          <MessageCircleIcon />
        </Button>
        <Button
          variant="ghost"
          className={clsx(
            'text-gray-500 font-normal gap-0.5 has-[>svg]:px-1 has-[>svg]:py-1 h-fit',
            { 'text-pink-500': post.is_liked_by_me },
          )}
          onClick={handleLike}
        >
          <HeartIcon
            className={clsx({
              'stroke-pink-500 fill-pink-500': post.is_liked_by_me,
            })}
          />
        </Button>
        <Button
          variant="ghost"
          className={clsx(
            'text-gray-500 font-normal gap-0.5 has-[>svg]:px-1 has-[>svg]:py-1 h-fit',
            { 'text-primary': post.is_bookmarked_by_me },
          )}
          onClick={handleBookmark}
        >
          <BookmarkIcon
            className={clsx({
              'stroke-primary fill-primary': post.is_bookmarked_by_me,
            })}
          />
        </Button>
      </div>
      <Separator />
    </section>
  );
}
