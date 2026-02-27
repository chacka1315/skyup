'use client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { currentUserOptions } from '@/lib/query-options';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Navbar from './navbar';
import {
  Sidebar,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from './ui/sidebar';
import Image from 'next/image';
import { LogOutIcon, SettingsIcon } from 'lucide-react';
import Link from 'next/link';
import { AvatarFallback, AvatarImage, Avatar } from './ui/avatar';
import { useState } from 'react';
import { UserI } from '@/types';
import { Skeleton } from './ui/skeleton';
import useAppStore from '@/lib/store/store';
import { Button } from './ui/button';
import UserAvatar from './user-avatar';
import { clientAxios } from '@/lib/axios/axios-client';
import { useRouter } from 'next/navigation';

export default function AppSidebar() {
  const [dropdownIsOpen, setDropdownIsOpen] = useState(false);
  const { data: currentUser, error, isLoading } = useQuery(currentUserOptions);
  const setCreatePostAreaIsOpen = useAppStore(
    (state) => state.setCreateAreaIsOpen,
  );
  const postAreaIsOpen = useAppStore((state) => state.createPostAreaIsOpen);

  if (error) {
    throw error;
  }

  return (
    <Sidebar>
      <div className="relative flex justify-center h-full w-full">
        <div className="h-full w-ful">
          <SidebarHeader>
            <Image src="/logo.svg" width={30} height={30} alt="logo" />
          </SidebarHeader>

          <SidebarMenu className="space-y-2">
            {isLoading && <Laoding />}
          </SidebarMenu>
          {currentUser && (
            <>
              <SidebarMenu>
                <Navbar />
                <Button
                  onClick={() => setCreatePostAreaIsOpen(!postAreaIsOpen)}
                  className="rounded-full mt-2"
                >
                  Skyup
                </Button>
              </SidebarMenu>
              <SidebarFooter className=" absolute bottom-6 left-0 h-fit w-full">
                <AccountDropdown
                  currentUser={currentUser}
                  isOpen={dropdownIsOpen}
                  setIsOpen={setDropdownIsOpen}
                />
              </SidebarFooter>
            </>
          )}
        </div>
      </div>
    </Sidebar>
  );
}

function Laoding() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <SidebarMenuItem key={index}>
          <Skeleton className="h-5 w-30 rounded-2xl" />
        </SidebarMenuItem>
      ))}
    </>
  );
}
function AccountDropdown({
  currentUser,
  isOpen,
  setIsOpen,
}: {
  currentUser: UserI;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clientAxios.post('/auth/logout/');
    localStorage.removeItem('access_token');
    queryClient.clear();
    router.push('/sign-in');
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton className="h-fit flex justify-center">
          <div className="flex items-center mt-2 h-fit gap-1">
            <UserAvatar user={currentUser} />
            <div>
              <p>{currentUser.profile.name}</p>
              <p className="text-gray-400 text-[12px]">
                @{currentUser?.username}
              </p>
            </div>
          </div>
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-45">
        <DropdownMenuLabel className="mb-6">
          <p className="text-gray-500">My account</p>
          <div className="flex items-center mt-2 gap-1">
            <Avatar>
              <AvatarImage src={currentUser.profile?.avatar_url ?? undefined} />
              <AvatarFallback className="bg-primary font-bold text-primary-foreground">
                {currentUser.profile.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p>{currentUser.profile.name}</p>
              <p className="text-gray-400">@{currentUser?.username}</p>
            </div>
          </div>
        </DropdownMenuLabel>
        <Link href="/settings">
          <DropdownMenuItem>
            <SettingsIcon />
            Settings
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleLogout}>
          <LogOutIcon />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
