import { Profile, KpiData, Suitability, Insight, RevenueMonth, RainfallMonth } from "./types";
import { mockProfile, mockKpiData, mockSuitability, mockInsights, mockRevenueData, mockRainfallData } from "./mockData";
import { createLogger } from "./logger";
import fs from 'fs/promises';
import path from 'path';

// Create logger for store operations
const logger = createLogger('store');

// Profile storage file path - use absolute path from project root
const PROFILE_FILE = path.join(process.cwd(), 'data', 'profile.json');

// Load profile from file or use empty default
async function loadProfile(): Promise<Profile> {
  try {
    const data = await fs.readFile(PROFILE_FILE, 'utf-8');
    const profile = JSON.parse(data);
    logger.info('Profile loaded from file', 'loadProfile', { email: profile.email });
    return profile;
  } catch (error) {
    // If file doesn't exist or can't be read, return empty profile that forces onboarding
    logger.info('No saved profile found, using empty default', 'loadProfile');
    return {
      name: "",
      email: "",
      phone: "",
      location: { lat: 0, lon: 0, place: "" },
      language: "en",
      soil: "",
      irrigation: "",
      farmSize: { value: 0, unit: "ac" },
      crops: [],
      selectedCrop: "",
    };
  }
}

// Save profile to file
async function saveProfile(profile: Profile): Promise<void> {
  try {
    await fs.mkdir(path.dirname(PROFILE_FILE), { recursive: true });
    await fs.writeFile(PROFILE_FILE, JSON.stringify(profile, null, 2));
    logger.info('Profile saved to file', 'saveProfile', { email: profile.email });
  } catch (error) {
    logger.error('Failed to save profile to file', 'saveProfile', { 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}

// In-memory store (profile will be loaded async)
const store = {
  profile: mockProfile, // Temporary, will be replaced by loaded profile
  kpiData: mockKpiData,
  suitability: mockSuitability,
  insights: mockInsights,
  revenueData: mockRevenueData,
  rainfallData: mockRainfallData,
};

// Initialize store - must be called before server starts
let isInitialized = false;

export async function initializeStore(): Promise<void> {
  if (isInitialized) {
    logger.info('Store already initialized', 'initializeStore');
    return;
  }
  
  try {
    const profile = await loadProfile();
    store.profile = profile;
    isInitialized = true;
    logger.info('Store initialized successfully', 'initializeStore', { 
      hasProfile: !!profile.email,
      location: profile.location.place 
    });
  } catch (error) {
    logger.error('Failed to load profile on startup', 'initializeStore', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    // Continue with empty profile
    isInitialized = true;
  }
}

// Profile operations
export const getProfile = (): Profile => {
  logger.info('Getting profile', 'getProfile', { email: store.profile.email });
  return store.profile;
};

export const updateProfile = (updates: Partial<Profile>): Profile => {
  logger.info('Updating profile', 'updateProfile', { updates: Object.keys(updates) });
  store.profile = { ...store.profile, ...updates };
  logger.info('Profile updated successfully', 'updateProfile', { email: store.profile.email });
  
  // Save to file (fire and forget - don't block)
  saveProfile(store.profile).catch(err => {
    logger.error('Failed to save profile after update', 'updateProfile', { error: err });
  });
  
  return store.profile;
};

export const setProfile = (profile: Profile): Profile => {
  logger.info('Setting profile', 'setProfile', { email: profile.email });
  store.profile = profile;
  logger.info('Profile set successfully', 'setProfile');
  
  // Save to file (fire and forget - don't block)
  saveProfile(profile).catch(err => {
    logger.error('Failed to save profile after set', 'setProfile', { error: err });
  });
  
  return store.profile;
};

// KPI data operations
export const getKpiData = (): KpiData => {
  logger.info('Getting KPI data', 'getKpiData');
  return store.kpiData;
};

export const updateKpiData = (updates: Partial<KpiData>): KpiData => {
  logger.info('Updating KPI data', 'updateKpiData', { updates: Object.keys(updates) });
  store.kpiData = { ...store.kpiData, ...updates };
  logger.info('KPI data updated successfully', 'updateKpiData');
  return store.kpiData;
};

// Suitability operations
export const getSuitability = (): Suitability[] => {
  logger.info('Getting suitability data', 'getSuitability', { count: store.suitability.length });
  return store.suitability;
};

export const updateSuitability = (suitability: Suitability[]): Suitability[] => {
  logger.info('Updating suitability data', 'updateSuitability', { count: suitability.length });
  store.suitability = suitability;
  logger.info('Suitability data updated successfully', 'updateSuitability');
  return store.suitability;
};

// Insights operations
export const getInsights = (): Insight[] => {
  logger.info('Getting insights', 'getInsights', { count: store.insights.length });
  return store.insights;
};

export const updateInsights = (insights: Insight[]): Insight[] => {
  logger.info('Updating insights', 'updateInsights', { count: insights.length });
  store.insights = insights;
  logger.info('Insights updated successfully', 'updateInsights');
  return store.insights;
};

export const addInsight = (insight: Insight): Insight[] => {
  logger.info('Adding insight', 'addInsight', { id: insight.id, severity: insight.severity });
  store.insights.push(insight);
  logger.info('Insight added successfully', 'addInsight', { totalCount: store.insights.length });
  return store.insights;
};

export const removeInsight = (id: string): Insight[] => {
  logger.info('Removing insight', 'removeInsight', { id });
  const initialCount = store.insights.length;
  store.insights = store.insights.filter((insight) => insight.id !== id);
  const removed = initialCount - store.insights.length;
  logger.info('Insight removal completed', 'removeInsight', { removed, remainingCount: store.insights.length });
  return store.insights;
};

// Revenue data operations
export const getRevenueData = (): RevenueMonth[] => {
  logger.info('Getting revenue data', 'getRevenueData', { count: store.revenueData.length });
  return store.revenueData;
};

// Rainfall data operations
export const getRainfallData = (): RainfallMonth[] => {
  logger.info('Getting rainfall data', 'getRainfallData', { count: store.rainfallData.length });
  return store.rainfallData;
};