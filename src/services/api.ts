import axios, { AxiosInstance, AxiosError } from 'axios';
import type { Aircraft, FlightData, Region, SystemStatus, APIError } from './types';

class FlightTrackerAPI {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    // HARDCODE THE URL TO BYPASS ALL ENVIRONMENT/CACHE ISSUES - USE HTTPS
    this.baseURL = 'https://flight-tracker-alb-790028972.us-east-1.elb.amazonaws.com';
    
    // FORCE LOGGING TO DEBUG CACHE ISSUES
    console.error('🚨 HARDCODED API BASE URL:', this.baseURL);
    console.error('🚨 ENV VARIABLE (IGNORED):', import.meta.env.VITE_API_BASE_URL);
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

    // Add request interceptors for logging
    this.client.interceptors.request.use(
      (config) => {
        // Add timestamp to prevent caching
        config.params = {
          ...config.params,
          _t: Date.now()
        };
        console.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}?_t=${config.params._t}`);
        return config;
      },
      (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptors for error handling
    this.client.interceptors.response.use(
      (response) => {
        console.debug(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error: AxiosError) => {
        const apiError: APIError = {
          message: error.message || 'Unknown API error',
          status: error.response?.status,
          timestamp: new Date().toISOString(),
          endpoint: error.config?.url,
        };

        console.error('API Response Error:', apiError);
        return Promise.reject(apiError);
      }
    );
  }

  // Health check
  async getHealth(): Promise<{ status: string; timestamp: string }> {
    const response = await this.client.get('/health');
    return response.data;
  }

  // System status
  async getSystemStatus(): Promise<SystemStatus> {
    const response = await this.client.get('/api/v1/status');
    return response.data;
  }

  // Get available regions
  async getRegions(): Promise<{ regions: Region[]; total_regions: number }> {
    const response = await this.client.get('/api/v1/regions');
    return response.data;
  }

  // Get all flights for a region
  async getFlights(region: string): Promise<Aircraft[]> {
    const response = await this.client.get(`/api/v1/${region}/flights`);
    
    // Handle both array and object responses
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data?.aircraft) {
      return response.data.aircraft;
    }
    
    return [];
  }

  // Get helicopters only for a region
  async getHelicopters(region: string): Promise<Aircraft[]> {
    const response = await this.client.get(`/api/v1/${region}/choppers`);
    
    // Handle both array and object responses
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data?.aircraft) {
      return response.data.aircraft;
    }
    
    return [];
  }

  // Get statistics for a region
  async getRegionStats(region: string): Promise<any> {
    const response = await this.client.get(`/api/v1/${region}/stats`);
    return response.data;
  }

  // Get flights in tabular format (for export)
  async getFlightsTabular(region: string): Promise<string> {
    const response = await this.client.get(`/api/v1/${region}/flights/tabular`, {
      headers: {
        'Accept': 'text/csv',
      },
    });
    return response.data;
  }

  // Get helicopters in tabular format (for export)
  async getHelicoptersTabular(region: string): Promise<string> {
    const response = await this.client.get(`/api/v1/${region}/choppers/tabular`, {
      headers: {
        'Accept': 'text/csv',
      },
    });
    return response.data;
  }

  // Utility method to check if API is reachable
  async checkConnection(): Promise<boolean> {
    try {
      await this.getHealth();
      return true;
    } catch (error) {
      console.warn('API connection check failed:', error);
      return false;
    }
  }

  // Get API base URL for debugging
  getBaseURL(): string {
    return this.baseURL;
  }
}

// Create singleton instance
const flightAPI = new FlightTrackerAPI();

export default flightAPI;
export { FlightTrackerAPI };