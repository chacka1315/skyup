'use client';

import { Button } from '../ui/button';
import {
  ArchiveXIcon,
  BookmarkPlusIcon,
  BookmarkXIcon,
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
import { PostI } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { currentUserOptions } from '@/lib/query-options';
import { usePostDelete } from '@/hooks/use-post-delete';
import Link from 'next/link';
import { usePostBookmark } from '@/hooks/use-post-bookmark';

export default function PostActionsMenu({
  post,
  setIsEditing,
  postCardType,
}: {
  post: PostI;
  setIsEditing: React.Dispatch<boolean>;
  postCardType: 'post' | 'bookmark';
}) {
  const { data: currentUser } = useQuery(currentUserOptions);

  const postDelete = usePostDelete(post.id);

  const handleDelete = () => {
    postDelete.mutate();
  };

  const bookmark = usePostBookmark(post.id);

  const handleBookmark = () => {
    bookmark.toggle(post.is_bookmarked_by_me ? 'remove' : 'add');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          <EllipsisVerticalIcon />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <Link href={`/posts/${post.id}`}>
          <DropdownMenuItem>
            <MessagesSquareIcon />
            View details
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem onClick={handleBookmark}>
          {post.is_bookmarked_by_me ? (
            <>
              <BookmarkXIcon />
              Remove bookmark
            </>
          ) : (
            <>
              <BookmarkPlusIcon />
              Bookmark
            </>
          )}
        </DropdownMenuItem>

        {post.author_id == currentUser?.id && postCardType === 'post' && (
          <>
            <DropdownMenuItem onClick={() => setIsEditing(true)}>
              <SquarePenIcon />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={handleDelete}>
              <ArchiveXIcon />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
