export const AUTH_HINT_COOKIE_NAME = 'auth_hint';
const AUTH_HINT_COOKIE_VALUE = '1';
const AUTH_HINT_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function setAuthHintCookie() {
  if (typeof document === 'undefined') {
    return;
  }

  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${AUTH_HINT_COOKIE_NAME}=${AUTH_HINT_COOKIE_VALUE}; Path=/; Max-Age=${AUTH_HINT_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

export function clearAuthHintCookie() {
  if (typeof document === 'undefined') {
    return;
  }

  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${AUTH_HINT_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}
