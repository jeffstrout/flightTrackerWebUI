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
  const isVisibleRef = useRef<boolean>(!document.hidden);

  // Fetch flight data and region info
  const fetchFlightData = useCallback(async (signal?: AbortSignal) => {
    const fetchStartTime = Date.now();
    console.info(`📡 Fetching flight data at ${new Date().toISOString()}`);
    
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

      const fetchTime = Date.now() - fetchStartTime;
      console.info(`✈️ Loaded ${flightData.length} aircraft for region: ${region} in ${fetchTime}ms`, currentRegionData);
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

  // Function to start/restart the interval
  const startInterval = useCallback(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      console.info('🔧 Clearing existing interval');
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Only start if auto-refresh is enabled, interval is valid, and tab is visible
    if (autoRefresh && refreshInterval > 0 && isVisibleRef.current) {
      console.info(`⏱️ Starting new refresh interval: ${refreshInterval}ms`);
      intervalRef.current = setInterval(() => {
        console.info(`🔄 Interval tick at ${new Date().toISOString()}`);
        fetchFlightData();
      }, refreshInterval);
    }
  }, [autoRefresh, refreshInterval, fetchFlightData]);

  // Function to stop the interval
  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      console.info('🛑 Stopping refresh interval');
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Set up auto-refresh interval
  useEffect(() => {
    console.info(`🔄 Setting up refresh: interval=${refreshInterval}ms, auto-refresh=${autoRefresh}`);
    
    // Initial fetch
    refetch();

    // Start the interval
    startInterval();

    // Cleanup function
    return () => {
      stopInterval();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [autoRefresh, refreshInterval, refetch, startInterval, stopInterval]);

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
      isVisibleRef.current = !document.hidden;
      
      if (document.hidden) {
        console.info('🌙 Tab hidden - pausing auto-refresh');
        stopInterval();
      } else {
        console.info('☀️ Tab visible - resuming auto-refresh');
        // Immediate fetch when tab becomes visible
        fetchFlightData();
        // Restart the interval
        startInterval();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchFlightData, startInterval, stopInterval]);

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