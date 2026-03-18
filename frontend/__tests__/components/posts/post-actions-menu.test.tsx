import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PostActionsMenu from '@/components/posts/post-actions-menu';
import {
  renderWithProviders,
  createTestQueryClient,
  mockPost,
  mockUser,
} from '../../test-utils';

const mockDeleteMutate = jest.fn();
const mockBookmarkToggle = jest.fn();

jest.mock('@/hooks/use-post-delete', () => ({
  usePostDelete: () => ({ mutate: mockDeleteMutate }),
}));

jest.mock('@/hooks/use-post-bookmark', () => ({
  usePostBookmark: () => ({
    toggle: mockBookmarkToggle,
    isPending: false,
  }),
}));

const defaultProps = {
  post: mockPost,
  setIsEditing: jest.fn(),
  postCardType: 'post' as const,
};

function renderMenu(
  props = defaultProps,
  currentUserId: string | null = null,
) {
  const queryClient = createTestQueryClient();

  if (currentUserId) {
    queryClient.setQueryData(['current-user'], {
      ...mockUser,
      id: currentUserId,
    });
  }

  return renderWithProviders(<PostActionsMenu {...props} />, queryClient);
}

async function openMenu() {
  const user = userEvent.setup();
  const trigger = screen.getByRole('button');
  await user.click(trigger);
  return user;
}

describe('PostActionsMenu', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the trigger button', () => {
    renderMenu();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows View details and Bookmark options when opened', async () => {
    renderMenu();
    await openMenu();
    expect(screen.getByText('View details')).toBeInTheDocument();
    expect(screen.getByText('Bookmark')).toBeInTheDocument();
  });

  it('shows "Remove bookmark" when post is already bookmarked', async () => {
    const bookmarkedPost = { ...mockPost, is_bookmarked_by_me: true };
    renderMenu({ ...defaultProps, post: bookmarkedPost });
    await openMenu();
    expect(screen.getByText('Remove bookmark')).toBeInTheDocument();
  });

  it('does not show Edit/Delete when user is not the author', async () => {
    renderMenu(defaultProps, 'other-user-id');
    await openMenu();
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('shows Edit/Delete when user is the author', async () => {
    renderMenu(defaultProps, 'user-1'); // mockPost.author_id is 'user-1'
    await openMenu();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('does not show Edit/Delete on bookmark card type even for author', async () => {
    renderMenu(
      { ...defaultProps, postCardType: 'bookmark' },
      'user-1',
    );
    await openMenu();
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('calls setIsEditing when Edit is clicked', async () => {
    const setIsEditing = jest.fn();
    renderMenu({ ...defaultProps, setIsEditing }, 'user-1');
    const user = await openMenu();
    await user.click(screen.getByText('Edit'));
    expect(setIsEditing).toHaveBeenCalledWith(true);
  });

  it('calls delete mutate when Delete is clicked', async () => {
    renderMenu(defaultProps, 'user-1');
    const user = await openMenu();
    await user.click(screen.getByText('Delete'));
    expect(mockDeleteMutate).toHaveBeenCalled();
  });
});
