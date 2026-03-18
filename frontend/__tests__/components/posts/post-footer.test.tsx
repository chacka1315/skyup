import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PostFooter from '@/components/posts/post-footer';
import { mockPost } from '../../test-utils';

const mockToggleLike = jest.fn();
const mockToggleBookmark = jest.fn();
const mockSetPostToReply = jest.fn();
const mockSetCreateReplyAreaIsOpen = jest.fn();

jest.mock('@/hooks/use-post-bookmark', () => ({
  usePostBookmark: () => ({
    toggle: mockToggleBookmark,
    isPending: false,
  }),
}));

// Note: the file has a trailing space in its name
jest.mock('@/hooks/use-post-like ', () => ({
  usePostLike: () => ({
    toggle: mockToggleLike,
    isPending: false,
  }),
}));

jest.mock('@/lib/store/store', () => ({
  __esModule: true,
  default: (selector: (state: unknown) => unknown) =>
    selector({
      setPostToReply: mockSetPostToReply,
      setCreateReplyAreaIsOpen: mockSetCreateReplyAreaIsOpen,
      createReplyAreaIsOpen: false,
    }),
}));

describe('PostFooter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays likes count', () => {
    render(<PostFooter post={mockPost} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('displays replies count', () => {
    render(<PostFooter post={mockPost} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('displays bookmarks count', () => {
    render(<PostFooter post={mockPost} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('like button is pink when post is liked by me', () => {
    const likedPost = { ...mockPost, is_liked_by_me: true };
    render(<PostFooter post={likedPost} />);
    const likeButton = screen.getByText('5').closest('button');
    expect(likeButton).toHaveClass('text-pink-500');
  });

  it('like button is not pink when post is not liked', () => {
    render(<PostFooter post={mockPost} />);
    const likeButton = screen.getByText('5').closest('button');
    expect(likeButton).not.toHaveClass('text-pink-500');
  });

  it('calls setPostToReply when reply button is clicked', async () => {
    const user = userEvent.setup();
    render(<PostFooter post={mockPost} />);
    const replyButton = screen.getByText('3').closest('button')!;
    await user.click(replyButton);
    expect(mockSetPostToReply).toHaveBeenCalledWith(mockPost);
  });

  it('calls like toggle when like button is clicked', async () => {
    const user = userEvent.setup();
    render(<PostFooter post={mockPost} />);
    const likeButton = screen.getByText('5').closest('button')!;
    await user.click(likeButton);
    expect(mockToggleLike).toHaveBeenCalledWith('add');
  });

  it('calls like toggle with "remove" when post is already liked', async () => {
    const user = userEvent.setup();
    const likedPost = { ...mockPost, is_liked_by_me: true };
    render(<PostFooter post={likedPost} />);
    const likeButton = screen.getByText('5').closest('button')!;
    await user.click(likeButton);
    expect(mockToggleLike).toHaveBeenCalledWith('remove');
  });
});
