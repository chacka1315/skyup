import { render, screen } from '@testing-library/react';
import FieldError from '@/components/field-error';

describe('FieldError', () => {
  it('renders the error message', () => {
    render(<FieldError error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('renders empty when error is null', () => {
    const { container } = render(<FieldError error={null} />);
    expect(container.querySelector('p')).toBeEmptyDOMElement();
  });

  it('has red color class', () => {
    const { container } = render(<FieldError error="Some error" />);
    expect(container.querySelector('p')).toHaveClass('text-red-700');
  });
});
