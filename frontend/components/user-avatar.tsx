'use client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { PostAuthorI, UserI } from '@/types';

export default function UserAvatar({
  user,
  size,
}: {
  user: UserI | PostAuthorI | undefined;
  size?: number;
}) {
  return (
    <Avatar className={size ? `size-${size}` : ''}>
      <AvatarImage
        src={user?.profile?.avatar_url ?? undefined}
        className="object-cover"
      />
      <AvatarFallback className="bg-primary font-bold text-primary-foreground">
        {user?.profile.name.charAt(0)}
      </AvatarFallback>
    </Avatar>
  );
}
