import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignIn from '@/app/sign-in/page';
import axios from 'axios';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('@/lib/auth-hint', () => ({
  setAuthHintCookie: jest.fn(),
  clearAuthHintCookie: jest.fn(),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

beforeEach(() => jest.clearAllMocks());

// Note: the Email label points to for="email" but the input id is "username"
// (OAuth2 constraint) — so we use placeholder to find the email input.
const getEmailInput = () => screen.getByPlaceholderText(/john@gmail/i);
const getPasswordInput = () => screen.getByLabelText('Password');
const getSubmitBtn = () => screen.getByRole('button', { name: /connect account/i });

describe('SignIn page', () => {
  // --- Rendering ---
  it('renders the Sign In heading', () => {
    render(<SignIn />);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('renders email and password inputs', () => {
    render(<SignIn />);
    expect(getEmailInput()).toBeInTheDocument();
    expect(getPasswordInput()).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    render(<SignIn />);
    expect(getSubmitBtn()).toBeInTheDocument();
  });

  it('renders a link to sign-up', () => {
    render(<SignIn />);
    expect(screen.getByRole('link', { name: /register/i })).toHaveAttribute(
      'href',
      '/sign-up',
    );
  });

  // --- Password toggle ---
  it('password field is hidden by default', () => {
    render(<SignIn />);
    expect(getPasswordInput()).toHaveAttribute('type', 'password');
  });

  it('toggles password visibility on eye button click', async () => {
    const user = userEvent.setup();
    render(<SignIn />);
    const passwordInput = getPasswordInput();
    // The toggle button is the only type="button" inside the password group
    const toggleBtn = passwordInput
      .closest('[data-slot="input-group"]')!
      .querySelector('button[type="button"]')!;

    await user.click(toggleBtn);
    expect(passwordInput).toHaveAttribute('type', 'text');

    await user.click(toggleBtn);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  // --- Success flow ---
  it('redirects to / on successful login', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { access_token: 'fake-token' },
    });
    mockedAxios.isAxiosError.mockReturnValue(false);

    const user = userEvent.setup();
    render(<SignIn />);

    await user.type(getEmailInput(), 'alice@example.com');
    await user.type(getPasswordInput(), 'Secret1!');
    await user.click(getSubmitBtn());

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/'));
  });

  // --- Error flow ---
  it('shows submit error when API returns a string error', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { detail: 'Invalid credentials.' } },
    });
    mockedAxios.isAxiosError.mockReturnValue(true);

    const user = userEvent.setup();
    render(<SignIn />);

    await user.type(getEmailInput(), 'wrong@example.com');
    await user.type(getPasswordInput(), 'wrongpass');
    await user.click(getSubmitBtn());

    await waitFor(() =>
      expect(screen.getByText('Invalid credentials.')).toBeInTheDocument(),
    );
  });

  // --- Guest login ---
  it('renders the guest login button', () => {
    render(<SignIn />);
    expect(
      screen.getByRole('button', { name: /continue as guest/i }),
    ).toBeInTheDocument();
  });

  it('redirects to / on successful guest login', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { access_token: 'guest-token' },
    });
    mockedAxios.isAxiosError.mockReturnValue(false);

    const user = userEvent.setup();
    render(<SignIn />);

    await user.click(screen.getByRole('button', { name: /continue as guest/i }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/'));
  });
});
