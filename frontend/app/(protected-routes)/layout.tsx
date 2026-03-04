import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import Trends from '@/components/trends';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import AppSidebar from '@/components/app-sidebar';
import CreatePost from '@/components/posts/create-post';
import CreateReply from '@/components/replies/create-reply';
import Image from 'next/image';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <main className="lg:grid lg:grid-cols-2 w-full">
        <div className="md:hidden items-center flex justify-between p-3">
          <SidebarTrigger />
          <Image src="/logo.svg" height={30} width={30} alt="logo" />
        </div>
        <ScrollArea className="h-screen w-full relative">
          <CreatePost />
          <CreateReply />
          {children}
          <ScrollBar className="hidden" />
        </ScrollArea>
        <div className="hidden lg:block">
          <Trends />
        </div>
      </main>
    </SidebarProvider>
  );
}
