import { render, screen } from '@testing-library/react';
import ReplyCard from '@/components/replies/reply-card';

jest.mock('@/components/user-avatar', () => ({
  __esModule: true,
  default: () => <div data-testid="user-avatar" />,
}));

const mockReply = {
  id: 'reply-1',
  post_id: 'post-1',
  author_id: 'user-2',
  content: 'Great post!',
  created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 min ago
  author: {
    id: 'user-2',
    username: 'bob',
    email: 'bob@example.com',
    created_at: '2024-01-01T00:00:00Z',
    is_followed: false,
    profile: { name: 'Bob Martin', avatar_url: null },
  },
};

describe('ReplyCard', () => {
  it('renders reply content', () => {
    render(<ReplyCard reply={mockReply} />);
    expect(screen.getByText('Great post!')).toBeInTheDocument();
  });

  it('renders author display name', () => {
    render(<ReplyCard reply={mockReply} />);
    expect(screen.getByText('Bob Martin')).toBeInTheDocument();
  });

  it('renders author username with @', () => {
    render(<ReplyCard reply={mockReply} />);
    expect(screen.getByText('@bob')).toBeInTheDocument();
  });

  it('renders link to author profile', () => {
    render(<ReplyCard reply={mockReply} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/profiles/bob');
  });

  it('renders user avatar', () => {
    render(<ReplyCard reply={mockReply} />);
    expect(screen.getByTestId('user-avatar')).toBeInTheDocument();
  });
});
