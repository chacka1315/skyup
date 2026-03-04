'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  AtSignIcon,
  CalendarDaysIcon,
  GiftIcon,
  MailIcon,
  MapPinIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { currentUserOptions } from '@/lib/query-options';
import { clientAxios } from '@/lib/axios/axios-client';
import { notFound } from 'next/navigation';

import type { UserI } from '@/types';
import { isAxiosError } from 'axios';
import { Spinner } from '../ui/spinner';
import UserPosts from './user-posts';
import EditProfile from './EditProfile';

function formatDate(date: string) {
  return format(new Date(date), 'PP');
}

export default function Profile({ username }: { username: string }) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const {
    data: currentUser,
    isLoading: currentUserLoading,
    error: currentUserError,
  } = useQuery(currentUserOptions);

  const {
    data: userData,
    isLoading: userLoading,
    error: userError,
  } = useQuery({
    queryKey: ['users', 'profile', username],
    queryFn: async () => {
      const res = await clientAxios.get<UserI>(`/users/${username}/`);

      return res.data;
    },
    enabled: currentUser?.username !== username,
    staleTime: 1000 * 60 * 5,
  });

  if (currentUserError) {
    throw currentUserError;
  }

  if (userError) {
    if (isAxiosError(userError) && userError.response?.status === 404) {
      notFound();
    } else {
      throw userError;
    }
  }

  const user = username === currentUser?.username ? currentUser : userData;
  const isLoading = currentUserLoading || userLoading;
  const isMe = currentUser?.username === username;

  return (
    <div>
      <section className="w-full bg-background text-foreground">
        {isLoading && (
          <div className="w-full h-80 flex justify-center items-center text-primary">
            <Spinner className="size-8 md:size-10" />
          </div>
        )}
        {user && (
          <div className="w-full h-full">
            <div className="relative mb-10">
              <div className="w-full h-45 md:h-50  overflow-hidden relative">
                {user.profile.banner_url ? (
                  <img
                    src={user.profile.banner_url}
                    alt="banner"
                    className="h-full w-full object-cover"
                    onError={(e) =>
                      (e.currentTarget.src = '/banner_fallbck.jpg')
                    }
                  />
                ) : (
                  <div className="w-full h-full bg-primary" />
                )}
              </div>
              <div className="absolute -bottom-10 left-10 size-20 md:size-23 rounded-full bg-background flex items-center justify-center">
                <Avatar className="size-18 md:size-21">
                  <AvatarImage
                    src={user.profile.avatar_url ?? undefined}
                    alt={user.profile.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                    {user.profile.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              {isMe && (
                <Button
                  variant="outline"
                  onClick={() => setIsEditOpen(true)}
                  className="absolute rounded-full h-fit py-1.5 bottom-0 right-2.5 translate-y-[calc(100%+10px)]"
                >
                  Edit profile
                </Button>
              )}
            </div>
            <div className="flex flex-col gap-2.5 mb-12 px-1">
              <p className="text-[20px] font-bold px-3">{user.profile.name}</p>
              <p className="text-gray-500 flex items-center gap-1 px-3">
                <AtSignIcon className="size-4" /> {user.username}
              </p>
              {isMe && (
                <p className="text-gray-500 px-3 flex gap-1 items-center">
                  <MailIcon className="size-4" /> {user.email}
                </p>
              )}
              {user.profile.bio && <p className="px-3">{user.profile.bio}</p>}
              <div className="flex flex-wrap gap-4 text-gray-500 px-3">
                {user.profile.country && (
                  <p className="flex items-center gap-1">
                    <MapPinIcon className="size-4" />
                    {user.profile.country}
                  </p>
                )}
                {user.profile.birthday && (
                  <p className="flex items-center gap-1">
                    <GiftIcon className="size-4" />
                    Birthday: {formatDate(user.profile.birthday)}
                  </p>
                )}
                <p className="flex items-center gap-1">
                  <CalendarDaysIcon className="size-4" />
                  Joined Skyup on {formatDate(user.created_at)}
                </p>
              </div>
              <div className="px-3 flex items-center gap-3 text-gray-500">
                <p>
                  <span className="text-black font-bold">
                    {user.followers_count}
                  </span>{' '}
                  Followers
                </p>
                <p>
                  <span className="text-black font-bold">
                    {user.followings_count}
                  </span>{' '}
                  Followings
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
      <section>
        <p className="font-bold px-4">Posts</p>
        {user && <UserPosts user_id={user.id} isMe={isMe} />}
      </section>
      {isMe && user && (
        <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
          <SheetContent className=" p-3 overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Edit profile</SheetTitle>
              <SheetDescription>
                Update your profile details and profile images.
              </SheetDescription>
            </SheetHeader>
            <EditProfile
              user={user}
              closeEditPanel={() => setIsEditOpen(false)}
            />
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
