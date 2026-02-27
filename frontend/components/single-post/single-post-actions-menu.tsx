'use client';

import { Button } from '../ui/button';
import {
  ArchiveXIcon,
  EllipsisVerticalIcon,
  SquarePenIcon,
  UserPlusIcon,
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
import { useFollowAuthor } from '@/hooks/use-follow';
import { BookmarkPlusIcon, BookmarkXIcon } from 'lucide-react';
import { usePostBookmark } from '@/hooks/use-post-bookmark';

export default function PostActionsMenu({
  post,
  setIsEditing,
}: {
  post: PostI;
  setIsEditing: React.Dispatch<boolean>;
}) {
  const { data: currentUser } = useQuery(currentUserOptions);

  const postDelete = usePostDelete(post.id);

  const handleDelete = () => {
    postDelete.mutate();
  };

  const authorFollow = useFollowAuthor();

  const handleFollow = () => {
    authorFollow.send_follow(post);
  };
  const bookmark = usePostBookmark(post.id);

  const handleBookmark = () => {
    bookmark.toggle(post.is_bookmarked_by_me ? 'remove' : 'add');
  };
  let followBtn: React.ReactNode;

  if (currentUser?.id !== post.author.id) {
    followBtn = !post.author.is_followed ? (
      <DropdownMenuItem onClick={handleFollow}>
        <UserPlusIcon /> Follow @{post.author.username}
      </DropdownMenuItem>
    ) : null;
  } else {
    followBtn = null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          <EllipsisVerticalIcon />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        {followBtn}
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
        {post.author_id == currentUser?.id && (
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
