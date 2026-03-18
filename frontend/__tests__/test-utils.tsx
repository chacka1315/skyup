import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
}

export function renderWithProviders(
  ui: ReactElement,
  queryClient = createTestQueryClient(),
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }
  return { queryClient, ...render(ui, { wrapper: Wrapper, ...options }) };
}

export const mockPost = {
  id: 'post-1',
  content: 'Hello SkyUp!',
  author_id: 'user-1',
  media_url: null,
  media_type: null,
  created_at: '2024-01-01T00:00:00Z',
  likes_count: 5,
  replies_count: 3,
  bookmarks_count: 2,
  is_liked_by_me: false,
  is_bookmarked_by_me: false,
  author: {
    id: 'user-1',
    username: 'alice',
    email: 'alice@example.com',
    created_at: '2024-01-01T00:00:00Z',
    is_followed: false,
    profile: { name: 'Alice Smith', avatar_url: null },
  },
} as const;

export const mockUser = {
  id: 'user-1',
  username: 'alice',
  email: 'alice@example.com',
  created_at: '2024-01-01T00:00:00Z',
  profile: {
    id: 'profile-1',
    user_id: 'user-1',
    name: 'Alice Smith',
    avatar_url: null,
    banner_url: null,
    bio: null,
    country: null,
    birthday: null,
  },
};
