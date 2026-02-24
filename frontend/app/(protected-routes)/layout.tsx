import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import News from '@/components/news';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import AppSidebar from '@/components/app-sidebar';
import CreatePost from '@/components/posts/create-post';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <main className="lg:grid lg:grid-cols-2 w-full">
        <SidebarTrigger className="md:hidden" />
        <ScrollArea className="h-screen w-full relative">
          <CreatePost />
          {children}
          <ScrollBar className="hidden" />
        </ScrollArea>
        <News />
      </main>
    </SidebarProvider>
  );
}
