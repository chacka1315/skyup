'use client';

import { Button } from '../ui/button';
import { BookmarkIcon, HeartIcon, MessageCircleIcon } from 'lucide-react';
import { PostI } from '@/types';
import clsx from 'clsx';
import { usePostBookmark } from '@/hooks/use-post-bookmark';
import { usePostLike } from '@/hooks/use-post-like ';

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
    <section className="flex items-center justify-start gap-16 -translate-x-3 mt-1">
      <Button
        className="text-gray-500 font-normal gap-0.5 has-[>svg]:px-1 has-[>svg]:py-1 h-fit"
        variant="ghost"
      >
        <MessageCircleIcon />
        <p>{post.replies_count}</p>
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
        <p>{post.likes_count}</p>
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
        <p>{post.bookmarks_count}</p>
      </Button>
    </section>
  );
}
