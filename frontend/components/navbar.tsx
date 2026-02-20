'use client';
import Link from 'next/link';
import { links } from '@/lib/menu-links';
import { SidebarMenuItem, SidebarMenuButton } from './ui/sidebar';

export default function Navbar() {
  const linkList = links.map((link) => (
    <SidebarMenuItem key={link.name}>
      <SidebarMenuButton asChild>
        <Link href={link.href} key={link.name}>
          {link.icon} {link.name}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  ));
  return <nav>{linkList}</nav>;
}
