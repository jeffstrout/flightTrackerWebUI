# Flight Tracker Web UI

A responsive web interface for visualizing real-time flight data collected by the Flight Tracker Collector service. Built with React, TypeScript, and Leaflet for interactive mapping.

## Features

🗺️ **Interactive Map** - OpenStreetMap-based flight visualization with custom aircraft markers  
🔄 **Real-time Updates** - Auto-refreshing flight data with configurable intervals  
📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices  
🔍 **Advanced Filtering** - Search and filter by aircraft type, altitude, speed, and more  
🚁 **Aircraft Detection** - Automatic identification of helicopters and military aircraft  
🌙 **Dark Mode** - System preference detection with manual toggle  
📊 **Live Statistics** - Real-time aircraft counts and performance metrics  

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Flight Tracker Collector service running (provides the API)

## Quick Start

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd flightTrackerWebUI
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env .env.local
   # Edit .env.local with your settings
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   ```
   http://localhost:3000
   ```

## Environment Configuration

Copy `.env` to `.env.local` and customize:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8000    # Flight Tracker Collector API
VITE_DEFAULT_REGION=etex                   # Default region on load
VITE_REFRESH_INTERVAL=15000               # Auto-refresh interval (ms)

# Map Configuration  
VITE_MAP_DEFAULT_ZOOM=8                   # Initial zoom level
VITE_MAP_CENTER_LAT=32.3513              # Default center (Tyler, TX)
VITE_MAP_CENTER_LON=-95.3011
VITE_MAP_TILE_SERVER=https://tile.openstreetmap.org/{z}/{x}/{y}.png

# Feature Flags
VITE_ENABLE_FLIGHT_TRAILS=true           # Aircraft movement trails
VITE_ENABLE_CLUSTERING=true              # Marker clustering
VITE_ENABLE_DARK_MODE=true               # Dark mode toggle
```

## Available Scripts

### Development
```bash
npm run dev          # Start development server with hot reload
npm run type-check   # Run TypeScript type checking
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically
```

### Production
```bash
npm run build        # Build for production
npm run preview      # Preview production build locally
```

### Testing
```bash
npm run test         # Run unit tests
npm run test:ui      # Run tests with UI
```

## Project Structure

```
src/
├── components/
│   ├── Map/                 # Map and marker components
│   │   ├── FlightMap.tsx    # Main map container
│   │   └── AircraftMarker.tsx # Individual aircraft markers
│   ├── UI/                  # User interface components
│   │   ├── Header.tsx       # App header with region selector
│   │   ├── Sidebar.tsx      # Flight list and filters
│   │   ├── StatusBar.tsx    # Connection status and stats
│   │   └── FilterPanel.tsx  # Flight filtering controls
│   └── Aircraft/            # Aircraft-specific components
│       ├── AircraftList.tsx # List view of flights
│       └── AircraftCard.tsx # Individual aircraft details
├── hooks/
│   ├── useFlightData.ts     # Flight data fetching and state
│   └── useFilters.ts        # Filter state management
├── services/
│   ├── api.ts              # API client for collector service
│   └── types.ts            # TypeScript type definitions
└── styles/
    └── globals.css         # Global styles and Tailwind imports
```

## API Integration

The web UI connects to your Flight Tracker Collector service endpoints:

- `GET /api/v1/{region}/flights` - All flights for region
- `GET /api/v1/{region}/choppers` - Helicopters only
- `GET /api/v1/regions` - Available regions
- `GET /api/v1/status` - System health and collector status

## Customization

### Adding New Regions
Update the regions list in `src/components/UI/Header.tsx` or fetch dynamically from your API.

### Custom Aircraft Icons
Modify the SVG icons in `src/components/Map/AircraftMarker.tsx` to customize aircraft appearance.

### Map Styling
Change the tile server URL in your `.env` file to use different map styles:
```bash
# OpenStreetMap (default)
VITE_MAP_TILE_SERVER=https://tile.openstreetmap.org/{z}/{x}/{y}.png

# CartoDB Positron (light)
VITE_MAP_TILE_SERVER=https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png

# CartoDB Dark Matter
VITE_MAP_TILE_SERVER=https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png
```

### Filtering Logic
Extend the filtering system in `src/hooks/useFilters.ts` to add new filter criteria.

## Deployment

### Static Site Deployment
```bash
npm run build
# Deploy the 'dist' folder to your hosting provider
```

### Docker Deployment
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

### Environment-Specific Builds
```bash
# Development
npm run build

# Staging
VITE_API_BASE_URL=https://staging-api.example.com npm run build

# Production  
VITE_API_BASE_URL=https://api.example.com npm run build
```

## Browser Support

- Chrome 90+
- Firefox 88+ 
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Performance Tips

- The app uses React.memo and useMemo for optimal re-rendering
- Map markers are recycled for better performance with large datasets
- Virtual scrolling is implemented for aircraft lists
- API calls are debounced to prevent excessive requests

## Troubleshooting

### No Aircraft Showing
- Verify Flight Tracker Collector service is running at the configured API URL
- Check browser console for API errors
- Ensure the region exists and has active collectors

### Map Not Loading
- Check your internet connection
- Verify the tile server URL is accessible
- Try a different tile server in your environment configuration

### Slow Performance
- Reduce the refresh interval in your environment configuration
- Enable clustering for high aircraft density areas
- Check if your system meets the browser requirements

## License

MIT License - see LICENSE file for details