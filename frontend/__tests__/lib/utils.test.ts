import {
  cn,
  isProtectedRoute,
  isAuthPage,
  formatPostDate,
  formatSinglePostDate,
  formatPostTime,
} from '@/lib/utils';

// ---------------------------------------------------------------------------
// cn()
// ---------------------------------------------------------------------------
describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('resolves Tailwind conflicts (last wins)', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('ignores falsy values', () => {
    expect(cn('foo', false, null, undefined, 'bar')).toBe('foo bar');
  });

  it('handles conditional objects', () => {
    expect(cn('base', { active: true, disabled: false })).toBe('base active');
  });
});

// ---------------------------------------------------------------------------
// isProtectedRoute()
// ---------------------------------------------------------------------------
describe('isProtectedRoute', () => {
  it('protects the root /', () => {
    expect(isProtectedRoute('/')).toBe(true);
  });

  it.each(['/users', '/profiles', '/posts', '/bookmarks', '/settings', '/notifications'])(
    'protects %s',
    (path) => expect(isProtectedRoute(path)).toBe(true),
  );

  it.each(['/users/123', '/profiles/alice', '/posts/abc', '/bookmarks/x'])(
    'protects nested %s',
    (path) => expect(isProtectedRoute(path)).toBe(true),
  );

  it('does not protect /sign-in', () => {
    expect(isProtectedRoute('/sign-in')).toBe(false);
  });

  it('does not protect /sign-up', () => {
    expect(isProtectedRoute('/sign-up')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isAuthPage()
// ---------------------------------------------------------------------------
describe('isAuthPage', () => {
  it.each(['/sign-in', '/sign-up', '/account-verification'])(
    'identifies %s as auth page',
    (path) => expect(isAuthPage(path)).toBe(true),
  );

  it('does not flag / as auth page', () => {
    expect(isAuthPage('/')).toBe(false);
  });

  it('does not flag /posts as auth page', () => {
    expect(isAuthPage('/posts')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// formatPostDate()
// ---------------------------------------------------------------------------
describe('formatPostDate', () => {
  it('shows compact format for recent dates (< 24h)', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const result = formatPostDate(fiveMinutesAgo);
    // Should be something like "5 m" or "5 s"
    expect(result).toMatch(/^\d+\s\w$/);
  });

  it('returns a string for old dates', () => {
    const oldDate = '2020-06-15T10:00:00Z';
    const result = formatPostDate(oldDate);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// formatSinglePostDate()
// ---------------------------------------------------------------------------
describe('formatSinglePostDate', () => {
  it('returns a non-empty string', () => {
    const result = formatSinglePostDate('2024-03-01T10:30:00Z');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('includes the 2-digit year suffix', () => {
    const result = formatSinglePostDate('2024-03-01T10:30:00Z');
    expect(result).toContain('24');
  });
});

// ---------------------------------------------------------------------------
// formatPostTime()
// ---------------------------------------------------------------------------
describe('formatPostTime', () => {
  it('returns a time string', () => {
    const result = formatPostTime('2024-03-01T14:30:00Z');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('does not include AM/PM suffix', () => {
    const result = formatPostTime('2024-03-01T14:30:00Z');
    expect(result).not.toMatch(/AM|PM/i);
  });
});
