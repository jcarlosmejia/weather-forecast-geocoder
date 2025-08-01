import React from 'react';
import { WeatherPeriod } from '../types';
import WeatherCard from './WeatherCard';

interface WeatherDisplayProps {
  forecast: WeatherPeriod[];
  address: string;
}

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ forecast, address }) => {
  if (!forecast || forecast.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6 w-full max-w-6xl">
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🌤️ 7-Day Weather Forecast
        </h2>
        <p className="text-gray-600">
          Location: <span className="font-medium">{address}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 auto-rows-fr">
        {forecast.map((period, index) => (
          <WeatherCard 
            key={index}
            period={period}
            isNight={period.isDaytime === false}
          />
        ))}
      </div>
    </div>
  );
};

export default WeatherDisplay;