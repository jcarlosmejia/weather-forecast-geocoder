import React, { useState, useCallback } from 'react';
import { AddressForm, WeatherDisplay, ErrorDisplay, ErrorBoundary } from './components';
import { AppState, ApiError } from './types';
import { geocodeAddress } from './services/geocoding';
import { getWeatherForCoordinates } from './services/weather';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    address: '',
    forecast: [],
    isLoading: false,
    error: null,
  });

  const resetError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const handleAddressSubmit = useCallback(async (address: string) => {
    setState(prev => ({
      ...prev,
      address,
      isLoading: true,
      error: null,
      forecast: [],
    }));

    try {
      const coordinates = await geocodeAddress(address, { returntype: 'geographies' });
      const forecast = await getWeatherForCoordinates(coordinates);
      
      setState(prev => ({
        ...prev,
        forecast,
        isLoading: false,
      }));
      
    } catch (error) {
      console.error('❌ Two-API workflow failed:', error);
      console.error('Error type:', error?.constructor?.name);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
      });
      
      let errorMessage = 'Unable to get weather forecast. Please check the address and try again.';
      
      if (error instanceof ApiError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        forecast: [],
      }));
    }
  }, []);

  const handleRetry = useCallback(() => {
    if (state.address) {
      handleAddressSubmit(state.address);
    } else {
      resetError();
    }
  }, [state.address, handleAddressSubmit, resetError]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600">
        <div className="container mx-auto px-4 py-8">
          <main className="flex flex-col items-center space-y-8">
            <AddressForm 
              onSubmit={handleAddressSubmit} 
              isLoading={state.isLoading} 
            />

            {state.error && (
              <ErrorDisplay 
                error={state.error} 
                onRetry={handleRetry} 
              />
            )}

            {state.forecast.length > 0 && !state.error && (
              <WeatherDisplay 
                forecast={state.forecast} 
                address={state.address} 
              />
            )}

            {state.isLoading && (
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center">
                <div className="flex items-center justify-center mb-4">
                  <svg 
                    className="animate-spin h-8 w-8 text-blue-600" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </div>
                <p className="text-gray-600">
                  Getting your weather forecast...
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Geocoding address → Fetching weather data
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default App;