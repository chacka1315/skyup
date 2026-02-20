import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { currentUserOtions } from '@/lib/query-options';
import { useQuery } from '@tanstack/react-query';
import React from 'react';

export function LaptopMenu() {
  return <DropdownMenu></DropdownMenu>;
}

export function MobileMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger></DropdownMenuTrigger>
    </DropdownMenu>
  );
}
