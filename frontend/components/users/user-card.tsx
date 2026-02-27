import { UserI } from '@/types';
import React from 'react';
import UserAvatar from '../user-avatar';
import type { UserCardT } from '@/types';
import { Button } from '../ui/button';
import { UserIcon } from 'lucide-react';
import { AlertDialog, AlertDialogTrigger } from '../ui/alert-dialog';
import UnfollowDialog from './unfollow-dialog';
import { useQuery } from '@tanstack/react-query';
import { currentUserOptions } from '@/lib/query-options';

type UseCardProps = {
  user: UserI;
  kind: UserCardT;
  followFns: {
    follow: (user: UserI) => void;
    unfollow: (user: UserI) => void;
  };
};

export default function UserCard({ user, kind, followFns }: UseCardProps) {
  const handleFollow = () => followFns.follow(user);
  const handleUnfollow = () => followFns.unfollow(user);
  const { data: currentUser } = useQuery(currentUserOptions);

  return (
    <>
      <hr />
      <div className="flex flex-col  p-3 gap-1">
        {kind === 'follower' && (
          <p className="text-gray-500 font-medium text-[11px] flex items-center">
            <UserIcon className="fill-gray-500 stroke-0 size-4" /> Follow you
          </p>
        )}
        <div className="flex items-start gap-2">
          <UserAvatar user={user} />
          <div className=" text-[13px] md:text-[15px] flex flex-col leading-none w-full">
            <div className="flex justify-between w-full">
              <div>
                <p className="font-semibold mb-1">{user.profile.name}</p>
                <p className="text-gray-500 text-[13px]">@{user.username}</p>
              </div>
              {kind === 'follower' && user.is_followed_by_me === false && (
                <Button
                  className="rounded-full px-2 py-2 h-fit text-[13px]"
                  onClick={handleFollow}
                >
                  Follow back
                </Button>
              )}
              {kind === 'all' &&
                user.is_followed_by_me === false &&
                user.id !== currentUser?.id && (
                  <Button
                    className="rounded-full px-2 py-2 h-fit text-[13px]"
                    onClick={handleFollow}
                  >
                    Follow
                  </Button>
                )}
              {kind === 'following' && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      className="rounded-full px-2 py-2 h-fit text-[13px]"
                      variant="outline"
                    >
                      Following
                    </Button>
                  </AlertDialogTrigger>
                  <UnfollowDialog
                    to_unfollow_name={user.profile.name}
                    confirmFn={handleUnfollow}
                  />
                </AlertDialog>
              )}
            </div>
            {user.profile.bio &&  <p className="mt-3">{user.profile.bio}</p>}
           
          </div>
        </div>
      </div>
    </>
  );
}
