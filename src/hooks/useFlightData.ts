import { useState, useEffect, useCallback, useRef } from 'react';
import flightAPI from '../services/api';
import type { Aircraft, SystemStatus, APIError, Region } from '../services/types';

interface UseFlightDataReturn {
  aircraft: Aircraft[];
  region: string;
  regionData: Region | null;
  setRegion: (region: string) => void;
  loading: boolean;
  error: APIError | null;
  lastUpdate: Date | null;
  systemStatus: SystemStatus | null;
  refetch: () => Promise<void>;
}

export function useFlightData(
  autoRefresh: boolean = true,
  refreshInterval: number = 15000
): UseFlightDataReturn {
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [region, setRegion] = useState<string>(
    import.meta.env.VITE_DEFAULT_REGION || 'etex'
  );
  const [regionData, setRegionData] = useState<Region | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<APIError | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch flight data and region info
  const fetchFlightData = useCallback(async (signal?: AbortSignal) => {
    try {
      setError(null);
      
      // Fetch flights, system status, and regions in parallel
      const [flightData, statusData, regionsResponse] = await Promise.all([
        flightAPI.getFlights(region),
        flightAPI.getSystemStatus(),
        flightAPI.getRegions()
      ]);

      // Check if request was aborted
      if (signal?.aborted) return;

      // Find current region data
      const currentRegionData = regionsResponse.regions?.find(r => 
        r.name?.toLowerCase().includes('texas') || 
        r.name?.toLowerCase().includes('etex') ||
        region === 'etex'
      ) || regionsResponse.regions?.[0] || null;

      setAircraft(flightData);
      setSystemStatus(statusData);
      setRegionData(currentRegionData);
      setLoading(false);
      setLastUpdate(new Date());

      console.info(`✈️ Loaded ${flightData.length} aircraft for region: ${region}`, currentRegionData);
    } catch (err) {
      // Don't set error if request was aborted
      if (signal?.aborted) return;

      const apiError = err as APIError;
      setError(apiError);
      setLoading(false);
      
      console.error('Failed to fetch flight data:', apiError);
    }
  }, [region]);

  // Manual refetch function
  const refetch = useCallback(async () => {
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    await fetchFlightData(controller.signal);
  }, [fetchFlightData]);

  // Set up auto-refresh interval
  useEffect(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Initial fetch
    refetch();

    // Set up auto-refresh if enabled
    if (autoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchFlightData();
      }, refreshInterval);
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [autoRefresh, refreshInterval, refetch]);

  // Handle region changes
  const handleRegionChange = useCallback((newRegion: string) => {
    setRegion(newRegion);
    setLoading(true);
    setError(null);
    setAircraft([]);
  }, []);

  // Handle visibility change (pause/resume when tab is hidden/visible)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden, pause auto-refresh
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      } else {
        // Tab is visible, resume auto-refresh
        if (autoRefresh && refreshInterval > 0) {
          // Immediate fetch when tab becomes visible
          fetchFlightData();
          
          intervalRef.current = setInterval(() => {
            fetchFlightData();
          }, refreshInterval);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [autoRefresh, refreshInterval, fetchFlightData]);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.info('🌐 Connection restored, resuming flight data updates');
      if (autoRefresh) {
        refetch();
      }
    };

    const handleOffline = () => {
      console.warn('📴 Connection lost, pausing flight data updates');
      setError({
        message: 'Connection lost. Flight data updates paused.',
        timestamp: new Date().toISOString(),
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [autoRefresh, refetch]);

  return {
    aircraft,
    region,
    regionData,
    setRegion: handleRegionChange,
    loading,
    error,
    lastUpdate,
    systemStatus,
    refetch,
  };
}