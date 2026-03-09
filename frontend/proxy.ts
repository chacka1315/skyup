import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  isAuthPage as checkAuthPage,
  isProtectedRoute as checkProtectedRoute,
} from './lib/utils';
import { AUTH_HINT_COOKIE_NAME } from './lib/auth-hint';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasAuthHint = req.cookies.get(AUTH_HINT_COOKIE_NAME)?.value === '1';

  const isAuthPage = checkAuthPage(pathname);
  const isProtectedRoute = checkProtectedRoute(pathname);

  if (hasAuthHint && isAuthPage) {
    return NextResponse.redirect(new URL('/', req.url));
  } else if (!hasAuthHint && isProtectedRoute) {
    const signInUrl = new URL('/sign-in', req.url);
    const nextPath = `${pathname}${req.nextUrl.search}`;
    signInUrl.searchParams.set('next', nextPath);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
