import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { LatLngTuple } from 'leaflet';

interface SafeMapContainerProps {
  center: LatLngTuple;
  zoom: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  zoomControl?: boolean;
  onMapReady?: (map: L.Map) => void;
}

// Absolutely safe default coordinates (Tyler, TX)
const SAFE_CENTER: LatLngTuple = [32.3513, -95.3011];
const SAFE_ZOOM = 8;

const SafeMapContainer: React.FC<SafeMapContainerProps> = ({
  center,
  zoom,
  children,
  style = { height: '100%', width: '100%' },
  zoomControl = false,
  onMapReady
}) => {
  const [mapKey, setMapKey] = useState(0);
  const [isMapReady, setIsMapReady] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  // Ultra-safe coordinate validation
  const getSafeCoordinates = (inputCenter: LatLngTuple, inputZoom: number) => {
    try {
      const [lat, lng] = inputCenter || [NaN, NaN];
      
      const safeLat = (
        typeof lat === 'number' && 
        !isNaN(lat) && 
        isFinite(lat) && 
        lat >= -90 && 
        lat <= 90
      ) ? lat : SAFE_CENTER[0];
      
      const safeLng = (
        typeof lng === 'number' && 
        !isNaN(lng) && 
        isFinite(lng) && 
        lng >= -180 && 
        lng <= 180
      ) ? lng : SAFE_CENTER[1];
      
      const safeZoom = (
        typeof inputZoom === 'number' && 
        !isNaN(inputZoom) && 
        isFinite(inputZoom) && 
        inputZoom >= 1 && 
        inputZoom <= 20
      ) ? inputZoom : SAFE_ZOOM;

      return {
        center: [safeLat, safeLng] as LatLngTuple,
        zoom: safeZoom
      };
    } catch (error) {
      console.warn('🗺️ Error in coordinate validation, using safe defaults:', error);
      return {
        center: SAFE_CENTER,
        zoom: SAFE_ZOOM
      };
    }
  };

  const { center: safeCenter, zoom: safeZoom } = getSafeCoordinates(center, zoom);

  // Force remount if coordinates become invalid
  useEffect(() => {
    const [lat, lng] = center || [NaN, NaN];
    if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) {
      console.warn('🗺️ Invalid coordinates detected, forcing map remount');
      setMapKey(prev => prev + 1);
      setIsMapReady(false);
    }
  }, [center, zoom]);

  const handleMapCreated = (map: L.Map) => {
    mapRef.current = map;
    setIsMapReady(true);
    onMapReady?.(map);
  };

  return (
    <div style={style}>
      <MapContainer
        key={`safe-map-${mapKey}-${safeCenter[0]}-${safeCenter[1]}-${safeZoom}`}
        center={safeCenter}
        zoom={safeZoom}
        style={style}
        zoomControl={zoomControl}
        ref={handleMapCreated}
        attributionControl={true}
        zoomSnap={0.1}
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={1.0}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          noWrap={true}
          bounds={[[-90, -180], [90, 180]]}
        />
        
        {isMapReady && children}
      </MapContainer>
    </div>
  );
};

export default SafeMapContainer;