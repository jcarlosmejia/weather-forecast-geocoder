import React, { useState } from 'react';
import { WeatherPeriod } from '../types';

interface WeatherCardProps {
  period: WeatherPeriod;
  isNight?: boolean;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ period, isNight = false }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const getTemperatureColor = (temp: number): string => {
    if (temp >= 80) return 'text-red-600';
    if (temp >= 60) return 'text-orange-500';
    if (temp >= 40) return 'text-blue-500';
    return 'text-blue-700';
  };

  const getCardBackground = (): string => {
    if (isNight) return 'bg-gradient-to-br from-indigo-100 to-purple-100 border-indigo-200';
    return 'bg-gradient-to-br from-blue-50 to-sky-100 border-blue-200';
  };

  const getTimeIcon = (): string => {
    return isNight ? '🌙' : '☀️';
  };

  return (
    <div className={`${getCardBackground()} border rounded-lg p-4 transition-all duration-200 hover:shadow-md h-full flex flex-col min-h-[280px]`}>
      
      <div className="mb-3 flex-shrink-0">
        <h3 className="font-semibold text-gray-900 text-sm">
          {getTimeIcon()} {period.name}
        </h3>
      </div>

      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex-shrink-0">
          {!imageError && period.icon ? (
            <img
              src={period.icon}
              alt={period.shortForecast}
              className="w-12 h-12 object-contain"
              onError={handleImageError}
            />
          ) : (
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-xs">
              🌤️
            </div>
          )}
        </div>
        
        <div className="text-right flex-shrink-0">
          <div className={`text-2xl font-bold ${getTemperatureColor(period.temperature)}`}>
            {period.temperature}°
          </div>
          <div className="text-xs text-gray-600">
            {period.temperatureUnit}
          </div>
        </div>
      </div>

      <div className="mb-3 flex-shrink-0">
        <p className="text-sm text-gray-700 font-medium h-10 leading-5 overflow-hidden">
          {period.shortForecast}
        </p>
      </div>

      <div className="flex items-center text-xs text-gray-600 mb-2 flex-shrink-0 h-4">
        {period.windSpeed && (
          <>
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
            </svg>
            <span className="truncate">
              {period.windSpeed} {period.windDirection}
            </span>
          </>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200 flex-shrink-0">
        <div className="max-h-32 overflow-y-auto">
          <p className="text-xs text-gray-700 leading-relaxed mb-2">
            {period.detailedForecast}
          </p>
          
          <div className="space-y-1 text-xs text-gray-600">
            {period.isDaytime !== undefined && (
              <div className="flex justify-between">
                <span>Period:</span>
                <span>{period.isDaytime ? 'Daytime' : 'Nighttime'}</span>
              </div>
            )}
            
            {period.temperatureTrend && (
              <div className="flex justify-between">
                <span>Trend:</span>
                <span className={period.temperatureTrend === 'rising' ? 'text-red-500' : 'text-blue-500'}>
                  {period.temperatureTrend === 'rising' ? '↗️ Rising' : '↘️ Falling'}
                </span>
              </div>
            )}
            
            {period.probabilityOfPrecipitation?.value && (
              <div className="flex justify-between">
                <span>Precipitation:</span>
                <span className="text-blue-600">
                  {period.probabilityOfPrecipitation.value}%
                </span>
              </div>
            )}
            
            {period.dewpoint?.value && (
              <div className="flex justify-between">
                <span>Dewpoint:</span>
                <span>
                  {Math.round(period.dewpoint.value)}°{period.dewpoint.unitCode?.replace('wmoUnit:', '')}
                </span>
              </div>
            )}
            
            {period.relativeHumidity?.value && (
              <div className="flex justify-between">
                <span>Humidity:</span>
                <span>{period.relativeHumidity.value}%</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;