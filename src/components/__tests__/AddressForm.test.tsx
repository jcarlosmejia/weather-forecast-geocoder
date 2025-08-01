import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddressForm from '../AddressForm';

describe('AddressForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form elements correctly', () => {
    render(<AddressForm onSubmit={mockOnSubmit} isLoading={false} />);

    expect(screen.getByText('Weather Forecast')).toBeInTheDocument();
    expect(screen.getByLabelText('Address')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /get weather forecast/i })).toBeInTheDocument();
    expect(screen.getByText('Enter a US address to get the 7-day weather forecast')).toBeInTheDocument();
  });

  it('submits form with valid address', async () => {
    const user = userEvent.setup();
    render(<AddressForm onSubmit={mockOnSubmit} isLoading={false} />);

    const input = screen.getByLabelText('Address');
    const submitButton = screen.getByRole('button', { name: /get weather forecast/i });

    await user.type(input, '123 Main St, Seattle, WA');
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith('123 Main St, Seattle, WA');
  });

  it('shows validation error for invalid address', async () => {
    const user = userEvent.setup();
    render(<AddressForm onSubmit={mockOnSubmit} isLoading={false} />);

    const input = screen.getByLabelText('Address');
    const submitButton = screen.getByRole('button', { name: /get weather forecast/i });

    await user.type(input, 'abc');
    await user.click(submitButton);

    expect(screen.getByText('Please enter a valid address (at least 5 characters)')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('shows validation error for empty address', async () => {
    const user = userEvent.setup();
    render(<AddressForm onSubmit={mockOnSubmit} isLoading={false} />);

    const submitButton = screen.getByRole('button', { name: /get weather forecast/i });
    await user.click(submitButton);

    expect(screen.getByText('Please enter a valid address (at least 5 characters)')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('clears validation error when user starts typing valid input', async () => {
    const user = userEvent.setup();
    render(<AddressForm onSubmit={mockOnSubmit} isLoading={false} />);

    const input = screen.getByLabelText('Address');
    const submitButton = screen.getByRole('button', { name: /get weather forecast/i });

    // First trigger validation error
    await user.type(input, 'abc');
    await user.click(submitButton);
    expect(screen.getByText('Please enter a valid address (at least 5 characters)')).toBeInTheDocument();

    // Clear input and type valid address
    await user.clear(input);
    await user.type(input, '123 Main St');

    expect(screen.queryByText('Please enter a valid address (at least 5 characters)')).not.toBeInTheDocument();
  });

  it('disables form elements when loading', () => {
    render(<AddressForm onSubmit={mockOnSubmit} isLoading={true} />);

    const input = screen.getByLabelText('Address');
    const submitButton = screen.getByRole('button');

    expect(input).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it('shows loading state correctly', () => {
    render(<AddressForm onSubmit={mockOnSubmit} isLoading={true} />);

    expect(screen.getByText('Getting forecast...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveClass('disabled:opacity-50');
  });

  it('submit button is disabled when address is empty', () => {
    render(<AddressForm onSubmit={mockOnSubmit} isLoading={false} />);

    const submitButton = screen.getByRole('button', { name: /get weather forecast/i });
    expect(submitButton).toBeDisabled();
  });

  it('submit button is enabled when address is not empty', async () => {
    const user = userEvent.setup();
    render(<AddressForm onSubmit={mockOnSubmit} isLoading={false} />);

    const input = screen.getByLabelText('Address');
    const submitButton = screen.getByRole('button', { name: /get weather forecast/i });

    await user.type(input, 'a');
    expect(submitButton).not.toBeDisabled();
  });

  it('handles form submission via Enter key', async () => {
    const user = userEvent.setup();
    render(<AddressForm onSubmit={mockOnSubmit} isLoading={false} />);

    const input = screen.getByLabelText('Address');
    await user.type(input, '123 Main St, Seattle, WA');
    await user.keyboard('{Enter}');

    expect(mockOnSubmit).toHaveBeenCalledWith('123 Main St, Seattle, WA');
  });

  it('trims whitespace from address input', async () => {
    const user = userEvent.setup();
    render(<AddressForm onSubmit={mockOnSubmit} isLoading={false} />);

    const input = screen.getByLabelText('Address');
    const submitButton = screen.getByRole('button', { name: /get weather forecast/i });

    await user.type(input, '  123 Main St, Seattle, WA  ');
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith('  123 Main St, Seattle, WA  ');
  });

  it('has proper accessibility attributes', () => {
    render(<AddressForm onSubmit={mockOnSubmit} isLoading={false} />);

    const input = screen.getByLabelText('Address');
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('has proper accessibility attributes when validation fails', async () => {
    const user = userEvent.setup();
    render(<AddressForm onSubmit={mockOnSubmit} isLoading={false} />);

    const input = screen.getByLabelText('Address');
    const submitButton = screen.getByRole('button', { name: /get weather forecast/i });

    await user.click(submitButton);

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'address-error');
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});