# Flight Tracker Web UI - Project Overview

## Purpose
A responsive web interface for visualizing real-time flight data collected by the Flight Tracker Collector service. Provides an interactive map-based dashboard with filtering, search, and auto-refresh capabilities.

## Architecture

### Core Components
1. **Interactive Map**: OpenStreetMap-based flight visualization
2. **Real-time Data**: Consumes Flight Tracker Collector API endpoints
3. **Responsive UI**: Works on desktop, tablet, and mobile devices
4. **Flight Filtering**: Search and filter by callsign, aircraft type, altitude, etc.
5. **Auto-refresh**: Configurable refresh intervals for live data

### Technology Stack
- **Framework**: Vite + React 18 (TypeScript)
- **Mapping**: Leaflet.js with OpenStreetMap tiles
- **Styling**: Tailwind CSS for responsive design
- **HTTP Client**: Axios for API communication
- **State Management**: React Context + useReducer
- **Icons**: Lucide React for consistent iconography
- **Build Tool**: Vite for fast development and optimized builds

### Key Design Decisions

#### Framework Choice: React + Vite
- **React 18**: Modern hooks, concurrent features, excellent ecosystem
- **Vite**: Lightning-fast dev server, optimized builds, TypeScript support
- **TypeScript**: Type safety for API responses and component props

#### Map Integration: Leaflet + OpenStreetMap
- **Leaflet**: Lightweight, mobile-friendly, extensive plugin ecosystem
- **OpenStreetMap**: Free, no API keys required, global coverage
- **Custom Aircraft Icons**: SVG-based icons for different aircraft types
- **Real-time Updates**: Smooth aircraft position transitions

#### Responsive Design Strategy
- **Mobile-first**: Design starts with mobile constraints
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Touch-friendly**: Minimum 44px touch targets
- **Progressive Enhancement**: Core functionality works on all devices

### Data Flow
1. **API Client**: Polls Flight Tracker Collector endpoints
2. **State Management**: Updates React context with fresh flight data
3. **Map Rendering**: Leaflet displays aircraft positions with custom markers
4. **UI Updates**: Real-time aircraft info panels and statistics
5. **User Interactions**: Filter controls, aircraft selection, zoom controls

### API Integration
The web UI connects to the existing Flight Tracker Collector service:

#### Primary Endpoints
- `GET /api/v1/{region}/flights` - All flights for region (JSON)
- `GET /api/v1/{region}/choppers` - Helicopters only (JSON)
- `GET /api/v1/regions` - Available regions list
- `GET /api/v1/status` - System health and collector status

#### Data Format
Aircraft data structure from collector API:
```typescript
interface Aircraft {
  hex: string;              // ICAO24 hex code
  flight?: string;          // Callsign/flight number
  lat: number;              // Latitude
  lon: number;              // Longitude
  alt_baro?: number;        // Barometric altitude (feet)
  alt_geom?: number;        // Geometric altitude (feet)
  gs?: number;              // Ground speed (knots)
  track?: number;           // True track (degrees)
  baro_rate?: number;       // Vertical rate (ft/min)
  squawk?: string;          // Squawk code
  on_ground: boolean;       // Ground status
  seen: number;             // Seconds since last update
  rssi?: number;            // Signal strength (dump1090 only)
  distance_miles?: number;  // Distance from region center
  data_source: string;      // dump1090/opensky/blended
  registration?: string;    // Aircraft registration
  model?: string;           // Aircraft model
  operator?: string;        // Airline/operator
  manufacturer?: string;    // Aircraft manufacturer
  typecode?: string;        // ICAO type code
  aircraft_type?: string;   // Full aircraft type description
  icao_aircraft_class?: string; // ICAO aircraft class
}
```

### Component Architecture

#### Core Components
```
src/
├── components/
│   ├── Map/
│   │   ├── FlightMap.tsx          # Main map container
│   │   ├── AircraftMarker.tsx     # Individual aircraft markers
│   │   ├── AircraftPopup.tsx      # Aircraft info popup
│   │   └── MapControls.tsx        # Zoom, layers, etc.
│   ├── UI/
│   │   ├── Header.tsx             # App header with region selector
│   │   ├── Sidebar.tsx            # Flight list and filters
│   │   ├── StatusBar.tsx          # Connection status, stats
│   │   └── FilterPanel.tsx        # Flight filtering controls
│   └── Aircraft/
│       ├── AircraftList.tsx       # Table/list view of flights
│       ├── AircraftCard.tsx       # Individual aircraft details
│       └── AircraftIcons.tsx      # Custom aircraft SVG icons
├── hooks/
│   ├── useFlightData.tsx          # Flight data fetching and state
│   ├── useFilters.tsx             # Filter state management
│   └── useMap.tsx                 # Map state and interactions
├── services/
│   ├── api.ts                     # API client for collector service
│   └── types.ts                   # TypeScript type definitions
├── utils/
│   ├── aircraft.ts                # Aircraft data utilities
│   ├── geo.ts                     # Geographic calculations
│   └── formatting.ts             # Data formatting helpers
└── styles/
    └── globals.css                # Global styles and Tailwind imports
```

### Features

#### Map Features
- **Real-time Aircraft Tracking**: Live position updates with smooth transitions
- **Custom Aircraft Icons**: Different icons for commercial, military, helicopters
- **Flight Paths**: Optional trail showing aircraft movement history
- **Clustering**: Aircraft clustering at high zoom levels for performance
- **Layer Controls**: Toggle between map styles, weather overlays

#### User Interface Features
- **Region Selection**: Switch between configured collector regions
- **Flight Filtering**: Filter by aircraft type, altitude, speed, distance
- **Search**: Find specific flights by callsign or registration
- **Aircraft Details**: Popup with comprehensive aircraft information
- **Auto-refresh**: Configurable refresh intervals (5s, 15s, 30s, 60s)
- **Offline Indicator**: Shows connection status to collector API

#### Responsive Design Features
- **Mobile Navigation**: Collapsible sidebar, touch-optimized controls
- **Tablet Layout**: Side-by-side map and flight list
- **Desktop Layout**: Full-width map with overlay panels
- **Dark Mode**: System preference detection, manual toggle

### Performance Optimizations

#### Data Management
- **Incremental Updates**: Only re-render changed aircraft positions
- **Virtual Scrolling**: Handle thousands of flights in list view
- **Debounced Filtering**: Smooth filter interactions without lag
- **Memoized Components**: Prevent unnecessary re-renders

#### Map Performance
- **Marker Recycling**: Reuse Leaflet markers for better performance
- **Viewport Culling**: Only render aircraft visible on screen
- **Optimized Icons**: SVG sprites for fast icon rendering
- **Efficient Updates**: Batch position updates for smooth animation

### Configuration

#### Environment Variables
```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8000  # Collector service URL
VITE_DEFAULT_REGION=etex                 # Default region on load
VITE_REFRESH_INTERVAL=15000             # Default refresh interval (ms)

# Map Configuration  
VITE_MAP_DEFAULT_ZOOM=8                 # Initial map zoom level
VITE_MAP_CENTER_LAT=32.3513            # Default map center (Tyler, TX)
VITE_MAP_CENTER_LON=-95.3011
VITE_MAP_TILE_SERVER=https://tile.openstreetmap.org/{z}/{x}/{y}.png

# Feature Flags
VITE_ENABLE_FLIGHT_TRAILS=true         # Show aircraft movement trails
VITE_ENABLE_CLUSTERING=true            # Cluster aircraft at high zoom
VITE_ENABLE_DARK_MODE=true             # Dark mode toggle
```

### Development Workflow

#### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests
npm run test
```

#### Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Serve static files
npm run serve
```

### Deployment Options

#### Static Site Deployment
- **Netlify/Vercel**: Automatic deployments from Git
- **GitHub Pages**: Free hosting for public repositories
- **AWS S3 + CloudFront**: Scalable static site hosting

#### Docker Deployment
```dockerfile
# Multi-stage build for optimized production image
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

### Testing Strategy

#### Unit Tests
- Component rendering and behavior
- Utility functions (geo calculations, formatting)
- API client functionality
- Custom hooks

#### Integration Tests
- Map interactions and aircraft rendering
- Filter functionality end-to-end
- API integration with mock responses
- Responsive design across breakpoints

#### E2E Tests
- Full user workflows (select region, filter flights, view details)
- Cross-browser compatibility
- Mobile device testing
- Performance testing with large datasets

### Browser Support
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 90+
- **Progressive Enhancement**: Core functionality works in older browsers
- **Polyfills**: Minimal polyfills for modern JavaScript features

### Accessibility
- **WCAG 2.1 AA Compliance**: Screen reader support, keyboard navigation
- **Semantic HTML**: Proper headings, landmarks, form labels
- **Focus Management**: Logical tab order, visible focus indicators
- **Color Contrast**: Meets accessibility standards in all themes
- **Alternative Text**: Aircraft icons and map elements properly labeled

### Future Enhancements
- **WebSocket Connection**: Real-time updates without polling
- **Historical Data**: Time-based flight replay functionality
- **Flight Alerts**: Notifications for specific aircraft or events
- **Weather Integration**: Weather layer overlays on map
- **Multi-region View**: Compare flights across multiple regions
- **3D Visualization**: Optional 3D aircraft view with altitude
- **Export Functionality**: Save flight data as CSV/KML/GeoJSON