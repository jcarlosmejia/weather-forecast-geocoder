
import { render, screen } from '@testing-library/react';
import WeatherDisplay from '../WeatherDisplay';
import { WeatherPeriod } from '../../types';

describe('WeatherDisplay', () => {
  const mockForecast: WeatherPeriod[] = [
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
    {
      number: 2,
      name: 'Tonight',
      startTime: '2024-01-15T18:00:00-08:00',
      endTime: '2024-01-16T06:00:00-08:00',
      isDaytime: false,
      temperature: 45,
      temperatureUnit: 'F',
      temperatureTrend: null,
      windSpeed: '3 mph',
      windDirection: 'W',
      icon: 'https://api.weather.gov/icons/land/night/few?size=medium',
      shortForecast: 'Clear',
      detailedForecast: 'Clear, with a low around 45.',
    },
    {
      number: 3,
      name: 'Tuesday',
      startTime: '2024-01-16T06:00:00-08:00',
      endTime: '2024-01-16T18:00:00-08:00',
      isDaytime: true,
      temperature: 68,
      temperatureUnit: 'F',
      temperatureTrend: null,
      windSpeed: '7 mph',
      windDirection: 'SW',
      icon: 'https://api.weather.gov/icons/land/day/sct?size=medium',
      shortForecast: 'Partly Cloudy',
      detailedForecast: 'Partly cloudy, with a high near 68.',
    },
  ];

  const mockAddress = '123 Main St, San Francisco, CA';

  it('renders weather forecast correctly', () => {
    render(<WeatherDisplay forecast={mockForecast} address={mockAddress} />);

    expect(screen.getByText('7-Day Weather Forecast')).toBeInTheDocument();
    expect(screen.getByText(`Weather forecast for: ${mockAddress}`)).toBeInTheDocument();
    expect(screen.getByText('Weather data provided by the National Weather Service')).toBeInTheDocument();
  });

  it('renders weather cards for forecast periods', () => {
    render(<WeatherDisplay forecast={mockForecast} address={mockAddress} />);

    // Should render weather cards (grouped by day)
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Tuesday')).toBeInTheDocument();
    expect(screen.getByText('Sunny')).toBeInTheDocument();
    expect(screen.getByText('Partly Cloudy')).toBeInTheDocument();
  });

  it('does not render when forecast is empty', () => {
    const { container } = render(<WeatherDisplay forecast={[]} address={mockAddress} />);
    expect(container.firstChild).toBeNull();
  });

  it('does not render when forecast is null/undefined', () => {
    const { container } = render(<WeatherDisplay forecast={null as any} address={mockAddress} />);
    expect(container.firstChild).toBeNull();
  });

  it('displays last updated timestamp', () => {
    render(<WeatherDisplay forecast={mockForecast} address={mockAddress} />);

    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
  });

  it('groups forecast periods by day correctly', () => {
    const extendedForecast: WeatherPeriod[] = [
      ...mockForecast,
      {
        number: 4,
        name: 'Tuesday Night',
        startTime: '2024-01-16T18:00:00-08:00',
        endTime: '2024-01-17T06:00:00-08:00',
        isDaytime: false,
        temperature: 50,
        temperatureUnit: 'F',
        temperatureTrend: null,
        windSpeed: '5 mph',
        windDirection: 'SW',
        icon: 'https://api.weather.gov/icons/land/night/sct?size=medium',
        shortForecast: 'Partly Cloudy',
        detailedForecast: 'Partly cloudy, with a low around 50.',
      },
    ];

    render(<WeatherDisplay forecast={extendedForecast} address={mockAddress} />);

    // Should still show "Tuesday" card (not separate day/night cards)
    const tuesdayCards = screen.getAllByText('Tuesday');
    expect(tuesdayCards).toHaveLength(1);
  });

  it('limits display to 7 days maximum', () => {
    // Create 20 periods (10 days worth)
    const longForecast: WeatherPeriod[] = [];
    for (let i = 0; i < 20; i++) {
      const date = new Date('2024-01-15');
      date.setDate(date.getDate() + Math.floor(i / 2));
      
      longForecast.push({
        number: i + 1,
        name: i % 2 === 0 ? `Day ${Math.floor(i / 2) + 1}` : `Night ${Math.floor(i / 2) + 1}`,
        startTime: date.toISOString(),
        endTime: date.toISOString(),
        isDaytime: i % 2 === 0,
        temperature: 65,
        temperatureUnit: 'F',
        temperatureTrend: null,
        windSpeed: '5 mph',
        windDirection: 'W',
        icon: 'https://api.weather.gov/icons/land/day/few?size=medium',
        shortForecast: 'Test',
        detailedForecast: 'Test forecast',
      });
    }

    const { container } = render(<WeatherDisplay forecast={longForecast} address={mockAddress} />);

    // Should have maximum 7 weather cards
    const weatherCards = container.querySelectorAll('[class*="bg-gradient-to-br"]');
    expect(weatherCards.length).toBeLessThanOrEqual(7);
  });

  it('handles forecast with only nighttime periods', () => {
    const nightOnlyForecast: WeatherPeriod[] = [
      {
        number: 1,
        name: 'Tonight',
        startTime: '2024-01-15T18:00:00-08:00',
        endTime: '2024-01-16T06:00:00-08:00',
        isDaytime: false,
        temperature: 45,
        temperatureUnit: 'F',
        temperatureTrend: null,
        windSpeed: '3 mph',
        windDirection: 'W',
        icon: 'https://api.weather.gov/icons/land/night/few?size=medium',
        shortForecast: 'Clear',
        detailedForecast: 'Clear, with a low around 45.',
      },
    ];

    render(<WeatherDisplay forecast={nightOnlyForecast} address={mockAddress} />);

    expect(screen.getByText('Clear')).toBeInTheDocument();
    expect(screen.getByText('45°F')).toBeInTheDocument();
  });
});