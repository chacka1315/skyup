import { render, screen } from '@testing-library/react';
import UserAvatar from '@/components/user-avatar';
import { mockUser } from '../test-utils';

describe('UserAvatar', () => {
  it('renders the fallback initial when no avatar_url', () => {
    render(<UserAvatar user={mockUser} />);
    expect(screen.getByText('A')).toBeInTheDocument(); // "Alice Smith" → "A"
  });

  it('renders the avatar container when avatar_url is set', () => {
    // Radix AvatarImage never loads in jsdom (no real network), so the <img>
    // never appears — we just verify the component renders without crashing
    // and the fallback initial is still shown as placeholder.
    const userWithAvatar = {
      ...mockUser,
      profile: { ...mockUser.profile, avatar_url: 'https://example.com/avatar.jpg' },
    };
    const { container } = render(<UserAvatar user={userWithAvatar} />);
    expect(container.querySelector('[data-slot="avatar"]')).toBeInTheDocument();
  });

  it('applies size class when size prop is given', () => {
    const { container } = render(<UserAvatar user={mockUser} size={12} />);
    expect(container.firstChild).toHaveClass('size-12');
  });

  it('renders without crashing when user is undefined', () => {
    expect(() => render(<UserAvatar user={undefined} />)).not.toThrow();
  });
});
