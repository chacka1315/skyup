import { render, screen } from '@testing-library/react';
import PostsCard from '@/components/posts/post-card';
import { mockPost } from '../../test-utils';

jest.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: jest.fn(), inView: true }),
}));

jest.mock('@/components/posts/post-footer', () => ({
  __esModule: true,
  default: () => <div data-testid="post-footer" />,
}));

jest.mock('@/components/posts/post-actions-menu', () => ({
  __esModule: true,
  default: () => <div data-testid="post-actions-menu" />,
}));

jest.mock('@/components/user-avatar', () => ({
  __esModule: true,
  default: () => <div data-testid="user-avatar" />,
}));

describe('PostsCard', () => {
  it('renders post content', () => {
    render(<PostsCard post={mockPost} />);
    expect(screen.getByText('Hello SkyUp!')).toBeInTheDocument();
  });

  it('renders author display name', () => {
    render(<PostsCard post={mockPost} />);
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
  });

  it('renders author username with @', () => {
    render(<PostsCard post={mockPost} />);
    expect(screen.getByText('@alice')).toBeInTheDocument();
  });

  it('renders post footer', () => {
    render(<PostsCard post={mockPost} />);
    expect(screen.getByTestId('post-footer')).toBeInTheDocument();
  });

  it('renders user avatar', () => {
    render(<PostsCard post={mockPost} />);
    expect(screen.getByTestId('user-avatar')).toBeInTheDocument();
  });

  it('renders link to author profile', () => {
    render(<PostsCard post={mockPost} />);
    const profileLinks = screen
      .getAllByRole('link')
      .filter((l) => l.getAttribute('href') === '/profiles/alice');
    expect(profileLinks.length).toBeGreaterThan(0);
  });

  it('renders link to post detail', () => {
    render(<PostsCard post={mockPost} />);
    const postLinks = screen
      .getAllByRole('link')
      .filter((l) => l.getAttribute('href') === '/posts/post-1');
    expect(postLinks.length).toBeGreaterThan(0);
  });

  it('does not render media when media_url is null', () => {
    render(<PostsCard post={mockPost} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
