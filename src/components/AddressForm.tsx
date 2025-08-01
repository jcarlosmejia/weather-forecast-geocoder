import React, { useState } from 'react';
import { AddressFormProps } from '../types';
import { validateAddress } from '../services/geocoding';

const AddressForm: React.FC<AddressFormProps> = ({ onSubmit, isLoading }) => {
  const [address, setAddress] = useState('');
  const [isValid, setIsValid] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAddress(address)) {
      setIsValid(false);
      return;
    }
    
    setIsValid(true);
    onSubmit(address);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);
    
    if (!isValid && value.trim()) {
      setIsValid(true);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        Weather Forecast
      </h2>
      <p className="text-gray-600 mb-6 text-center">
        Enter a US address to get the 7-day weather forecast
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label 
            htmlFor="address" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Address
          </label>
          <input
            id="address"
            type="text"
            value={address}
            onChange={handleInputChange}
            placeholder="e.g., 123 Main St, Seattle, WA 98101"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              !isValid 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300'
            }`}
            disabled={isLoading}
            aria-describedby={!isValid ? 'address-error' : undefined}
            aria-invalid={!isValid}
          />
          {!isValid && (
            <p 
              id="address-error" 
              className="mt-1 text-sm text-red-600"
              role="alert"
            >
              Please enter a valid address (at least 5 characters)
            </p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !address.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg 
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
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
              Getting forecast...
            </span>
          ) : (
            'Get Weather Forecast'
          )}
        </button>
      </form>
    </div>
  );
};

export default AddressForm;