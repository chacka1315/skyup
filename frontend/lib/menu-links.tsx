import {
  RiHome7Fill as HomeIcon,
  RiUserCommunityLine as UsersIcon,
} from 'react-icons/ri';
import { BookmarkIcon, BellIcon, UserIcon } from 'lucide-react';

export const links = [
  {
    name: 'Home',
    href: '/',
    icon: <HomeIcon className="fill-none stroke-black stroke-2" />,
  },
  { name: 'Notifications', href: '/notifications', icon: <BellIcon /> },
  { name: 'Bookmarks', href: '/bookmarks', icon: <BookmarkIcon /> },
  {
    name: 'Users',
    href: '/users',
    icon: <UsersIcon className="" />,
  },
  { name: 'Profile', href: '/profile/me', icon: <UserIcon /> },
];
