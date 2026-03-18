import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUp from '@/app/sign-up/page';
import axios from 'axios';
import { renderWithProviders, createTestQueryClient } from '../../test-utils';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

// SignUp uses useMutation internally so it needs a QueryClientProvider
function renderSignUp() {
  return renderWithProviders(<SignUp />, createTestQueryClient());
}

beforeEach(() => jest.clearAllMocks());

describe('SignUp page', () => {
  // --- Rendering ---
  it('renders the Sign Up heading', () => {
    renderSignUp();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('renders all form fields', () => {
    renderSignUp();
    expect(screen.getByLabelText('Full name')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Password confirmation')).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    renderSignUp();
    expect(
      screen.getByRole('button', { name: /create account/i }),
    ).toBeInTheDocument();
  });

  it('renders a link to sign-in', () => {
    renderSignUp();
    const link = screen.getByRole('link', { name: /sign in/i });
    expect(link).toHaveAttribute('href', '/sign-in');
  });

  // --- Password toggle ---
  it('password fields are hidden by default', () => {
    renderSignUp();
    const [password, confirmation] = screen.getAllByLabelText(/password/i);
    expect(password).toHaveAttribute('type', 'password');
    expect(confirmation).toHaveAttribute('type', 'password');
  });

  it('reveals password fields on toggle click', async () => {
    const user = userEvent.setup();
    renderSignUp();
    const toggleBtns = screen
      .getAllByRole('button')
      .filter((b) => b.getAttribute('type') === 'button');

    await user.click(toggleBtns[0]);

    const [password] = screen.getAllByLabelText(/password/i);
    expect(password).toHaveAttribute('type', 'text');
  });

  // --- Client-side validation ---
  it('shows name error when name is cleared after typing', async () => {
    const user = userEvent.setup();
    renderSignUp();
    const nameInput = screen.getByLabelText('Full name');

    await user.type(nameInput, 'A');
    await user.clear(nameInput);

    await waitFor(() =>
      expect(screen.getByText('Name is required.')).toBeInTheDocument(),
    );
  });

  it('shows username error when special chars are typed', async () => {
    const user = userEvent.setup();
    renderSignUp();

    await user.type(screen.getByLabelText('Username'), 'bad username!');

    await waitFor(() =>
      expect(
        screen.getByText(/username can only contain letters and numbers/i),
      ).toBeInTheDocument(),
    );
  });

  it('shows email error for invalid email', async () => {
    const user = userEvent.setup();
    renderSignUp();

    await user.type(screen.getByLabelText('Email'), 'not-an-email');

    await waitFor(() =>
      expect(screen.getByText(/not valid/i)).toBeInTheDocument(),
    );
  });

  it('shows password mismatch error', async () => {
    const user = userEvent.setup();
    renderSignUp();

    // Zod refine runs after base schema — all fields must be filled
    await user.type(screen.getByLabelText('Full name'), 'Alice Smith');
    await user.type(screen.getByLabelText('Username'), 'alice123');
    await user.type(screen.getByLabelText('Email'), 'alice@example.com');
    await user.type(screen.getByLabelText('Password'), 'Secret1!');
    await user.type(screen.getByLabelText('Password confirmation'), 'Different1!');

    await waitFor(() =>
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument(),
    );
  });

  it('disables submit button when form has errors', async () => {
    const user = userEvent.setup();
    renderSignUp();

    await user.type(screen.getByLabelText('Full name'), 'A');
    await user.clear(screen.getByLabelText('Full name'));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /create account/i })).toBeDisabled(),
    );
  });

  // --- Success flow ---
  it('redirects to account-verification on successful signup', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { id: 'new-user-id' },
    });
    mockedAxios.isAxiosError.mockReturnValue(false);

    const user = userEvent.setup();
    renderSignUp();

    await user.type(screen.getByLabelText('Full name'), 'Alice Smith');
    await user.type(screen.getByLabelText('Username'), 'alice123');
    await user.type(screen.getByLabelText('Email'), 'alice@example.com');
    await user.type(screen.getByLabelText('Password'), 'Secret1234!');
    await user.type(screen.getByLabelText('Password confirmation'), 'Secret1234!');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith('/account-verification/new-user-id'),
    );
  });

  // --- Error flow ---
  it('shows submit error when API returns a string error', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { detail: 'Email already taken.' } },
    });
    mockedAxios.isAxiosError.mockReturnValue(true);

    const user = userEvent.setup();
    renderSignUp();

    await user.type(screen.getByLabelText('Full name'), 'Alice Smith');
    await user.type(screen.getByLabelText('Username'), 'alice123');
    await user.type(screen.getByLabelText('Email'), 'alice@example.com');
    await user.type(screen.getByLabelText('Password'), 'Secret1234!');
    await user.type(screen.getByLabelText('Password confirmation'), 'Secret1234!');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() =>
      expect(screen.getByText('Email already taken.')).toBeInTheDocument(),
    );
  });
});
