import { Profile, KpiData, Suitability, Insight, RevenueMonth, RainfallMonth } from "./types";
import { mockProfile, mockKpiData, mockSuitability, mockInsights, mockRevenueData, mockRainfallData } from "./mockData";
import { createLogger } from "./logger";

// Create logger for store operations
const logger = createLogger('store');

// In-memory store
const store = {
  profile: mockProfile,
  kpiData: mockKpiData,
  suitability: mockSuitability,
  insights: mockInsights,
  revenueData: mockRevenueData,
  rainfallData: mockRainfallData,
};

logger.info('Store initialized with mock data', 'init');

// Profile operations
export const getProfile = (): Profile => {
  logger.info('Getting profile', 'getProfile', { email: store.profile.email });
  return store.profile;
};

export const updateProfile = (updates: Partial<Profile>): Profile => {
  logger.info('Updating profile', 'updateProfile', { updates: Object.keys(updates) });
  store.profile = { ...store.profile, ...updates };
  logger.info('Profile updated successfully', 'updateProfile', { email: store.profile.email });
  return store.profile;
};

export const setProfile = (profile: Profile): Profile => {
  logger.info('Setting profile', 'setProfile', { email: profile.email });
  store.profile = profile;
  logger.info('Profile set successfully', 'setProfile');
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