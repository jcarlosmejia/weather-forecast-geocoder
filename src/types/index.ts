export interface GeocodingResponse {
  result: {
    input: {
      address?: {
        address?: string;
        street?: string;
        city?: string;
        state?: string;
        zip?: string;
        urb?: string;
        municipio?: string;
      };
      benchmark: {
        isDefault: boolean;
        benchmarkDescription: string;
        id: string;
        benchmarkName: string;
      };
      vintage?: {
        isDefault: boolean;
        vintageDescription: string;
        id: string;
        vintageName: string;
      };
    };
    addressMatches: AddressMatch[];

  };
}

export interface GeographiesResult {
  [layerName: string]: GeographyLayer[];
}

export interface GeographyLayer {
  GEOID: string;
  CENTLAT: string;
  CENTLON: string;
  AREAWATER?: number;
  AREALAND?: number;
  STATE?: string;
  COUNTY?: string;
  TRACT?: string;
  BLKGRP?: string;
  BASENAME?: string;
  NAME?: string;
  LSADC?: string;
  FUNCSTAT?: string;
  INTPTLAT?: string;
  INTPTLON?: string;
  MTFCC?: string;
  OID?: string;
  OBJECTID?: number;
}

export interface AddressMatch {
  tigerLine: {
    side: string;
    tigerLineId: string;
  };
  coordinates: {
    x: number;
    y: number;
  };
  addressComponents: {
    zip: string;
    streetName: string;
    preType: string;
    city: string;
    preDirection: string;
    suffixDirection: string;
    fromAddress: string;
    state: string;
    suffixType: string;
    toAddress: string;
    suffixQualifier: string;
    preQualifier: string;
  };
  matchedAddress: string;
}

export interface WeatherPointsResponse {
  properties: {
    forecast: string;
    forecastHourly: string;
    gridId: string;
    gridX: number;
    gridY: number;
    timeZone: string;
  };
}

export interface WeatherForecastResponse {
  properties: {
    periods: WeatherPeriod[];
  };
}

export interface WeatherPeriod {
  number: number;
  name: string;
  startTime: string;
  endTime: string;
  isDaytime: boolean;
  temperature: number;
  temperatureUnit: string;
  temperatureTrend: string | null;
  windSpeed: string;
  windDirection: string;
  icon: string;
  shortForecast: string;
  detailedForecast: string;
  probabilityOfPrecipitation?: {
    unitCode: string;
    value: number;
  };
  dewpoint?: {
    unitCode: string;
    value: number;
  };
  relativeHumidity?: {
    unitCode: string;
    value: number;
  };
}

export interface AddressFormProps {
  onSubmit: (address: string) => void;
  isLoading: boolean;
}



export interface ErrorDisplayProps {
  error: string;
  onRetry: () => void;
}

export interface AppState {
  address: string;
  forecast: WeatherPeriod[];
  isLoading: boolean;
  error: string | null;
}

export class ApiError extends Error {
  public status?: number;

  constructor({ message, status }: { message: string; status?: number }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}