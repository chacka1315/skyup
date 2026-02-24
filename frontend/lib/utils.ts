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

  //TODO : Not verify the fist condition with isToday() but verify if the post released at most 24hours ago.
  if (isToday(date)) {
    return formatDistanceToNowStrict(date);
  } else if (isThisYear(date)) {
    const formatedDate = format(date, 'PPpp').split(',')[0];
    return `${formatedDate}.`;
  } else {
    let formatedDate = format(date, 'PPpp').split(',')[0];
    formatedDate = `${formatedDate}. ${date.getFullYear().toString().slice(2)}`;
    return formatedDate;
  }
}

export function formatSinglePostDate(createdAt: string): string {
  const date = new Date(createdAt);
  let formatedDate = format(date, 'PPpp').split(',')[0];
  formatedDate = `${formatedDate}. ${date.getFullYear().toString().slice(2)}`;
  return formatedDate;
}

export function formatPostTime(createdAt: string): string {
  const date = new Date(createdAt);
  return format(date, 'p').split(' ')[0];
}
