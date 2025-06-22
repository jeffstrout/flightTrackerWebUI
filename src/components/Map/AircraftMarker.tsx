import React, { useMemo } from 'react';
import { Marker } from 'react-leaflet';
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
  // Validate coordinates before creating position
  const hasValidCoordinates = (
    typeof aircraft.lat === 'number' && 
    typeof aircraft.lon === 'number' && 
    !isNaN(aircraft.lat) && 
    !isNaN(aircraft.lon) &&
    isFinite(aircraft.lat) && 
    isFinite(aircraft.lon) &&
    aircraft.lat >= -90 && 
    aircraft.lat <= 90 &&
    aircraft.lon >= -180 && 
    aircraft.lon <= 180
  );

  // Don't render marker if coordinates are invalid
  if (!hasValidCoordinates) {
    console.warn('🗺️ Skipping aircraft with invalid coordinates:', {
      hex: aircraft.hex,
      flight: aircraft.flight,
      lat: aircraft.lat,
      lon: aircraft.lon
    });
    return null;
  }

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

  return (
    <Marker
      position={position}
      icon={icon}
      eventHandlers={{
        click: (e) => {
          console.log('🖱️ Aircraft marker clicked:', {
            hex: aircraft.hex,
            flight: aircraft.flight,
            position: [aircraft.lat, aircraft.lon]
          });
          onClick();
        },
      }}
    />
  );
};

export default AircraftMarker;