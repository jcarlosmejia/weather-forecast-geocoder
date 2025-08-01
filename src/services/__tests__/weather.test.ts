import { getWeatherForCoordinates } from '../weather';
import { ApiError } from '../../types';

// Mock fetch globally
const mockFetch = globalThis.fetch as jest.MockedFunction<typeof fetch>;

describe('weather service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getWeatherForCoordinates', () => {
    const mockCoordinates = { latitude: 37.7749, longitude: -122.4194 };
    
    const mockPointsResponse = {
      properties: {
        forecast: 'https://api.weather.gov/gridpoints/MTR/85,105/forecast',
        forecastHourly: 'https://api.weather.gov/gridpoints/MTR/85,105/forecast/hourly',
        gridId: 'MTR',
        gridX: 85,
        gridY: 105,
        timeZone: 'America/Los_Angeles',
      },
    };

    const mockForecastResponse = {
      properties: {
        periods: [
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
        ],
      },
    };

    it('should return weather forecast for valid coordinates', async () => {
      // Mock the points API call
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPointsResponse,
        } as Response)
        // Mock the forecast API call
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockForecastResponse,
        } as Response);

      const result = await getWeatherForCoordinates(mockCoordinates);

      expect(result).toEqual(mockForecastResponse.properties.periods);
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        'https://api.weather.gov/points/37.7749,-122.4194'
      );
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        'https://api.weather.gov/gridpoints/MTR/85,105/forecast'
      );
    });

    it('should throw ApiError when points API returns 404', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      await expect(getWeatherForCoordinates(mockCoordinates)).rejects.toThrow(
        ApiError
      );
      await expect(getWeatherForCoordinates(mockCoordinates)).rejects.toThrow(
        'Weather data not available for this location'
      );
    });

    it('should throw ApiError when points API fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      await expect(getWeatherForCoordinates(mockCoordinates)).rejects.toThrow(
        ApiError
      );
      await expect(getWeatherForCoordinates(mockCoordinates)).rejects.toThrow(
        'Weather API request failed: 500 Internal Server Error'
      );
    });

    it('should throw ApiError when forecast API fails', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPointsResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
          statusText: 'Service Unavailable',
        } as Response);

      await expect(getWeatherForCoordinates(mockCoordinates)).rejects.toThrow(
        ApiError
      );
      await expect(getWeatherForCoordinates(mockCoordinates)).rejects.toThrow(
        'Weather forecast request failed: 503 Service Unavailable'
      );
    });

    it('should throw ApiError when points response is invalid', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ properties: {} }),
      } as Response);

      await expect(getWeatherForCoordinates(mockCoordinates)).rejects.toThrow(
        ApiError
      );
      await expect(getWeatherForCoordinates(mockCoordinates)).rejects.toThrow(
        'Invalid weather API response'
      );
    });

    it('should throw ApiError when forecast response is invalid', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPointsResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ properties: {} }),
        } as Response);

      await expect(getWeatherForCoordinates(mockCoordinates)).rejects.toThrow(
        ApiError
      );
      await expect(getWeatherForCoordinates(mockCoordinates)).rejects.toThrow(
        'Invalid weather forecast response'
      );
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(getWeatherForCoordinates(mockCoordinates)).rejects.toThrow(
        ApiError
      );
      await expect(getWeatherForCoordinates(mockCoordinates)).rejects.toThrow(
        'Failed to get weather information'
      );
    });
  });


});