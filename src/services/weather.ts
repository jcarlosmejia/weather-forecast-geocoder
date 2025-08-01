import { WeatherPointsResponse, WeatherForecastResponse, WeatherPeriod, Coordinates, ApiError } from '../types';

const WEATHER_BASE_URL = import.meta.env.VITE_WEATHER_API_URL ||
  (import.meta.env.DEV
    ? '/api/weather'
    : 'https://api.weather.gov');

const getWeatherPoints = async (coordinates: Coordinates): Promise<string> => {
  try {
    let { latitude, longitude } = coordinates;
    
    latitude = parseFloat(latitude.toFixed(4));
    longitude = parseFloat(longitude.toFixed(4));
    
    const url = `${WEATHER_BASE_URL}/points/${latitude},${longitude}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Weather Forecast Geocoder App (contact: developer@example.com)',
        'Accept': 'application/json',
      },
    });
      
    if (!response.ok) {
      if (response.status === 404) {
        const locationDesc = getLocationDescription(coordinates);
        throw new ApiError({
          message: `Weather data not available for this location (${locationDesc}). The National Weather Service may not cover this area or there might be a temporary grid data issue.`,
          status: 404,
        });
      }
      
      const errorText = await response.text();
      console.error('Weather points API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        url: url
      });
      
      throw new ApiError({
        message: `Weather service temporarily unavailable (${response.status}). Please try again in a few moments.`,
        status: response.status,
      });
    }

    const data: WeatherPointsResponse = await response.json();
    
    if (!data.properties?.forecast) {
      throw new ApiError({
        message: 'Invalid weather service response. Forecast data is not available.',
        status: 500,
      });
    }

    return data.properties.forecast;
    
  } catch (error) {
    console.error('Weather points request failed:', error);
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError({
      message: 'Failed to get weather information. Please check your internet connection and try again.',
      status: 500,
    });
  }
};

const getWeatherForecast = async (forecastUrl: string): Promise<WeatherPeriod[]> => {
  try {
    let proxiedUrl = forecastUrl;
    if (import.meta.env.VITE_WEATHER_API_URL) {
      proxiedUrl = forecastUrl.replace('https://api.weather.gov', import.meta.env.VITE_WEATHER_API_URL);
    } else if (import.meta.env.DEV) {
      proxiedUrl = forecastUrl.replace('https://api.weather.gov', '/api/weather');
    }
    
    const response = await fetch(proxiedUrl, {
      headers: {
        'User-Agent': 'Weather Forecast Geocoder App (contact: developer@example.com)',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Weather forecast API error:', {
        status: response.status,
        statusText: response.statusText,
        url: proxiedUrl,
        originalUrl: forecastUrl
      });
      
      throw new ApiError({
        message: `Failed to fetch weather forecast (${response.status}). Please try again.`,
        status: response.status,
      });
    }

    const data: WeatherForecastResponse = await response.json();
    
    if (!data.properties?.periods || !Array.isArray(data.properties.periods)) {
      throw new ApiError({
        message: 'Invalid forecast data format received from weather service.',
        status: 500,
      });
    }

    return data.properties.periods;
    
  } catch (error) {
    console.error('Weather forecast request failed:', error);
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError({
      message: 'Failed to get weather forecast. Please check your internet connection and try again.',
      status: 500,
    });
  }
};

export const getWeatherForCoordinates = async (coordinates: Coordinates): Promise<WeatherPeriod[]> => {
  try {

    
    if (!validateCoordinatesForWeather(coordinates)) {
      const locationDesc = getLocationDescription(coordinates);
      throw new ApiError({
        message: `Coordinates appear outside NWS primary coverage area (${locationDesc}). Weather data may not be available.`,
        status: 400,
      });
    }
    
    const forecastUrl = await getWeatherPoints(coordinates);
    const forecast = await getWeatherForecast(forecastUrl);

    return forecast;
    
  } catch (error) {
    console.error('Weather workflow failed:', error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError({
      message: 'Failed to get weather information. Please try again.',
      status: 500,
    });
  }
};

const validateCoordinatesForWeather = (coordinates: Coordinates): boolean => {
  const { latitude, longitude } = coordinates;
  
  const lat = parseFloat(latitude.toString());
  const lng = parseFloat(longitude.toString());
  
  if (isNaN(lat) || isNaN(lng)) {
    return false;
  }
  
  const isWithinUSBounds = 
    lat >= 18.0 && lat <= 72.0 &&
    lng >= -180.0 && lng <= -65.0;
  
  return isWithinUSBounds;
};

const getLocationDescription = (coordinates: Coordinates): string => {
  const { latitude, longitude } = coordinates;
  const lat = parseFloat(latitude.toString());
  const lng = parseFloat(longitude.toString());
  
  if (lat > 49.5) return 'Northern Canada/Alaska border region';
  if (lat < 24.0) return 'Caribbean/Central America region';
  if (lng > -65.0) return 'Atlantic Ocean/Eastern Atlantic region';
  if (lng < -160.0) return 'Pacific Ocean/Western Pacific region';
  
  if (lat >= 25.0 && lat <= 49.5 && lng >= -125.0 && lng <= -65.0) {
    return 'Continental United States';
  } else if (lat >= 18.0 && lat <= 28.0 && lng >= -67.5 && lng <= -65.0) {
    return 'Puerto Rico/US Virgin Islands region';
  } else if (lat >= 19.0 && lat <= 22.5 && lng >= -161.0 && lng <= -154.0) {
    return 'Hawaii region';
  } else if (lat >= 51.0 && lat <= 72.0 && lng >= -180.0 && lng <= -130.0) {
    return 'Alaska region';
  } else {
    return `${lat.toFixed(2)}°N, ${Math.abs(lng).toFixed(2)}°W`;
  }
};