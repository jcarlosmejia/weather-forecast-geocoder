import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api/geocoding': {
        target: 'https://geocoding.geo.census.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/geocoding/, ''),
        secure: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxying geocoding request to:', `https://geocoding.geo.census.gov${proxyReq.path}`);
          });
          proxy.on('error', (err, req, res) => {
            console.error('Geocoding proxy error:', err);
          });
        }
      },
      '/api/weather': {
        target: 'https://api.weather.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/weather/, ''),
        secure: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxying weather request to:', proxyReq.path);
            // Add required User-Agent header for NWS API
            proxyReq.setHeader('User-Agent', 'US Census Geocoder Weather App (contact: developer@example.com)');
          });
          proxy.on('error', (err, req, res) => {
            console.error('Weather proxy error:', err);
          });
        }
      },
    },
  },
})