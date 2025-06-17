import React, { useCallback, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { LatLngTuple } from 'leaflet';
import { Plus, Minus, Home } from 'lucide-react';
import AircraftMarker from './AircraftMarker';
import type { Aircraft, Region } from '../../services/types';

interface FlightMapProps {
  aircraft: Aircraft[];
  selectedAircraft?: Aircraft;
  center: LatLngTuple;
  zoom: number;
  regionData?: Region | null;
  onAircraftSelect: (hex?: string) => void;
  onMapStateChange: (center: LatLngTuple, zoom: number) => void;
}

// Default center coordinates (from environment or Tyler, TX)
const DEFAULT_CENTER: LatLngTuple = [
  Number(import.meta.env.VITE_MAP_CENTER_LAT) || 32.3513,
  Number(import.meta.env.VITE_MAP_CENTER_LON) || -95.3011
];
const DEFAULT_ZOOM = Number(import.meta.env.VITE_MAP_DEFAULT_ZOOM) || 8;

// Calculate appropriate zoom level to show the full radius
// Adjusted to show slightly more area (zoom out a bit from previous)
function calculateZoomFromRadius(radiusMiles: number, latitude: number): number {
  // Balanced zoom levels for good regional coverage:
  // Should show the full region with some padding
  
  if (radiusMiles >= 200) return 9;   // Very large regions
  if (radiusMiles >= 150) return 10;  // Large regions  
  if (radiusMiles >= 120) return 10;  // Standard regions (like ETEX) - zoom out from 12 to 10
  if (radiusMiles >= 80) return 11;   // Medium regions
  if (radiusMiles >= 50) return 12;   // Small regions
  return 13;
}

// Component to handle map events and updates
function MapEventHandler({ 
  onMapStateChange 
}: { 
  onMapStateChange: (center: LatLngTuple, zoom: number) => void 
}) {
  const map = useMap();

  useMapEvents({
    moveend: () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      onMapStateChange([center.lat, center.lng], zoom);
    },
    zoomend: () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      onMapStateChange([center.lat, center.lng], zoom);
    },
  });

  return null;
}

// Component to handle selected aircraft centering
function MapController({ 
  selectedAircraft, 
  center, 
  zoom 
}: { 
  selectedAircraft?: Aircraft;
  center: LatLngTuple;
  zoom: number;
}) {
  const map = useMap();
  const lastSelectedRef = useRef<string | undefined>();

  useEffect(() => {
    // Center on selected aircraft if it changed
    if (selectedAircraft && selectedAircraft.hex !== lastSelectedRef.current) {
      map.setView([selectedAircraft.lat, selectedAircraft.lon], Math.max(zoom, 10), {
        animate: true,
        duration: 1,
      });
      lastSelectedRef.current = selectedAircraft.hex;
    }
  }, [selectedAircraft, map, zoom]);

  return null;
}

const FlightMap: React.FC<FlightMapProps> = ({
  aircraft,
  selectedAircraft,
  center,
  zoom,
  regionData,
  onAircraftSelect,
  onMapStateChange,
}) => {
  const mapRef = useRef<L.Map | null>(null);

  // Handle aircraft marker click
  const handleAircraftClick = useCallback((hex: string) => {
    onAircraftSelect(hex);
  }, [onAircraftSelect]);

  // Handle map click (deselect aircraft)
  const handleMapClick = useCallback(() => {
    onAircraftSelect(undefined);
  }, [onAircraftSelect]);

  // Map control handlers
  const handleZoomIn = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  }, []);

  const handleGoHome = useCallback(() => {
    if (mapRef.current) {
      // Use region data if available, otherwise fall back to defaults
      const homeCenter: LatLngTuple = regionData?.center 
        ? [regionData.center.lat, regionData.center.lon]
        : DEFAULT_CENTER;
      
      const homeZoom = regionData?.radius_miles 
        ? calculateZoomFromRadius(regionData.radius_miles, regionData.center.lat)
        : DEFAULT_ZOOM;

      console.info(`🏠 Centering on region: ${regionData?.name || 'Default'}, radius: ${regionData?.radius_miles || 'N/A'} miles, zoom: ${homeZoom}`);
      
      mapRef.current.setView(homeCenter, homeZoom, {
        animate: true,
        duration: 1.0,
      });
    }
  }, [regionData]);

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        ref={mapRef}
        eventHandlers={{
          click: handleMapClick,
        }}
      >
        {/* Map tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={import.meta.env.VITE_MAP_TILE_SERVER || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'}
          maxZoom={19}
        />

        {/* Aircraft markers */}
        {aircraft.map((ac) => {
          // Debug logging for helicopters being passed to map
          if (ac.icao_aircraft_class?.startsWith('H')) {
            console.log('🗺️ FlightMap rendering helicopter:', {
              hex: ac.hex,
              flight: ac.flight,
              icao_class: ac.icao_aircraft_class,
              coordinates: [ac.lat, ac.lon]
            });
          }
          
          return (
            <AircraftMarker
              key={ac.hex}
              aircraft={ac}
              isSelected={selectedAircraft?.hex === ac.hex}
              onClick={() => handleAircraftClick(ac.hex)}
            />
          );
        })}

        {/* Map event handlers */}
        <MapEventHandler onMapStateChange={onMapStateChange} />
        
        {/* Map controller for selected aircraft */}
        <MapController
          selectedAircraft={selectedAircraft}
          center={center}
          zoom={zoom}
        />
      </MapContainer>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col space-y-1">
        {/* Zoom In */}
        <button
          onClick={handleZoomIn}
          className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-2 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-10 h-10 flex items-center justify-center"
          aria-label="Zoom in"
          title="Zoom in"
        >
          <Plus size={18} className="text-gray-700 dark:text-gray-300" />
        </button>

        {/* Zoom Out */}
        <button
          onClick={handleZoomOut}
          className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-2 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-10 h-10 flex items-center justify-center"
          aria-label="Zoom out"
          title="Zoom out"
        >
          <Minus size={18} className="text-gray-700 dark:text-gray-300" />
        </button>

        {/* Divider */}
        <div className="border-b border-gray-300 dark:border-gray-600 mx-2"></div>

        {/* Center/Home Button */}
        <button
          onClick={handleGoHome}
          className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-2 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-10 h-10 flex items-center justify-center"
          aria-label="Center on region"
          title="Center on region"
        >
          <Home size={16} className="text-gray-700 dark:text-gray-300" />
        </button>
      </div>

      {/* Aircraft count overlay */}
      <div className="absolute bottom-4 left-4 z-1000 bg-white dark:bg-gray-800 rounded-lg shadow-lg px-3 py-2 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 text-sm">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-gray-700 dark:text-gray-300 font-medium">
            {aircraft.length} aircraft
          </span>
        </div>
      </div>

      {/* Selected aircraft info overlay */}
      {selectedAircraft && (
        <div className="absolute top-4 left-4 z-1000 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-sm">
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {selectedAircraft.flight || selectedAircraft.hex.toUpperCase()}
                </h3>
                {selectedAircraft.registration && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedAircraft.registration}
                  </p>
                )}
              </div>
              <button
                onClick={() => onAircraftSelect(undefined)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-1 text-sm">
              {selectedAircraft.model && (
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Aircraft:</span> {selectedAircraft.model}
                </p>
              )}
              {selectedAircraft.operator && (
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Operator:</span> {selectedAircraft.operator}
                </p>
              )}
              {selectedAircraft.alt_baro && (
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Altitude:</span> {selectedAircraft.alt_baro.toLocaleString()} ft
                </p>
              )}
              {selectedAircraft.gs && (
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Speed:</span> {Math.round(selectedAircraft.gs)} kts
                </p>
              )}
              {selectedAircraft.track && (
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Heading:</span> {Math.round(selectedAircraft.track)}°
                </p>
              )}
              {selectedAircraft.distance_miles && (
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Distance:</span> {selectedAircraft.distance_miles.toFixed(1)} mi
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightMap;