import React, { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { DivIcon, LatLngExpression } from 'leaflet';
import type { Aircraft } from '../../services/types';

interface AircraftMarkerProps {
  aircraft: Aircraft;
  isSelected: boolean;
  onClick: () => void;
}

// Aircraft icon component
const createAircraftIcon = (aircraft: Aircraft, isSelected: boolean): DivIcon => {
  const isHelicopter = aircraft.icao_aircraft_class?.startsWith('H');
  const isMilitary = aircraft.hex.toUpperCase().startsWith('AE');
  const isOnGround = aircraft.on_ground;
  
  // All icons use blue color
  let color = '#3b82f6'; // Blue for all aircraft
  
  // Scale and opacity based on selection and age
  const scale = isSelected ? 1.3 : 1.0;
  const opacity = aircraft.seen > 60 ? 0.6 : 1.0; // Fade old aircraft
  
  // Rotation based on track/heading
  const rotation = aircraft.track || 0;
  
  // Create SVG icon
  const svgIcon = isHelicopter ? 
    // Helicopter icon - X-shaped rotor blades
    `<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(${rotation}deg) scale(${scale}); opacity: ${opacity};">
      <!-- Main rotor blades - X shape -->
      <line x1="15" y1="15" x2="45" y2="45" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
      <line x1="45" y1="15" x2="15" y2="45" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
      <!-- Center hub -->
      <circle cx="30" cy="30" r="6" fill="${color}"/>
      <!-- Tail boom -->
      <line x1="30" y1="36" x2="30" y2="50" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
      <!-- Tail rotor -->
      <line x1="26" y1="50" x2="34" y2="50" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
      ${isSelected ? `<circle cx="30" cy="30" r="36" fill="none" stroke="${color}" stroke-width="2" opacity="0.5"/>` : ''}
    </svg>` :
    // Airplane icon - traditional aircraft shape
    `<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(${rotation}deg) scale(${scale}); opacity: ${opacity};">
      <!-- Fuselage -->
      <rect x="27" y="10" width="6" height="35" rx="3" fill="${color}"/>
      <!-- Wings -->
      <rect x="10" y="25" width="40" height="8" rx="4" fill="${color}"/>
      <!-- Tail wings -->
      <rect x="20" y="42" width="20" height="6" rx="3" fill="${color}"/>
      <!-- Nose -->
      <path d="M30 10 L27 13 L27 10 L33 10 L33 13 Z" fill="${color}"/>
      ${isSelected ? `<circle cx="30" cy="30" r="36" fill="none" stroke="${color}" stroke-width="2" opacity="0.5"/>` : ''}
    </svg>`;

  return new DivIcon({
    html: svgIcon,
    className: `aircraft-marker ${aircraft.gs && aircraft.gs > 0 ? 'moving' : ''}`,
    iconSize: [60, 60],
    iconAnchor: [30, 30],
    popupAnchor: [0, -30],
  });
};

const AircraftMarker: React.FC<AircraftMarkerProps> = ({ 
  aircraft, 
  isSelected, 
  onClick 
}) => {
  const position: LatLngExpression = [aircraft.lat, aircraft.lon];
  
  // Debug logging for helicopters
  const isHelicopter = aircraft.icao_aircraft_class?.startsWith('H');
  if (isHelicopter) {
    console.log('🚁 Rendering helicopter marker:', {
      hex: aircraft.hex,
      flight: aircraft.flight,
      position: [aircraft.lat, aircraft.lon],
      icao_class: aircraft.icao_aircraft_class,
      valid_coords: !isNaN(aircraft.lat) && !isNaN(aircraft.lon),
      lat: aircraft.lat,
      lon: aircraft.lon
    });
  }
  
  // Memoize the icon to prevent unnecessary re-renders
  const icon = useMemo(() => 
    createAircraftIcon(aircraft, isSelected), 
    [aircraft, isSelected]
  );

  // Format aircraft details for popup
  const formatAltitude = (alt?: number) => {
    if (!alt) return 'Unknown';
    return `${alt.toLocaleString()} ft`;
  };

  const formatSpeed = (speed?: number) => {
    if (!speed) return 'Unknown';
    return `${Math.round(speed)} kts`;
  };

  const formatHeading = (track?: number) => {
    if (!track) return 'Unknown';
    return `${Math.round(track)}°`;
  };

  const formatLastSeen = (seen: number) => {
    if (seen < 60) return `${Math.round(seen)}s ago`;
    if (seen < 3600) return `${Math.round(seen / 60)}m ago`;
    return `${Math.round(seen / 3600)}h ago`;
  };

  return (
    <Marker
      position={position}
      icon={icon}
      eventHandlers={{
        click: onClick,
      }}
    >
      <Popup
        closeButton={false}
        className="aircraft-popup"
        offset={[0, -10]}
      >
        <div className="p-2 min-w-64">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg text-gray-900">
              {aircraft.flight || aircraft.hex.toUpperCase()}
            </h3>
            <div className="flex items-center space-x-2">
              {aircraft.on_ground && (
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                  Ground
                </span>
              )}
              {aircraft.icao_aircraft_class?.startsWith('H') && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Helicopter
                </span>
              )}
              {aircraft.hex.toUpperCase().startsWith('AE') && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  Military
                </span>
              )}
            </div>
          </div>

          {/* Aircraft details */}
          <div className="space-y-1 text-sm">
            {aircraft.registration && (
              <div className="flex justify-between">
                <span className="text-gray-600">Registration:</span>
                <span className="font-medium">{aircraft.registration}</span>
              </div>
            )}
            
            {aircraft.model && (
              <div className="flex justify-between">
                <span className="text-gray-600">Aircraft:</span>
                <span className="font-medium">{aircraft.model}</span>
              </div>
            )}
            
            {aircraft.operator && (
              <div className="flex justify-between">
                <span className="text-gray-600">Operator:</span>
                <span className="font-medium">{aircraft.operator}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-gray-600">Altitude:</span>
              <span className="font-medium">{formatAltitude(aircraft.alt_baro)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Speed:</span>
              <span className="font-medium">{formatSpeed(aircraft.gs)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Heading:</span>
              <span className="font-medium">{formatHeading(aircraft.track)}</span>
            </div>
            
            {aircraft.distance_miles && (
              <div className="flex justify-between">
                <span className="text-gray-600">Distance:</span>
                <span className="font-medium">{aircraft.distance_miles.toFixed(1)} mi</span>
              </div>
            )}
            
            {aircraft.squawk && (
              <div className="flex justify-between">
                <span className="text-gray-600">Squawk:</span>
                <span className="font-medium font-mono">{aircraft.squawk}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-gray-600">Data source:</span>
              <span className="font-medium capitalize">{aircraft.data_source}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Last seen:</span>
              <span className="font-medium">{formatLastSeen(aircraft.seen)}</span>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default AircraftMarker;