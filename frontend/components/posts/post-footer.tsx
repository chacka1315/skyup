'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { BookmarkIcon, HeartIcon, MessageCircleIcon } from 'lucide-react';
import { PostI } from '@/types';
import clsx from 'clsx';
import { usePostBookmark } from '@/hooks/use-post-bookmark';
import { usePostLike } from '@/hooks/use-post-like ';
import useAppStore from '@/lib/store/store';

export default function PostFooter({ post }: { post: PostI }) {
  const bookmark = usePostBookmark(post.id);
  const like = usePostLike(post.id);
  const [likeAnimating, setLikeAnimating] = useState(false);
  const [bookmarkAnimating, setBookmarkAnimating] = useState(false);
  const setPostToReply = useAppStore((state) => state.setPostToReply);
  const setCreateReplyAreaIsOpen = useAppStore(
    (state) => state.setCreateReplyAreaIsOpen,
  );
  const replyAreaIsOpen = useAppStore((state) => state.createReplyAreaIsOpen);

  const handleLike = () => {
    if (like.isPending) return;

    setLikeAnimating(false);
    requestAnimationFrame(() => setLikeAnimating(true));
    like.toggle(post.is_liked_by_me ? 'remove' : 'add');
  };

  const handleBookmark = () => {
    if (bookmark.isPending) return;

    setBookmarkAnimating(false);
    requestAnimationFrame(() => setBookmarkAnimating(true));
    bookmark.toggle(post.is_bookmarked_by_me ? 'remove' : 'add');
  };

  const handleReply = () => {
    setPostToReply(post);
    setCreateReplyAreaIsOpen(!replyAreaIsOpen);
  };

  return (
    <section className="flex items-center justify-start gap-16 -translate-x-3 mt-1">
      <Button
        className="text-gray-500 font-normal gap-0.5 has-[>svg]:px-1 has-[>svg]:py-1 h-fit"
        variant="ghost"
        onClick={handleReply}
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
            'animate-post-action': likeAnimating && post.is_liked_by_me,
            'stroke-pink-500 fill-pink-500': post.is_liked_by_me,
          })}
          onAnimationEnd={() => setLikeAnimating(false)}
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
            'animate-post-action':
              bookmarkAnimating && post.is_bookmarked_by_me,
            'stroke-primary fill-primary': post.is_bookmarked_by_me,
          })}
          onAnimationEnd={() => setBookmarkAnimating(false)}
        />
        <p>{post.bookmarks_count}</p>
      </Button>
    </section>
  );
}
