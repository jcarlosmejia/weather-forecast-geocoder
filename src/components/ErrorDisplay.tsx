import React from 'react';
import { ErrorDisplayProps } from '../types';

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 w-full max-w-md">
      <div className="flex items-center mb-4">
        <svg 
          className="w-6 h-6 text-red-600 mr-3" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
        <h3 className="text-lg font-semibold text-red-800">
          Error
        </h3>
      </div>
      
      <p className="text-red-700 mb-4">
        {error}
      </p>
      
      <div className="flex flex-col space-y-2">
        <button
          onClick={onRetry}
          className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
        >
          Try Again
        </button>
        
        <div className="text-sm text-red-600 mt-4">
          <p className="font-medium mb-2">Common issues:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Check your internet connection</li>
            <li>Make sure the address is in the United States</li>
            <li>Try a more specific address (include city and state)</li>
            <li>Verify the address spelling</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;