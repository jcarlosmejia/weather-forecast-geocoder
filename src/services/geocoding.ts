import { GeocodingResponse, Coordinates, ApiError } from '../types';


const GEOCODING_API_BASE = import.meta.env.VITE_GEOCODING_API_URL || 
  (import.meta.env.DEV 
    ? '/api/geocoding'
    : 'https://geocoding.geo.census.gov');


const buildApiUrl = (returntype: 'locations' | 'geographies', searchtype: 'onelineaddress' | 'address' | 'addressPR' | 'coordinates' | 'addressbatch') => {
  return `${GEOCODING_API_BASE}/geocoder/${returntype}/${searchtype}`;
};

/**
 * Makes a JSONP request to the Census Geocoding API
 * This is required because the Census API does not support CORS for JSON requests
 */
const geocodeWithJSONP = (
  params: {
    address?: string;
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    urb?: string;
    municipio?: string;
  },
  returntype: 'locations' | 'geographies' = 'locations',
  searchtype: 'onelineaddress' | 'address' | 'addressPR' = 'onelineaddress',
  vintage?: string
): Promise<GeocodingResponse> => {
  return new Promise((resolve, reject) => {
    const callbackName = `geocode_callback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    

    const urlParams = new URLSearchParams({
      benchmark: 'Public_AR_Current',
      format: 'jsonp',
      callback: callbackName,
    });
    
    
    if (returntype === 'geographies') {
      urlParams.append('vintage', vintage || 'Current_Current');
    }
    
    
    if (searchtype === 'onelineaddress' && params.address) {
      urlParams.append('address', params.address.trim());
    } else if (searchtype === 'address') {
      if (params.street) urlParams.append('street', params.street.trim());
      if (params.city) urlParams.append('city', params.city.trim());
      if (params.state) urlParams.append('state', params.state.trim());
      if (params.zip) urlParams.append('zip', params.zip.trim());
    } else if (searchtype === 'addressPR') {
      if (params.street) urlParams.append('street', params.street.trim());
      if (params.urb) urlParams.append('urb', params.urb.trim());
      if (params.city) urlParams.append('city', params.city.trim());
      if (params.municipio) urlParams.append('municipio', params.municipio.trim());
      if (params.state) urlParams.append('state', params.state.trim());
      if (params.zip) urlParams.append('zip', params.zip.trim());
    }
    
    const url = `https://geocoding.geo.census.gov/geocoder/${returntype}/${searchtype}?${urlParams.toString()}`;
    
    (window as any)[callbackName] = (data: GeocodingResponse) => {
      cleanup();
      resolve(data);
    };
    

    const script = document.createElement('script');
    script.src = url;
    script.onerror = () => {
      cleanup();
      reject(new Error('JSONP request failed - network error'));
    };
    

    const cleanup = () => {
      delete (window as any)[callbackName];
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
    

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('JSONP request timed out'));
    }, 15000);
    
    
    const originalCleanup = cleanup;
    const enhancedCleanup = () => {
      clearTimeout(timeout);
      originalCleanup();
    };
    
          (window as any)[callbackName] = (data: GeocodingResponse) => {
      enhancedCleanup();
      resolve(data);
    };
    
    script.onerror = () => {
      enhancedCleanup();
      reject(new Error('JSONP request failed - network error'));
    };
    

    document.head.appendChild(script);
  });
};

/**
 * Detects if we're using a proxy by checking if the URL is relative
 */
const isUsingProxy = (): boolean => {
  return GEOCODING_API_BASE.startsWith('/') || GEOCODING_API_BASE.includes('localhost');
};

/**
 * Converts a US address to latitude and longitude coordinates using the US Census Geocoding API
 * @param address - The address string to geocode
 * @returns Promise containing the coordinates
 * @throws ApiError if geocoding fails or no results found
 */
export const geocodeAddress = async (
  addressInput: string | {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    urb?: string;
    municipio?: string;
  },
  options: {
    returntype?: 'locations' | 'geographies';
    searchtype?: 'onelineaddress' | 'address' | 'addressPR';
    vintage?: string;
  } = {}
): Promise<Coordinates> => {
  const { returntype = 'locations', searchtype = 'onelineaddress', vintage } = options;
  

  let addressParams: {
    address?: string;
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    urb?: string;
    municipio?: string;
  };
  
  if (typeof addressInput === 'string') {
  
    if (!validateAddress(addressInput)) {
      throw new ApiError({
        message: 'Invalid address format. Please provide a complete US address with street number, street name, city, and state.',
        status: 400,
      });
    }
    addressParams = { address: addressInput };
  } else {
    addressParams = addressInput;
    
  
    if (searchtype === 'address') {
      const hasMinimumParams = 
        (addressParams.street && addressParams.zip) || 
        (addressParams.street && addressParams.city && addressParams.state);
      
      if (!hasMinimumParams) {
        throw new ApiError({
          message: 'For address searchtype, minimum requirements are: street + zip OR street + city + state',
          status: 400,
        });
      }
    } else if (searchtype === 'addressPR') {
      if (!addressParams.street) {
        throw new ApiError({
          message: 'Street parameter is required for Puerto Rico addresses',
          status: 400,
        });
      }
      
      if (addressParams.zip && !addressParams.zip.match(/^(006|007|009)/)) {
        throw new ApiError({
          message: 'Puerto Rico ZIP codes must start with 006, 007, or 009',
          status: 400,
        });
      }
    }
  }
  
  try {
    let data: GeocodingResponse;
    
    if (isUsingProxy()) {
    
      const url = buildApiUrl(returntype, searchtype);
      const urlParams = new URLSearchParams({
        benchmark: 'Public_AR_Current',
        format: 'json',
      });
      

      if (returntype === 'geographies') {
        urlParams.append('vintage', vintage || 'Current_Current');
      }
      

      if (searchtype === 'onelineaddress' && addressParams.address) {
        urlParams.append('address', addressParams.address.trim());
      } else if (searchtype === 'address') {
        if (addressParams.street) urlParams.append('street', addressParams.street.trim());
        if (addressParams.city) urlParams.append('city', addressParams.city.trim());
        if (addressParams.state) urlParams.append('state', addressParams.state.trim());
        if (addressParams.zip) urlParams.append('zip', addressParams.zip.trim());
      } else if (searchtype === 'addressPR') {
        if (addressParams.street) urlParams.append('street', addressParams.street.trim());
        if (addressParams.urb) urlParams.append('urb', addressParams.urb.trim());
        if (addressParams.city) urlParams.append('city', addressParams.city.trim());
        if (addressParams.municipio) urlParams.append('municipio', addressParams.municipio.trim());
        if (addressParams.state) urlParams.append('state', addressParams.state.trim());
        if (addressParams.zip) urlParams.append('zip', addressParams.zip.trim());
      }
      
      const fullUrl = `${url}?${urlParams.toString()}`;

      
      const response = await fetch(fullUrl);
      
      if (!response.ok) {


        data = await geocodeWithJSONP(addressParams, returntype, searchtype, vintage);
      } else {
        data = await response.json();
  
      }
    } else {

  
      data = await geocodeWithJSONP(addressParams, returntype, searchtype, vintage);
    }
    

    if (!data.result?.addressMatches || data.result.addressMatches.length === 0) {
      throw new ApiError({
        message: 'No matching addresses found. Please check your address and try again.',
        status: 404,
      });
    }
    

    const firstMatch = data.result.addressMatches[0];
    const coordinates: Coordinates = {
      latitude: firstMatch.coordinates.y,
      longitude: firstMatch.coordinates.x,
    };
    

    
    return coordinates;
    
  } catch (error) {
    console.error('Geocoding error:', error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new ApiError({
      message: `Failed to geocode address: ${errorMessage}. Please check your internet connection and try again.`,
      status: 0,
    });
  }
};

/**
 * Validates that an address string is not empty and contains basic components
 * @param address - The address string to validate
 * @returns true if valid, false otherwise
 */
export const validateAddress = (address: string): boolean => {
  const trimmedAddress = address.trim();
  
  if (!trimmedAddress) {
    return false;
  }
  

  return trimmedAddress.length >= 5 && /[a-zA-Z0-9]/.test(trimmedAddress);
};