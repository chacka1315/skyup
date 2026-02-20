'use client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { PostAuthorI, UserI } from '@/types';

export default function UserAvatar({ user }: { user: UserI | PostAuthorI }) {
  return (
    <Avatar>
      <AvatarImage src={user.profile?.avatar_url ?? undefined} />
      <AvatarFallback className="bg-primary font-bold text-primary-foreground">
        {user.profile.name.charAt(0)}
      </AvatarFallback>
    </Avatar>
  );
}
