'use client';
import Link from 'next/link';
import { links } from '@/lib/menu-links';
import { SidebarMenuItem, SidebarMenuButton, useSidebar } from './ui/sidebar';

export default function Navbar() {
  const { setOpenMobile } = useSidebar();

  const linkList = links.map((link) => (
    <SidebarMenuItem key={link.name} onClick={() => setOpenMobile(false)}>
      <SidebarMenuButton asChild>
        <Link href={link.href} key={link.name}>
          {link.icon} {link.name}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  ));
  return <nav>{linkList}</nav>;
}
