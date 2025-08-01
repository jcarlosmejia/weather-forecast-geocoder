#!/usr/bin/env node
/**
 * Simple CORS Proxy Server for Weather Forecast Geocoder
 * 
 * This is a backup solution if Vite proxy doesn't work.
 * Run this in a separate terminal: node cors-proxy-server.js
 * Then update the API services to use http://localhost:8080
 */

const http = require('http');
const https = require('https');
const url = require('url');

const PORT = 8080;

// CORS headers
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '3600'
};

// Target API hosts
const API_TARGETS = {
  'geocoding': 'geocoding.geo.census.gov',
  'weather': 'api.weather.gov'
};

const server = http.createServer((req, res) => {
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200, CORS_HEADERS);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathParts = parsedUrl.pathname.split('/').filter(p => p);
  
  if (pathParts.length === 0) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <body>
          <h1>CORS Proxy Server</h1>
          <p>Running on port ${PORT}</p>
          <p>Available endpoints:</p>
          <ul>
            <li><code>/geocoding/*</code> - US Census Geocoding API</li>
            <li><code>/weather/*</code> - National Weather Service API</li>
          </ul>
          <p>Examples (using only officially supported endpoints):</p>
          <ul>
            <li><code>http://localhost:${PORT}/geocoding/geocoder/locations/onelineaddress?address=123%20Main%20St&benchmark=Public_AR_Current&format=json</code></li>
            <li><code>http://localhost:${PORT}/geocoding/geocoder/locations/address?street=123%20Main%20St&city=Seattle&state=WA&benchmark=Public_AR_Current&format=json</code></li>
            <li><code>http://localhost:${PORT}/geocoding/geocoder/geographies/coordinates?x=-122.3321&y=47.6062&benchmark=Public_AR_Current&vintage=Current_Current&format=json</code></li>
            <li><code>http://localhost:${PORT}/geocoding/geocoder/benchmarks</code></li>
            <li><code>http://localhost:${PORT}/geocoding/geocoder/vintages?benchmark=4</code></li>
          </ul>
        </body>
      </html>
    `);
    return;
  }

  const apiType = pathParts[0];
  const targetHost = API_TARGETS[apiType];

  if (!targetHost) {
    res.writeHead(404, CORS_HEADERS);
    res.end(JSON.stringify({ error: 'API not found' }));
    return;
  }

  // Remove the API type from the path
  const targetPath = '/' + pathParts.slice(1).join('/') + 
    (parsedUrl.search || '');

  console.log(`Proxying: ${req.method} ${targetHost}${targetPath}`);

  const options = {
    hostname: targetHost,
    port: 443,
    path: targetPath,
    method: req.method,
    headers: {
      ...req.headers,
      host: targetHost,
      origin: `https://${targetHost}`
    }
  };

  // Remove headers that might cause issues
  delete options.headers['host'];
  delete options.headers['x-forwarded-for'];
  delete options.headers['x-forwarded-proto'];

  const proxyReq = https.request(options, (proxyRes) => {
    // Set CORS headers
    const responseHeaders = {
      ...CORS_HEADERS,
      'Content-Type': proxyRes.headers['content-type'] || 'application/json'
    };

    res.writeHead(proxyRes.statusCode, responseHeaders);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err);
    res.writeHead(500, CORS_HEADERS);
    res.end(JSON.stringify({ 
      error: 'Proxy error', 
      message: err.message 
    }));
  });

  // Handle request timeout
  proxyReq.setTimeout(10000, () => {
    console.error('Proxy timeout');
    res.writeHead(504, CORS_HEADERS);
    res.end(JSON.stringify({ error: 'Request timeout' }));
  });

  // Forward request body if present
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
  }
});

server.listen(PORT, () => {
  console.log(`🚀 CORS Proxy Server running on http://localhost:${PORT}`);
  console.log(`   Geocoding API: http://localhost:${PORT}/geocoding/*`);
  console.log(`   Weather API:   http://localhost:${PORT}/weather/*`);
  console.log('');
  console.log('📝 To use this proxy, update your API services to use:');
  console.log(`   GEOCODING_BASE_URL = 'http://localhost:${PORT}/geocoding'`);
  console.log(`   WEATHER_BASE_URL = 'http://localhost:${PORT}/weather'`);
  console.log('');
  console.log('⚠️  Remember: This is for development only!');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down CORS proxy server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  server.close(() => {
    process.exit(0);
  });
});