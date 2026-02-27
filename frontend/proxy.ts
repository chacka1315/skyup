import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  isAuthPage as checkAuthPage,
  isProtectedRoute as checkProtectedRoute,
} from './lib/utils';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const hasAuthCookie = !!req.cookies.get('refresh_token')?.value;

  const isAuthPage = checkAuthPage(pathname);
  const isProtectedRoute = checkProtectedRoute(pathname);

  if (hasAuthCookie && isAuthPage) {
    return NextResponse.redirect(new URL('/', req.url));
  } else if (!hasAuthCookie && isProtectedRoute) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  return NextResponse.next();
}
