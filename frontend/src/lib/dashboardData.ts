/**
 * Dashboard Data Management
 * Handles fetching, caching, and transforming dashboard data
 */

import { api } from './api';

const CACHE_KEY = 'farmData';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

interface CachedData {
  timestamp: number;
  rawData: any;
}

/**
 * Check if cached data is still valid (less than 1 hour old)
 */
function isCacheValid(cached: CachedData): boolean {
  const age = Date.now() - cached.timestamp;
  return age < CACHE_DURATION;
}

/**
 * Get cached data from localStorage
 */
function getCachedData(): any | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const parsed: CachedData = JSON.parse(cached);
    
    if (isCacheValid(parsed)) {
      console.log('✅ Using cached data');
      return parsed.rawData;
    }
    
    console.log('⏰ Cache expired');
    return null;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
}

/**
 * Save data to localStorage cache
 */
function cacheData(rawData: any): void {
  try {
    const cacheEntry: CachedData = {
      timestamp: Date.now(),
      rawData: rawData
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheEntry));
    console.log('💾 Data cached');
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
}

/**
 * Clear cached data (call this when settings change)
 */
export function clearDashboardCache(): void {
  localStorage.removeItem(CACHE_KEY);
  console.log('🗑️  Cache cleared');
}

/**
 * Fetch fresh data from API
 */
async function fetchFreshData(): Promise<any> {
  console.log('🌐 Fetching fresh data from API');
  
  try {
    const data = await api.get('/api/dashboard-data');
    
    // Cache the raw data
    cacheData(data);
    
    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch dashboard data');
  }
}

/**
 * Get dashboard data (uses cache if available, otherwise fetches)
 * @param onProgress - Optional callback for progress updates
 */
export async function getDashboardData(
  onProgress?: (message: string, progress: number) => void
): Promise<any> {
  try {
    onProgress?.('Checking cache...', 10);
    
    // Try cache first
    let rawData = getCachedData();
    
    // If no cache or expired, fetch fresh
    if (!rawData) {
      onProgress?.('Fetching real-time data...', 30);
      rawData = await fetchFreshData();
      onProgress?.('Processing data...', 80);
    } else {
      onProgress?.('Loading from cache...', 90);
    }
    
    onProgress?.('Complete!', 100);
    
    // Return raw data (will be transformed in component)
    return rawData;
    
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    throw error;
  }
}

/**
 * Transform raw data to frontend format
 * Note: This is a simplified version. For production, copy full transformer from backend
 */
export function transformDashboardData(rawData: any) {
  if (!rawData || !rawData.data) {
    throw new Error('Invalid data format');
  }

  const { data } = rawData;
  
  // Return the raw data structure that frontend components expect
  // The backend transformer is complex, so for now we pass through
  // the data structure and let components handle it
  return {
    profile: {
      location: rawData.location,
      crop: rawData.crop
    },
    soilData: data.soilData || {},
    rainfallData: data.rainfallData || {},
    cropData: data.cropData || {},
    weather: data.weather || {},
    // These will use existing mock data transformers until full integration
    suitability: [],
    rainfall: [],
    kpiData: {
      weather: data.weather || {},
      soilHealth: 85,
      irrigationEfficiency: 78,
      cropSuitability: 92,
      estimatedRevenue: 12500
    },
    insights: [],
    revenue: []
  };
}

