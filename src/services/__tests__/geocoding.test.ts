import { geocodeAddress, validateAddress } from '../geocoding';
import { ApiError } from '../../types';

// Mock fetch globally
const mockFetch = globalThis.fetch as jest.MockedFunction<typeof fetch>;

describe('geocoding service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('geocodeAddress', () => {
    const mockGeocodingResponse = {
      result: {
        addressMatches: [
          {
            tigerLine: {
              side: 'L',
              tigerLineId: '123456789',
            },
            coordinates: {
              x: -122.4194,
              y: 37.7749,
            },
            addressComponents: {
              zip: '94102',
              streetName: 'Main',
              preType: '',
              city: 'San Francisco',
              preDirection: '',
              suffixDirection: '',
              fromAddress: '100',
              state: 'CA',
              suffixType: 'St',
              toAddress: '199',
              suffixQualifier: '',
              preQualifier: '',
            },
            matchedAddress: '123 Main St, San Francisco, CA, 94102',
          },
        ],
      },
    };

    it('should return coordinates for a valid address', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockGeocodingResponse,
      } as Response);

      const result = await geocodeAddress('123 Main St, San Francisco, CA');

      expect(result).toEqual({
        latitude: 37.7749,
        longitude: -122.4194,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('geocoding.geo.census.gov')
      );
    });

    it('should throw ApiError when no address matches are found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ result: { addressMatches: [] } }),
      } as Response);

      await expect(geocodeAddress('Invalid Address')).rejects.toThrow(ApiError);
      await expect(geocodeAddress('Invalid Address')).rejects.toThrow(
        'No matching addresses found'
      );
    });

    it('should throw ApiError when API request fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      await expect(geocodeAddress('123 Main St')).rejects.toThrow(ApiError);
      await expect(geocodeAddress('123 Main St')).rejects.toThrow(
        'Geocoding API request failed: 500 Internal Server Error'
      );
    });

    it('should throw ApiError when network request fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(geocodeAddress('123 Main St')).rejects.toThrow(ApiError);
      await expect(geocodeAddress('123 Main St')).rejects.toThrow(
        'Failed to geocode address'
      );
    });

    it('should properly encode the address in the URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockGeocodingResponse,
      } as Response);

      await geocodeAddress('123 Main St, San Francisco, CA');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('123%20Main%20St%2C%20San%20Francisco%2C%20CA')
      );
    });
  });

  describe('validateAddress', () => {
    it('should return true for valid addresses', () => {
      expect(validateAddress('123 Main St, Seattle, WA')).toBe(true);
      expect(validateAddress('1600 Pennsylvania Ave, Washington, DC')).toBe(true);
      expect(validateAddress('12345 Broadway, New York, NY 10001')).toBe(true);
    });

    it('should return false for invalid addresses', () => {
      expect(validateAddress('')).toBe(false);
      expect(validateAddress('   ')).toBe(false);
      expect(validateAddress('abc')).toBe(false);
      expect(validateAddress('12')).toBe(false);
    });

    it('should handle addresses with minimum valid length', () => {
      expect(validateAddress('12345')).toBe(true);
      expect(validateAddress('1234')).toBe(false);
    });

    it('should require alphanumeric characters', () => {
      expect(validateAddress('!@#$%')).toBe(false);
      expect(validateAddress('     !!!')).toBe(false);
      expect(validateAddress('123 Main')).toBe(true);
    });
  });
});