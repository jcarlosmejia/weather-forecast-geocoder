import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorDisplay from '../ErrorDisplay';

describe('ErrorDisplay', () => {
  const mockOnRetry = jest.fn();
  const mockError = 'Something went wrong. Please try again.';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders error message correctly', () => {
    render(<ErrorDisplay error={mockError} onRetry={mockOnRetry} />);

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText(mockError)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', async () => {
    const user = userEvent.setup();
    render(<ErrorDisplay error={mockError} onRetry={mockOnRetry} />);

    const retryButton = screen.getByRole('button', { name: /try again/i });
    await user.click(retryButton);

    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('displays helpful troubleshooting tips', () => {
    render(<ErrorDisplay error={mockError} onRetry={mockOnRetry} />);

    expect(screen.getByText('Common issues:')).toBeInTheDocument();
    expect(screen.getByText('Check your internet connection')).toBeInTheDocument();
    expect(screen.getByText('Make sure the address is in the United States')).toBeInTheDocument();
    expect(screen.getByText('Try a more specific address (include city and state)')).toBeInTheDocument();
    expect(screen.getByText('Verify the address spelling')).toBeInTheDocument();
  });

  it('has proper error styling', () => {
    render(<ErrorDisplay error={mockError} onRetry={mockOnRetry} />);

    const container = screen.getByText(mockError).closest('div');
    expect(container).toHaveClass('bg-red-50', 'border-red-200');
  });

  it('displays error icon', () => {
    render(<ErrorDisplay error={mockError} onRetry={mockOnRetry} />);

    // SVG should have proper aria-hidden attribute
    const errorIcon = screen.getByRole('img', { hidden: true });
    expect(errorIcon).toBeInTheDocument();
  });

  it('handles different error messages', () => {
    const customError = 'Network connection failed';
    render(<ErrorDisplay error={customError} onRetry={mockOnRetry} />);

    expect(screen.getByText(customError)).toBeInTheDocument();
    expect(screen.queryByText(mockError)).not.toBeInTheDocument();
  });

  it('handles long error messages', () => {
    const longError = 'This is a very long error message that should still be displayed properly in the error component without breaking the layout or causing any visual issues.';
    render(<ErrorDisplay error={longError} onRetry={mockOnRetry} />);

    expect(screen.getByText(longError)).toBeInTheDocument();
  });

  it('has proper button styling and behavior', () => {
    render(<ErrorDisplay error={mockError} onRetry={mockOnRetry} />);

    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toHaveClass('bg-red-600', 'text-white');
    expect(retryButton).not.toBeDisabled();
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<ErrorDisplay error={mockError} onRetry={mockOnRetry} />);

    const retryButton = screen.getByRole('button', { name: /try again/i });
    
    // Tab to the button and press Enter
    await user.tab();
    expect(retryButton).toHaveFocus();
    
    await user.keyboard('{Enter}');
    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('supports space key activation', async () => {
    const user = userEvent.setup();
    render(<ErrorDisplay error={mockError} onRetry={mockOnRetry} />);

    const retryButton = screen.getByRole('button', { name: /try again/i });
    retryButton.focus();
    
    await user.keyboard(' ');
    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });
});