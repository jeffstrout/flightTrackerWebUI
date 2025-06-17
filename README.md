# Flight Tracker Web UI

A responsive web interface for visualizing real-time flight data collected by the Flight Tracker Collector service. Built with React, TypeScript, and Leaflet for interactive mapping.

## Features

🗺️ **Interactive Map** - OpenStreetMap-based flight visualization with custom aircraft markers  
🔄 **Real-time Updates** - Auto-refreshing flight data with configurable intervals  
📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices  
🚁 **Aircraft Filtering** - Filter by aircraft type including helicopters  
🔍 **Flight Search** - Search and filter flights by callsign, registration, and more  
📊 **Live Statistics** - Real-time flight counts and status indicators  

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Mapping**: Leaflet.js with OpenStreetMap tiles  
- **Styling**: Tailwind CSS for responsive design
- **HTTP Client**: Axios for API communication
- **State Management**: React Context + useReducer
- **Icons**: Lucide React for consistent iconography

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Running Flight Tracker Collector service

### Installation

```bash
# Clone the repository
git clone https://github.com/jeffstrout/flightTrackerWebUI.git
cd flightTrackerWebUI

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Configure your API endpoint
# Edit .env and set VITE_API_BASE_URL to your collector service URL
```

### Development

```bash
# Start development server
npm run dev

# Run type checking
npm run type-check

# Run linting
npm run lint
```

Visit `http://localhost:5173` to view the application.

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Configuration

The application uses environment variables for configuration:

### Required Settings

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8000  # Your Flight Tracker Collector URL
VITE_DEFAULT_REGION=etex                 # Default region to load
```

### Optional Settings

```bash
# Map Configuration
VITE_MAP_DEFAULT_ZOOM=8                  # Initial zoom level
VITE_MAP_CENTER_LAT=32.3513             # Default center latitude
VITE_MAP_CENTER_LON=-95.3011            # Default center longitude

# Update Configuration  
VITE_REFRESH_INTERVAL=15000             # Auto-refresh interval (ms)

# Feature Flags
VITE_ENABLE_FLIGHT_TRAILS=true          # Show aircraft trails
VITE_ENABLE_CLUSTERING=true             # Cluster aircraft markers
```

## API Integration

This web UI connects to the Flight Tracker Collector service endpoints:

### Primary Endpoints
- `GET /api/v1/{region}/flights` - All flights for region
- `GET /api/v1/{region}/choppers` - Helicopters only  
- `GET /api/v1/regions` - Available regions
- `GET /api/v1/status` - System health status

### Expected Data Format

```typescript
interface Aircraft {
  hex: string;              // ICAO24 hex code
  flight?: string;          // Callsign/flight number
  lat: number;              // Latitude
  lon: number;              // Longitude
  alt_baro?: number;        // Barometric altitude (feet)
  gs?: number;              // Ground speed (knots)
  track?: number;           // True track (degrees)
  on_ground: boolean;       // Ground status
  seen: number;             // Seconds since last update
  // ... additional fields
}
```

## Architecture

### Component Structure

```
src/
├── components/
│   ├── Map/
│   │   ├── FlightMap.tsx          # Main map container
│   │   └── AircraftMarker.tsx     # Aircraft markers
│   ├── UI/
│   │   ├── Header.tsx             # App header
│   │   ├── Sidebar.tsx            # Flight list sidebar
│   │   └── StatusBar.tsx          # Status information
│   └── Aircraft/
│       ├── AircraftList.tsx       # Scrollable flight list
│       └── AircraftCard.tsx       # Individual flight cards
├── hooks/
│   ├── useFlightData.ts           # Flight data management
│   └── useFilters.ts              # Filter state management
├── services/
│   ├── api.ts                     # API client
│   └── types.ts                   # TypeScript definitions
└── styles/
    └── globals.css                # Global styles
```

### Key Features

- **Real-time Updates**: Polls API every 15 seconds for fresh data
- **Interactive Map**: Click aircraft for detailed information
- **Responsive Sidebar**: Collapsible flight list with search/filter
- **Aircraft Differentiation**: Visual indicators for helicopters, military, etc.
- **Smooth Animations**: Aircraft position updates with transitions
- **Performance Optimized**: Efficient rendering for hundreds of aircraft

## Deployment

### Static Site Hosting

The app builds to static files suitable for deployment on:

- **Netlify**: Connect your repository for automatic deployments
- **Vercel**: Import project and deploy with one click  
- **AWS S3 + CloudFront**: Upload build files to S3 bucket
- **GitHub Pages**: Enable in repository settings

### Docker Deployment

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

### Environment Variables

Ensure your production environment has:
- `VITE_API_BASE_URL` pointing to your collector service
- `VITE_DEFAULT_REGION` set to your preferred region
- Other optional configuration as needed

## Browser Support

- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Mobile browsers: iOS Safari 14+, Chrome Mobile 90+
- Progressive enhancement for older browsers

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Troubleshooting

### Common Issues

#### No Data Displayed
- Verify `VITE_API_BASE_URL` is correct and accessible
- Check browser console for API errors
- Ensure Flight Tracker Collector service is running

#### Map Not Loading
- Check internet connection for OpenStreetMap tiles
- Verify map center coordinates are valid
- Clear browser cache and refresh

### Slow Performance
- Reduce the refresh interval in your environment configuration
- Enable clustering for high aircraft density areas
- Check if your system meets the browser requirements

## License

MIT License - see LICENSE file for details