import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  formatDistanceToNowStrict,
  isToday,
  isThisYear,
  format,
} from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function routeIsProtected(pathname: string): boolean {
  const PROTECTED_ROUTES = ['/dashboard'];

  for (const route of PROTECTED_ROUTES) {
    if (pathname.startsWith(route)) {
      return true;
    }
  }
  return false;
}

export function isAuthPage(pathname: string): boolean {
  return (
    pathname.startsWith('/sign-in') ||
    pathname.startsWith('/sign-up') ||
    pathname.startsWith('/email-verification')
  );
}

export function formatPostDate(createdAt: string): string {
  const date = new Date(createdAt);

  if (isToday(date)) {
    return formatDistanceToNowStrict(date);
  } else if (isThisYear(date)) {
    const formatedDate = format(date, 'PPpp').split(',')[0];
    return `${formatedDate}.`;
  } else {
    let formatedDate = format(date, 'PPpp').split(',')[0];
    formatedDate = `${formatedDate}. ${date.getFullYear.toString().slice(-1, -3)}`;
    return formatedDate;
  }
}
