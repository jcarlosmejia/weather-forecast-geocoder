
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import * as geocodingService from '../services/geocoding';
import * as weatherService from '../services/weather';
import { ApiError } from '../types';

// Mock the services
jest.mock('../services/geocoding');
jest.mock('../services/weather');

const mockGeocodeAddress = geocodingService.geocodeAddress as jest.MockedFunction<typeof geocodingService.geocodeAddress>;
const mockGetWeatherForCoordinates = weatherService.getWeatherForCoordinates as jest.MockedFunction<typeof weatherService.getWeatherForCoordinates>;

describe('App', () => {
  const mockCoordinates = { latitude: 37.7749, longitude: -122.4194 };
  const mockForecast = [
    {
      number: 1,
      name: 'Today',
      startTime: '2024-01-15T06:00:00-08:00',
      endTime: '2024-01-15T18:00:00-08:00',
      isDaytime: true,
      temperature: 65,
      temperatureUnit: 'F',
      temperatureTrend: null,
      windSpeed: '5 mph',
      windDirection: 'W',
      icon: 'https://api.weather.gov/icons/land/day/few?size=medium',
      shortForecast: 'Sunny',
      detailedForecast: 'Sunny, with a high near 65.',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the main application components', () => {
    render(<App />);

    expect(screen.getByText('Weather Forecast Geocoder')).toBeInTheDocument();
    expect(screen.getByText('Get accurate weather forecasts for any US address')).toBeInTheDocument();
    expect(screen.getByLabelText('Address')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /get weather forecast/i })).toBeInTheDocument();
  });

  it('successfully fetches and displays weather forecast', async () => {
    const user = userEvent.setup();
    
    mockGeocodeAddress.mockResolvedValue(mockCoordinates);
    mockGetWeatherForCoordinates.mockResolvedValue(mockForecast);

    render(<App />);

    const input = screen.getByLabelText('Address');
    const submitButton = screen.getByRole('button', { name: /get weather forecast/i });

    await user.type(input, '123 Main St, San Francisco, CA');
    await user.click(submitButton);

    // Should show loading state
    expect(screen.getByText('Getting your weather forecast...')).toBeInTheDocument();

    // Wait for forecast to load
    await waitFor(() => {
      expect(screen.getByText('7-Day Weather Forecast')).toBeInTheDocument();
    });

    expect(screen.getByText('Weather forecast for: 123 Main St, San Francisco, CA')).toBeInTheDocument();
    expect(screen.getByText('Sunny')).toBeInTheDocument();
    expect(mockGeocodeAddress).toHaveBeenCalledWith('123 Main St, San Francisco, CA');
    expect(mockGetWeatherForCoordinates).toHaveBeenCalledWith(mockCoordinates);
  });

  it('displays error when geocoding fails', async () => {
    const user = userEvent.setup();
    const errorMessage = 'No matching addresses found';
    
    mockGeocodeAddress.mockRejectedValue(new ApiError({ message: errorMessage }));

    render(<App />);

    const input = screen.getByLabelText('Address');
    const submitButton = screen.getByRole('button', { name: /get weather forecast/i });

    await user.type(input, 'Invalid Address');
    await user.click(submitButton);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.queryByText('7-Day Weather Forecast')).not.toBeInTheDocument();
  });

  it('displays error when weather service fails', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Weather data not available';
    
    mockGeocodeAddress.mockResolvedValue(mockCoordinates);
    mockGetWeatherForCoordinates.mockRejectedValue(new ApiError({ message: errorMessage }));

    render(<App />);

    const input = screen.getByLabelText('Address');
    const submitButton = screen.getByRole('button', { name: /get weather forecast/i });

    await user.type(input, '123 Main St, San Francisco, CA');
    await user.click(submitButton);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.queryByText('7-Day Weather Forecast')).not.toBeInTheDocument();
  });

  it('handles retry functionality', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Network error';
    
    // First call fails, second call succeeds
    mockGeocodeAddress
      .mockRejectedValueOnce(new ApiError({ message: errorMessage }))
      .mockResolvedValueOnce(mockCoordinates);
    mockGetWeatherForCoordinates.mockResolvedValue(mockForecast);

    render(<App />);

    const input = screen.getByLabelText('Address');
    const submitButton = screen.getByRole('button', { name: /get weather forecast/i });

    // Initial failed request
    await user.type(input, '123 Main St, San Francisco, CA');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // Retry the request
    const retryButton = screen.getByRole('button', { name: /try again/i });
    await user.click(retryButton);

    // Should show loading state again
    expect(screen.getByText('Getting your weather forecast...')).toBeInTheDocument();

    // Wait for successful forecast
    await waitFor(() => {
      expect(screen.getByText('7-Day Weather Forecast')).toBeInTheDocument();
    });

    expect(mockGeocodeAddress).toHaveBeenCalledTimes(2);
  });

  it('shows loading state during API calls', async () => {
    const user = userEvent.setup();
    
    // Create promises that we can control
    let resolveGeocode: (value: any) => void;
    const geocodePromise = new Promise((resolve) => {
      resolveGeocode = resolve;
    });
    
    mockGeocodeAddress.mockReturnValue(geocodePromise as any);

    render(<App />);

    const input = screen.getByLabelText('Address');
    const submitButton = screen.getByRole('button', { name: /get weather forecast/i });

    await user.type(input, '123 Main St, San Francisco, CA');
    await user.click(submitButton);

    // Should show loading state
    expect(screen.getByText('Getting your weather forecast...')).toBeInTheDocument();
    expect(screen.getByText('This may take a few moments')).toBeInTheDocument();

    // Form should be disabled during loading
    expect(input).toBeDisabled();
    expect(submitButton).toBeDisabled();

    // Resolve the promise to complete loading
    resolveGeocode!(mockCoordinates);
    mockGetWeatherForCoordinates.mockResolvedValue(mockForecast);

    await waitFor(() => {
      expect(screen.queryByText('Getting your weather forecast...')).not.toBeInTheDocument();
    });
  });

  it('clears previous forecast when new request starts', async () => {
    const user = userEvent.setup();
    
    mockGeocodeAddress.mockResolvedValue(mockCoordinates);
    mockGetWeatherForCoordinates.mockResolvedValue(mockForecast);

    render(<App />);

    const input = screen.getByLabelText('Address');
    const submitButton = screen.getByRole('button', { name: /get weather forecast/i });

    // First successful request
    await user.type(input, '123 Main St, San Francisco, CA');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('7-Day Weather Forecast')).toBeInTheDocument();
    });

    // Second request (that will fail)
    mockGeocodeAddress.mockRejectedValue(new ApiError({ message: 'Error' }));
    
    await user.clear(input);
    await user.type(input, 'Invalid Address');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    // Previous forecast should be cleared
    expect(screen.queryByText('7-Day Weather Forecast')).not.toBeInTheDocument();
  });

  it('handles non-ApiError exceptions gracefully', async () => {
    const user = userEvent.setup();
    
    mockGeocodeAddress.mockRejectedValue(new Error('Generic error'));

    render(<App />);

    const input = screen.getByLabelText('Address');
    const submitButton = screen.getByRole('button', { name: /get weather forecast/i });

    await user.type(input, '123 Main St, San Francisco, CA');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Generic error')).toBeInTheDocument();
    });
  });

  it('has proper footer information', () => {
    render(<App />);

    expect(screen.getByText('Powered by US Census Geocoding API and National Weather Service')).toBeInTheDocument();
    expect(screen.getByText('Built with React, TypeScript, and Tailwind CSS')).toBeInTheDocument();
  });
});