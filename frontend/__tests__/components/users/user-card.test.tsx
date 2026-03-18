import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserCard from '@/components/users/user-card';
import {
  renderWithProviders,
  createTestQueryClient,
  mockUser,
} from '../../test-utils';

jest.mock('@/components/user-avatar', () => ({
  __esModule: true,
  default: () => <div data-testid="user-avatar" />,
}));

const otherUser = {
  ...mockUser,
  id: 'user-2',
  username: 'bob',
  is_followed_by_me: false,
  profile: { ...mockUser.profile, name: 'Bob Martin', bio: 'Developer' },
};

const followFns = {
  follow: jest.fn(),
  unfollow: jest.fn(),
};

function renderCard(
  kind: 'all' | 'follower' | 'following',
  currentUserId = 'user-99',
  user = otherUser,
) {
  const queryClient = createTestQueryClient();
  queryClient.setQueryData(['current-user'], { ...mockUser, id: currentUserId });
  return renderWithProviders(
    <UserCard user={user} kind={kind} followFns={followFns} />,
    queryClient,
  );
}

describe('UserCard', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders user display name', () => {
    renderCard('all');
    expect(screen.getByText('Bob Martin')).toBeInTheDocument();
  });

  it('renders username with @', () => {
    renderCard('all');
    expect(screen.getByText('@bob')).toBeInTheDocument();
  });

  it('renders bio when present', () => {
    renderCard('all');
    expect(screen.getByText('Developer')).toBeInTheDocument();
  });

  it('renders link to user profile', () => {
    renderCard('all');
    const links = screen.getAllByRole('link');
    expect(links.some((l) => l.getAttribute('href') === '/profiles/bob')).toBe(true);
  });

  // --- kind: all ---
  it('shows Follow button for kind="all" when not followed and not current user', () => {
    renderCard('all');
    expect(screen.getByRole('button', { name: /follow/i })).toBeInTheDocument();
  });

  it('hides Follow button when the card is the current user', () => {
    renderCard('all', 'user-2'); // currentUser.id === otherUser.id
    expect(screen.queryByRole('button', { name: /^follow$/i })).not.toBeInTheDocument();
  });

  it('calls follow fn when Follow is clicked', async () => {
    const user = userEvent.setup();
    renderCard('all');
    await user.click(screen.getByRole('button', { name: /follow/i }));
    expect(followFns.follow).toHaveBeenCalledWith(otherUser);
  });

  // --- kind: follower ---
  it('shows "Follow you" label for kind="follower"', () => {
    renderCard('follower');
    expect(screen.getByText(/follow you/i)).toBeInTheDocument();
  });

  it('shows "Follow back" button for kind="follower" when not followed', () => {
    renderCard('follower');
    expect(screen.getByRole('button', { name: /follow back/i })).toBeInTheDocument();
  });

  // --- kind: following ---
  it('shows "Following" button for kind="following"', () => {
    renderCard('following');
    expect(screen.getByRole('button', { name: /following/i })).toBeInTheDocument();
  });
});
