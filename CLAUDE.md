# Flight Tracker Web UI - Project Overview

## Purpose
A responsive web interface for visualizing real-time flight data collected by the Flight Tracker Collector service. Provides an interactive map-based dashboard with advanced filtering, search, and configurable auto-refresh capabilities. Optimized for production use with ground aircraft filtering and clean UI design. Now branded as "Chopper Tracker" with helicopters as the default view.

## 🚀 Current Production Status
- **Live URL**: http://flight-tracker-web-ui-1750266711.s3-website-us-east-1.amazonaws.com
- **Backend API**: https://flight-tracker-alb-790028972.us-east-1.elb.amazonaws.com
- **Status**: ✅ Fully operational with all optimizations implemented
- **Cost**: ~$42/month (optimized from original $65/month)

## Architecture

### Core Components
1. **Interactive Map**: OpenStreetMap-based flight visualization with custom aircraft markers
2. **Real-time Data**: Consumes Flight Tracker Collector API endpoints with configurable refresh intervals
3. **Responsive UI**: Mobile-first design working seamlessly on desktop, tablet, and mobile devices
4. **Smart Flight Filtering**: Advanced filtering with automatic ground aircraft exclusion
5. **Settings Menu**: User-configurable refresh intervals accessible via gear icon
6. **Optimized Status Bar**: Clean display showing only relevant flight statistics

### Technology Stack
- **Framework**: Vite + React 18 (TypeScript)
- **Mapping**: Leaflet.js with OpenStreetMap tiles
- **Styling**: Tailwind CSS for responsive design with auto dark mode
- **HTTP Client**: Axios for API communication
- **State Management**: React Context + useReducer
- **Icons**: Lucide React for consistent iconography
- **Build Tool**: Vite for fast development and optimized builds
- **Deployment**: AWS S3 + ECS Fargate with GitHub Actions CI/CD

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

#### Production Optimizations
- **Ground Aircraft Filtering**: Automatically excludes aircraft on ground from all displays
- **Configurable Refresh**: User-selectable intervals from 5 seconds to 5 minutes
- **Clean Status Bar**: Removed average altitude and unnecessary message displays
- **Auto Dark Mode**: Follows system theme preferences automatically
- **Performance Tuned**: Optimized for hundreds of concurrent aircraft

#### Responsive Design Strategy
- **Mobile-first**: Design starts with mobile constraints
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Touch-friendly**: Minimum 44px touch targets
- **Progressive Enhancement**: Core functionality works on all devices

### Data Flow
1. **API Client**: Polls Flight Tracker Collector endpoints with user-configurable intervals
2. **Smart Filtering**: Automatically excludes ground aircraft before state updates
3. **State Management**: Updates React context with filtered flight data
4. **Map Rendering**: Leaflet displays airborne aircraft positions with custom markers
5. **UI Updates**: Real-time aircraft info panels and optimized statistics
6. **User Interactions**: Filter controls, aircraft selection, zoom controls, settings menu

### API Integration
The web UI connects to the existing Flight Tracker Collector service:

#### Primary Endpoints
- `GET /api/v1/{region}/flights` - All flights for region (airborne aircraft only after filtering)
- `GET /api/v1/{region}/choppers` - Helicopters only (airborne aircraft only after filtering)
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
  on_ground: boolean;       // Ground status (automatically filtered out)
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
│   │   ├── Header.tsx             # App header with settings menu, version info, and refresh controls
│   │   ├── Sidebar.tsx            # Flight list with helicopter-first toggle and unified stats
│   │   ├── StatusBar.tsx          # Optimized connection status and flight stats
│   │   └── FilterPanel.tsx        # Flight filtering controls
│   └── Aircraft/
│       ├── AircraftList.tsx       # Table/list view of flights
│       ├── AircraftCard.tsx       # Individual aircraft details
│       └── AircraftIcons.tsx      # Custom aircraft SVG icons
├── hooks/
│   ├── useFlightData.tsx          # Flight data fetching with configurable refresh
│   ├── useFilters.tsx             # Filter state management with ground aircraft exclusion
│   └── useMap.tsx                 # Map state and interactions
├── services/
│   ├── api.ts                     # Production API client for collector service
│   └── types.ts                   # TypeScript type definitions
├── utils/
│   ├── aircraft.ts                # Aircraft data utilities
│   ├── geo.ts                     # Geographic calculations
│   └── formatting.ts             # Data formatting helpers
└── styles/
    └── globals.css                # Global styles with dark mode support
```

### Features

#### Map Features
- **Real-time Aircraft Tracking**: Live position updates with smooth transitions (airborne only)
- **Custom Aircraft Icons**: Different icons for commercial, military, helicopters
- **Flight Paths**: Optional trail showing aircraft movement history
- **Clustering**: Aircraft clustering at high zoom levels for performance
- **Layer Controls**: Toggle between map styles, weather overlays
- **Fit All Aircraft**: New map control button to automatically fit all visible aircraft in view

#### User Interface Features
- **Region Selection**: Switch between configured collector regions
- **Smart Flight Filtering**: Automatic ground aircraft exclusion plus manual filters
- **Helicopter-First Design**: Helicopters are now the default view with prominent toggle
- **Search**: Find specific flights by callsign or registration
- **Aircraft Details**: Popup with comprehensive aircraft information
- **Configurable Auto-refresh**: User-selectable refresh intervals (5s, 10s, 15s, 30s, 1m, 2m, 5m)
- **Settings Menu**: Gear icon providing access to refresh interval configuration and version info
- **Connection Status**: Shows online/offline status to collector API
- **Auto Dark Mode**: Automatically follows system theme preferences
- **Unified Statistics**: Aircraft counts always show total region data regardless of active filter

#### Responsive Design Features
- **Mobile Navigation**: Collapsible sidebar, touch-optimized controls
- **Tablet Layout**: Side-by-side map and flight list
- **Desktop Layout**: Full-width map with overlay panels
- **Settings Access**: Gear menu accessible on all screen sizes

### Performance Optimizations

#### Data Management
- **Ground Aircraft Filtering**: Automatic exclusion reduces displayed data by 30-40%
- **Incremental Updates**: Only re-render changed aircraft positions
- **Virtual Scrolling**: Handle thousands of flights in list view
- **Debounced Filtering**: Smooth filter interactions without lag
- **Memoized Components**: Prevent unnecessary re-renders
- **Configurable Refresh**: Reduces API load with user-controlled intervals

#### Map Performance
- **Marker Recycling**: Reuse Leaflet markers for better performance
- **Viewport Culling**: Only render aircraft visible on screen
- **Optimized Icons**: SVG sprites for fast icon rendering
- **Efficient Updates**: Batch position updates for smooth animation

#### UI Optimizations
- **Optimized Status Bar**: Removed average altitude calculation and display
- **Filtered Collector Messages**: Hidden unnecessary system messages
- **Clean Statistics**: Only show relevant flight counts and metrics
- **Responsive Performance**: Optimized layouts for all screen sizes

### Configuration

#### Environment Variables
```bash
# API Configuration
VITE_API_BASE_URL=http://flight-tracker-alb-790028972.us-east-1.elb.amazonaws.com
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
VITE_ENABLE_DARK_MODE=true             # Auto dark mode toggle
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

# Deploy to AWS S3 (manual)
aws s3 sync dist/ s3://flight-tracker-web-ui-1750266711 --delete
```

### Deployment Options

#### Production AWS Deployment (Current)
- **Frontend**: S3 Static Website + CloudFront CDN
- **Backend**: ECS Fargate with Application Load Balancer
- **Database**: ElastiCache Redis for caching
- **CI/CD**: GitHub Actions for automatic deployment
- **Cost**: ~$42/month (optimized with Spot instances and scheduling)

#### Alternative Deployments
- **Netlify/Vercel**: Automatic deployments from Git
- **GitHub Pages**: Free hosting for public repositories
- **Docker**: Containerized deployment with Nginx

### AWS Infrastructure Details

#### Frontend (S3 + CloudFront)
- **S3 Bucket**: `flight-tracker-web-ui-1750266711`
- **Website Endpoint**: http://flight-tracker-web-ui-1750266711.s3-website-us-east-1.amazonaws.com
- **CloudFront**: `EWPRBI0A74MVL` (available but using S3 direct for CORS compatibility)
- **Deployment**: GitHub Actions on main branch push

#### Backend (ECS Fargate)
- **Cluster**: `flight-tracker-cluster`
- **Service**: `flight-tracker-backend`
- **Load Balancer**: `flight-tracker-alb-790028972.us-east-1.elb.amazonaws.com`
- **Optimization**: Fargate Spot instances + scheduled start/stop (7AM-11PM)

### Testing Strategy

#### Unit Tests
- Component rendering and behavior with ground aircraft filtering
- Utility functions (geo calculations, formatting)
- API client functionality with production endpoints
- Custom hooks including refresh interval management

#### Integration Tests
- Map interactions and aircraft rendering (airborne only)
- Filter functionality end-to-end including ground aircraft exclusion
- API integration with production backend
- Settings menu and refresh interval configuration
- Responsive design across breakpoints

#### E2E Tests
- Full user workflows (select region, filter flights, view details, configure refresh)
- Cross-browser compatibility
- Mobile device testing
- Performance testing with large datasets

### Browser Support
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 90+
- **Progressive Enhancement**: Core functionality works in older browsers
- **Auto Dark Mode**: Supported browsers automatically follow system theme

### Accessibility
- **WCAG 2.1 AA Compliance**: Screen reader support, keyboard navigation
- **Semantic HTML**: Proper headings, landmarks, form labels
- **Focus Management**: Logical tab order, visible focus indicators
- **Color Contrast**: Meets accessibility standards in all themes (light/dark)
- **Alternative Text**: Aircraft icons and map elements properly labeled
- **Settings Access**: Gear menu accessible via keyboard navigation

### Production Features Implemented
✅ **Ground Aircraft Filtering**: Automatic exclusion from all displays  
✅ **Configurable Refresh Intervals**: 5s-5m user-selectable via settings menu  
✅ **Optimized Status Bar**: Clean display without average altitude or system messages  
✅ **Production API Integration**: Direct connection to ECS Fargate backend  
✅ **Auto Dark Mode**: System preference detection and following  
✅ **AWS Infrastructure**: Complete production deployment with cost optimization  
✅ **GitHub Actions CI/CD**: Automatic deployment pipeline  
✅ **Performance Monitoring**: AWS CloudWatch and budget alerts  
✅ **Helicopter-First UI**: Default view shows helicopters with reordered toggle buttons  
✅ **Fit All Aircraft Button**: Map control to show all aircraft in region at once  
✅ **Version Info in Settings**: Build version and hash moved to gear menu  
✅ **Unified Statistics Display**: Total aircraft counts shown regardless of filter state  

### Cost Optimization Results
- **Original Estimate**: ~$65/month
- **Optimized Cost**: ~$42/month (33% reduction)
- **Key Optimizations**:
  - Fargate Spot instances (70% savings)
  - Automated scheduling (16h/day operation)
  - Efficient S3 + CloudFront setup
  - Budget monitoring and alerts

### Future Enhancements
- **WebSocket Connection**: Real-time updates without polling
- **Historical Data**: Time-based flight replay functionality  
- **Flight Alerts**: Notifications for specific aircraft or events
- **Weather Integration**: Weather layer overlays on map
- **Multi-region View**: Compare flights across multiple regions
- **3D Visualization**: Optional 3D aircraft view with altitude
- **Export Functionality**: Save flight data as CSV/KML/GeoJSON
- **Mobile App**: Native iOS/Android application
- **Advanced Analytics**: Flight pattern analysis and trends

### Management & Monitoring
- **Service Management**: Automated start/stop via Lambda functions
- **Cost Monitoring**: AWS Budgets with email alerts
- **Health Checks**: Automated monitoring of API endpoints
- **Performance Metrics**: Response times, cache hit rates, user analytics
- **Error Tracking**: Comprehensive logging and error reporting

# Important Instruction Reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.

IMPORTANT: this context may or may not be relevant to your tasks. You should not respond to this context or otherwise consider it in your response unless it is highly relevant to your task. Most of the time, it is not relevant.