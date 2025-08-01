# Weather Forecast Geocoder

A React TypeScript application that allows users to input a US address and displays a 7-day weather forecast for that location. The app uses the US Census Geocoding API to convert addresses to coordinates and the National Weather Service API to fetch weather data.

## Features

- **Address Geocoding**: US Census Geocoding API integration
  - **Address Validation**: Client-side address format validation
  - **Coordinate Precision**: Get latitude/longitude with high precision
  - **CORS Handling**: Automatic proxy detection with JSONP fallback
- **7-Day Weather Forecast**: National Weather Service API integration
  - **Temperature Display**: High/low temperatures with color coding
  - **Weather Conditions**: Icons, descriptions, and detailed forecasts
  - **Wind Information**: Speed and direction for each period
  - **Responsive Cards**: Consistent height weather period cards
- **Modern UI/UX**: Clean, accessible interface
  - **Responsive Design**: Mobile-friendly layout with Tailwind CSS
  - **Loading States**: Clear loading indicators during API calls
  - **Error Handling**: User-friendly error messages with retry functionality
  - **Accessibility**: WCAG compliant with proper ARIA attributes
- **Developer Experience**: Robust development setup
  - **Type Safety**: Full TypeScript implementation with strict type checking
  - **Test Coverage**: Unit tests with Jest and React Testing Library
  - **Fast Development**: Vite-powered build system with HMR

## Technical Stack

- **React 18** - UI library with hooks for state management
- **TypeScript** - Type safety and enhanced developer experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **Jest** - Testing framework
- **React Testing Library** - Component testing utilities

## APIs Used

### 1. **US Census Geocoding API**: Address to coordinates conversion
- **Base URL**: `https://geocoding.geo.census.gov/`
- **Purpose**: Convert US addresses to precise latitude/longitude coordinates
- **Endpoints**: `/geocoder/{returntype}/{searchtype}`
- **Search Types**: onelineaddress, address, addressPR, coordinates, addressbatch
- **Return Types**: locations (coordinates only), geographies (coordinates + geographic data)
- **Coverage**: All US states, territories, and Puerto Rico
- **Cost**: Free - No API key required
- **CORS Handling**: Proxied through Vite dev server with JSONP fallback

### 2. **National Weather Service API**: Weather forecast data
- **Base URL**: `https://api.weather.gov/`
- **Purpose**: Provide 7-day weather forecasts for US locations
- **Two-step process**:
  1. **Points endpoint**: `https://api.weather.gov/points/{lat},{lon}` → Get forecast URL
  2. **Forecast endpoint**: Retrieved from points response → Get actual forecast
- **Data**: Temperature, conditions, precipitation, wind, humidity, detailed descriptions
- **Requirements**: User-Agent header required for all requests
- **Coverage**: United States, Puerto Rico, and US territories
- **Cost**: Free - No API key required
- **CORS Handling**: Proxied through Vite dev server in development

### CORS Handling

⚠️ **Important**: According to the [official Census Geocoding API documentation](https://geocoding.geo.census.gov/geocoder/Geocoding_Services_API.pdf), the Census API **does not support CORS requests**. The documentation states: *"At this time the geocoder does not support CORS requests so the callback and format parameters should be used in the client to make calls to the geocoder."*

This project implements multiple solutions:

1. **Development (Primary)**: Vite proxy configuration routes API calls through the dev server
2. **Development (Fallback)**: JSONP requests when proxy fails (required by Census API)
3. **Production**: Requires a backend proxy or CORS proxy service (see deployment section)

The app automatically detects if a proxy is available and falls back to JSONP when needed.

## Project Structure

```
weather-forecast-geocoder/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── AddressForm.tsx    # Address input form
│   │   ├── WeatherDisplay.tsx # 7-day forecast display
│   │   ├── WeatherCard.tsx    # Individual weather period card
│   │   ├── ErrorDisplay.tsx   # Error message component
│   │   ├── ErrorBoundary.tsx  # React error boundary
│   │   └── index.ts           # Component exports
│   ├── services/           # API service modules
│   │   ├── geocoding.ts       # US Census geocoding service
│   │   ├── weather.ts         # National Weather Service API
│   │   └── __tests__/         # Service unit tests
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   ├── __tests__/          # Application tests
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   ├── index.css           # Global styles
│   └── setupTests.ts       # Test configuration
├── cors-proxy-server.js    # Backup CORS proxy server
├── package.json
├── vite.config.ts          # Vite configuration with API proxies
├── tsconfig.json
├── tailwind.config.js
├── jest.config.js
└── README.md
```

## Installation and Setup

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation Steps

1. **Clone or download the project files**
   ```bash
   # If using git
   git clone <repository-url>
   cd us-census-geocoder
   
   # Or extract the project files to a directory
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Navigate to `http://localhost:3000`
   - The application should now be running

## Available Scripts

### Development
```bash
# Start development server with hot reload
npm run dev
```

### Building
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing
```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Linting
```bash
# Run ESLint
npm run lint
```

## Usage

1. **Enter an Address**: Type a US address in the input field
   - Examples: "123 Main St, Seattle, WA 98101"
   - Examples: "1600 Pennsylvania Ave, Washington, DC"
   - Puerto Rico: "123 Calle Principal, Bayamón, PR 00956"

2. **Submit**: Click "Get Weather Forecast" or press Enter

3. **Two-API Workflow**: The app will:
   - **Step 1**: Geocode address using US Census API
   - **Step 2**: Fetch weather forecast using National Weather Service API
   - Show loading indicator with progress updates

4. **View Results**: The app displays:
   - **7-Day Weather Forecast**: Temperature, conditions, precipitation
   - **Detailed Information**: Wind speed/direction, detailed descriptions
   - **Weather Icons**: Visual representation of conditions
   - **Consistent Layout**: Uniform height cards in responsive grid

5. **Weather Cards**: Each card shows:
   - **Temperature**: High/low with color-coded display
   - **Conditions**: Short and detailed forecast descriptions  
   - **Weather Icons**: Official National Weather Service icons
   - **Wind Info**: Speed and direction with visual indicators

6. **Error Handling**: If issues occur, you'll see:
   - Clear error messages for geocoding or weather failures
   - "Try Again" button to retry the request
   - Troubleshooting guidance for address formats
   - Graceful fallbacks for API failures

## Component Architecture

### AddressForm
- Handles address input and validation
- Manages form state and submission
- Provides loading and error states
- Accessible form with proper ARIA attributes

### WeatherDisplay  
- Renders the complete 7-day weather forecast
- Displays weather cards in responsive grid layout
- Handles empty state and loading indicators
- Optimized for consistent card heights

### WeatherCard
- Individual weather period display component
- Shows temperature, conditions, and weather icons
- Always-visible detailed forecast information
- Handles weather icon loading and fallbacks
- Temperature-based color coding (blue for night, orange for day)
- Fixed height layout for consistent grid appearance

### ErrorDisplay
- User-friendly error messages with clear descriptions
- Retry functionality for failed requests
- Troubleshooting guidance for common issues
- Accessible error presentation with proper ARIA attributes

### ErrorBoundary
- Catches React component errors gracefully
- Provides fallback UI for unhandled errors
- Different error details for development vs. production

## API Integration

### Geocoding Service (`src/services/geocoding.ts`)
- **Core Functions**: `geocodeAddress()`, `validateAddress()`
- **Address Validation**: Client-side format validation
- **API Request Handling**: Automatic proxy detection with JSONP fallback
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **TypeScript**: Full type safety with proper interfaces

### Weather Service (`src/services/weather.ts`)
- **Two-Step Process**: Points endpoint → Forecast endpoint
- **Core Function**: `getWeatherForCoordinates()`
- **Error Handling**: Different failure modes (network, API, data format)
- **Header Management**: Required User-Agent header for NWS API
- **Data Processing**: Forecast period parsing and validation

## Testing Strategy

### Unit Tests Coverage
- **API Services**: Mock fetch requests, test error scenarios
- **Components**: User interactions, rendering, accessibility
- **Integration**: Full app workflow from address input to forecast display

### Testing Utilities
- Jest for test framework
- React Testing Library for component testing
- MSW (Mock Service Worker) patterns for API mocking
- Custom test utilities for common scenarios

### Running Tests
```bash
# Single test run
npm test

# Watch mode (re-runs on file changes)
npm run test:watch

# Coverage report
npm run test:coverage
```

## Accessibility Features

- **Semantic HTML**: Proper heading hierarchy, form labels, buttons
- **ARIA Attributes**: `aria-describedby`, `aria-invalid`, `role="alert"`
- **Keyboard Navigation**: Full keyboard accessibility for all interactive elements
- **Focus Management**: Visible focus indicators and logical tab order
- **Screen Reader Support**: Descriptive text and proper announcements
- **Color Contrast**: WCAG AA compliant color combinations

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## Performance Considerations

- **Tree Shaking**: Dead code elimination for minimal bundle size
- **Optimized Bundle**: Only essential code included (160.86 kB, 51.58 kB gzipped)
- **Error Boundaries**: Prevent entire app crashes from component errors
- **Efficient Re-renders**: React hooks with proper dependency arrays
- **Image Optimization**: Weather icons with fallbacks
- **Minimal Dependencies**: Lean dependency tree for faster builds

## Troubleshooting

### Common Issues

1. **CORS Error (Cross-Origin Request Blocked)**
   - **Understanding**: The Census API does not support CORS (confirmed by official documentation)
   - **Primary Solution**: Restart the development server with `npm run dev`
   - The Vite proxy should handle CORS automatically in development
   - **Automatic Fallback**: If proxy fails, the app automatically uses JSONP (required by Census API)
   - **Validate in Browser**: Test API connectivity in browser developer console
   - **Manual Testing**: 
     ```bash
     # Test the proxy directly in browser console:
     fetch('/api/geocoding/geocoder/locations/onelineaddress?address=123%20Main%20St&benchmark=Public_AR_Current&format=json')
     ```
   - **Backup Solution**: If Vite proxy fails completely:
     ```bash
     # In a separate terminal
     node cors-proxy-server.js
     
     # Use environment variables
     cp env.example .env.local
     # Edit .env.local and uncomment the CORS proxy URLs
     ```
   - For production deployment, see the "Production Deployment" section

2. **"No matching addresses found"**
   - Ensure the address is in the United States
   - Include city and state in the address
   - Check spelling and try a more specific address

3. **"Weather data not available"**
   - Some US territories may not have weather data
   - Try a different location within the continental US

4. **Network errors**
   - Check internet connection
   - Government APIs may have occasional downtime
   - Try again after a few moments

### Development Issues

1. **Tests failing**
   - Run `npm install` to ensure all dependencies are installed
   - Check that Node.js version is 16 or higher

2. **Build errors**
   - Clear `node_modules` and reinstall: `rm -rf node_modules package-lock.json && npm install`
   - Check TypeScript errors: `npx tsc --noEmit`

### Build and Deploy

```bash
# Build for production
npm run build

# Deploy the 'dist' folder to your hosting service
# Remember to set up your backend proxy or serverless functions
```


## Contributing

When contributing to this project:

1. Follow the existing code style and TypeScript patterns
2. Add tests for new functionality
3. Update documentation as needed
4. Ensure all tests pass before submitting changes
5. Follow accessibility guidelines for UI changes

## License

This project is provided as a technical interview assessment. Use according to your organization's policies.