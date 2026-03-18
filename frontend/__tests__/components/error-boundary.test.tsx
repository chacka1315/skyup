import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '@/components/error-boundary';

// Component that throws on demand
function BrokenComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('Simulated crash');
  return <p>All good</p>;
}

// Silence React's error output in test logs
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  (console.error as jest.Mock).mockRestore();
});

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={false} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('All good')).toBeInTheDocument();
  });

  it('renders default fallback when a child throws', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Une erreur est survenue')).toBeInTheDocument();
    expect(screen.getByText('Simulated crash')).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<p>Custom error UI</p>}>
        <BrokenComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Custom error UI')).toBeInTheDocument();
  });

  it('resets and shows children again after clicking Réessayer', async () => {
    const user = userEvent.setup();

    // Use a mutable flag so we can stop throwing before the reset click
    let shouldThrow = true;
    function DynamicBroken() {
      if (shouldThrow) throw new Error('Simulated crash');
      return <p>All good</p>;
    }

    render(
      <ErrorBoundary>
        <DynamicBroken />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Une erreur est survenue')).toBeInTheDocument();

    shouldThrow = false; // stop throwing before reset
    await user.click(screen.getByRole('button', { name: /réessayer/i }));

    expect(screen.getByText('All good')).toBeInTheDocument();
  });
});
