/**
 * Data Transformer Service
 * Converts Letta/Bright Data format → Frontend JSON format
 * 
 * This service simulates what Letta will do in production:
 * 1. Letta returns raw Bright Data (crops, rainfall, soil)
 * 2. This transformer converts it to clean JSON for frontend
 * 3. Frontend receives properly formatted data
 */

import { KpiData, Suitability, Insight, RevenueMonth, RainfallMonth } from '../types';
import { createLogger } from '../logger';

const logger = createLogger('dataTransformer');

/**
 * Extract numeric value from profitability string
 * Example: "$2,000 - $5,000/acre" → average of 3500
 */
function extractProfitability(profitStr: string): number {
  const matches = profitStr.match(/\$?([\d,]+)\s*-\s*\$?([\d,]+)/);
  if (matches) {
    const low = parseInt(matches[1].replace(/,/g, ''));
    const high = parseInt(matches[2].replace(/,/g, ''));
    return Math.round((low + high) / 2);
  }
  return 0;
}

/**
 * Extract numeric value from rainfall string
 * Example: "5.12 inches" → 5.12
 */
function extractRainfall(rainStr: string): number {
  const match = rainStr.match(/([\d.]+)/);
  return match ? parseFloat(match[1]) : 0;
}

/**
 * Calculate crop suitability score from profitability and other factors
 */
function calculateSuitabilityScore(profitability: number, maxProfit: number): number {
  return Math.round((profitability / maxProfit) * 100);
}

/**
 * Transform crops data to Suitability format
 */
export function transformCropsToSuitability(brightData: any): Suitability[] {
  logger.info('Transforming crops data to suitability', 'transformCropsToSuitability');
  
  const crops = brightData.cropsData.top_crops;
  
  // Find max profitability for normalization
  const profitabilities = crops.map((c: any) => extractProfitability(c.annual_profitability));
  const maxProfit = Math.max(...profitabilities);
  
  return crops.map((crop: any) => {
    const profitability = extractProfitability(crop.annual_profitability);
    const score = calculateSuitabilityScore(profitability, maxProfit);
    
    return {
      crop: crop.crop,
      score: score,
      subScores: {
        soil: score >= 90 ? 95 : score >= 70 ? 85 : 75,
        climate: score >= 90 ? 92 : score >= 70 ? 82 : 72,
        water: score >= 90 ? 88 : score >= 70 ? 78 : 68,
        market: score
      },
      profitability: crop.annual_profitability,
      yield_estimate: crop.yield_estimate,
      reason: crop.reason,
      suitability_factors: crop.suitability_factors
    };
  });
}

/**
 * Transform rainfall data to monthly format
 */
export function transformRainfallData(brightData: any): RainfallMonth[] {
  logger.info('Transforming rainfall data', 'transformRainfallData');
  
  const monthlyData = brightData.rainfallData.monthly_rainfall;
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const fullMonthNames = Object.keys(monthlyData);
  
  return monthNames.map((shortName, index) => {
    const fullName = fullMonthNames[index];
    const rainfall = extractRainfall(monthlyData[fullName]);
    
    // Calculate yield index based on rainfall (rough estimation)
    // Optimal rainfall: 2-4 inches → yield index ~90-100
    const yieldIndex = rainfall >= 2 && rainfall <= 4 ? 90 + Math.round(Math.random() * 10) :
                       rainfall > 4 ? 80 + Math.round(Math.random() * 10) :
                       60 + Math.round(Math.random() * 20);
    
    return {
      month: shortName,
      mm: Math.round(rainfall * 25.4), // Convert inches to mm
      yieldIndex: yieldIndex
    };
  });
}

/**
 * Transform crops data to revenue format
 */
export function transformCropsToRevenue(brightData: any, farmSizeAcres: number = 50): RevenueMonth[] {
  logger.info('Transforming crops to revenue', 'transformCropsToRevenue', { farmSizeAcres });
  
  const crops = brightData.cropsData.top_crops.slice(0, 3); // Top 3 crops
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  return monthNames.flatMap((month) => {
    return crops.map((crop: any) => {
      const avgProfitPerAcre = extractProfitability(crop.annual_profitability);
      const monthlyRevenue = Math.round((avgProfitPerAcre * farmSizeAcres / 12) * (0.8 + Math.random() * 0.4));
      
      return {
        month: month,
        crop: crop.crop,
        revenue: monthlyRevenue
      };
    });
  });
}

/**
 * Generate KPI data from Bright Data
 */
export function transformToKpiData(brightData: any, weatherData?: any): KpiData {
  logger.info('Transforming to KPI data', 'transformToKpiData');
  
  const soilpH = brightData.soilData.properties.pH;
  const drainage = brightData.soilData.properties.drainage;
  
  const crops = brightData.cropsData.top_crops;
  const avgProfitability = extractProfitability(crops[0].annual_profitability);
  
  return {
    weather: weatherData || {
      temp: 72,
      condition: "Partly Cloudy",
      humidity: 65,
      windSpeed: 8,
      icon: "partly-cloudy",
    },
    soilpH: soilpH,
    drainage: drainage,
    estimatedRevenue: Math.round(avgProfitability * 50 / 12) // Monthly for 50 acres
  };
}

/**
 * Generate insights from Bright Data
 */
export function transformToInsights(brightData: any): Insight[] {
  logger.info('Generating insights from data', 'transformToInsights');
  
  const allInsights: Insight[] = [];
  let id = 1;
  
  // Build pool of possible insights
  
  // 1. Climate Summary Insight
  allInsights.push({
    id: String(id++),
    severity: "info",
    text: `Climate: ${brightData.cropsData.key_findings.climate_summary}`,
    action: { label: "View Climate Data" }
  });
  
  // 2. Soil Summary Insight
  allInsights.push({
    id: String(id++),
    severity: "info",
    text: `Soil: ${brightData.cropsData.key_findings.soil_summary}`,
    action: { label: "View Soil Details" }
  });
  
  // 3. Rainfall Pattern Alert (Critical for dry months)
  const dryestMonths = brightData.rainfallData.key_findings[3];
  allInsights.push({
    id: String(id++),
    severity: "critical",
    text: `${dryestMonths} Plan irrigation carefully during summer months to ensure crop health.`,
    action: { label: "Irrigation Schedule" }
  });
  
  // 4. Rainfall Warning/Info
  const annualRainfall = parseFloat(brightData.rainfallData.annual_rainfall);
  if (annualRainfall < 30) {
    allInsights.push({
      id: String(id++),
      severity: "warn",
      text: `Annual rainfall (${brightData.rainfallData.annual_rainfall}) is below optimal. Implement water-efficient irrigation systems and consider drought-resistant crop varieties.`,
      action: { label: "Water Conservation Plan" }
    });
  } else {
    const wettestMonths = brightData.rainfallData.key_findings[2];
    allInsights.push({
      id: String(id++),
      severity: "info",
      text: `${wettestMonths} Good natural water supply during winter. Optimize storage for dry season.`,
      action: { label: "Water Storage Tips" }
    });
  }
  
  // 5. Top Crop Profitability Insight
  const topCrop = brightData.cropsData.top_crops[0];
  allInsights.push({
    id: String(id++),
    severity: "info",
    text: `${topCrop.crop} is your top opportunity with ${topCrop.annual_profitability} net profit. ${topCrop.reason.substring(0, 120)}...`,
    action: { label: "Crop Details", href: "#" }
  });
  
  // 6. Soil pH Alert/Info
  const soilpH = brightData.soilData.properties.pH;
  if (soilpH < 6) {
    allInsights.push({
      id: String(id++),
      severity: "warn",
      text: `Soil pH (${soilpH}) is acidic. Consider lime application to raise pH to optimal range (6.0-7.0) for better nutrient availability.`,
      action: { label: "Soil Amendment Guide" }
    });
  } else if (soilpH > 7.5) {
    allInsights.push({
      id: String(id++),
      severity: "warn",
      text: `Soil pH (${soilpH}) is alkaline. Consider sulfur application to lower pH for improved nutrient uptake.`,
      action: { label: "pH Management" }
    });
  } else {
    allInsights.push({
      id: String(id++),
      severity: "info",
      text: `Excellent soil conditions! pH (${soilpH}) is optimal. ${brightData.soilData.properties.texture} texture with ${brightData.soilData.properties.drainage} drainage supports healthy root development.`,
    });
  }
  
  // 7. Low Yield Warning (if applicable)
  const userCrops = ["Almonds", "Walnuts", "Rice"];
  const top3CropNames = brightData.cropsData.top_crops.slice(0, 3).map((c: any) => c.crop);
  const lowYieldCrops = userCrops.filter(crop => !top3CropNames.includes(crop));
  
  if (lowYieldCrops.length > 0) {
    allInsights.push({
      id: String(id++),
      severity: "warn",
      text: `${lowYieldCrops.join(", ")} may have lower profitability in your area. Consider diversifying with top performers like ${top3CropNames[0]} or ${top3CropNames[1]}.`,
      action: { label: "Crop Comparison" }
    });
  }
  
  // 8. Market Opportunity
  const marketOverview = brightData.cropsData.key_findings.market_overview;
  allInsights.push({
    id: String(id++),
    severity: "info",
    text: `Market: ${marketOverview.substring(0, 180)}...`,
    action: { label: "Market Trends", href: "#" }
  });
  
  // 9. Seasonal Weather Alert
  allInsights.push({
    id: String(id++),
    severity: "critical",
    text: `Hot, dry summers ahead! Prepare for high irrigation demand. Monitor soil moisture daily and adjust watering schedules to prevent crop stress.`,
    action: { label: "Summer Prep Guide" }
  });
  
  // 10. Organic Matter
  const organicMatter = parseFloat(brightData.soilData.properties.organicMatter);
  if (organicMatter < 2) {
    allInsights.push({
      id: String(id++),
      severity: "warn",
      text: `Soil organic matter (${brightData.soilData.properties.organicMatter}) is low. Add compost or cover crops to improve soil health and nutrient retention.`,
      action: { label: "Soil Health Plan" }
    });
  } else {
    allInsights.push({
      id: String(id++),
      severity: "info",
      text: `Good soil organic matter (${brightData.soilData.properties.organicMatter}). Maintain with crop rotation and organic amendments for long-term fertility.`,
    });
  }
  
  // Randomly select 4 insights (ensuring at least 1 critical/warn)
  const criticalWarnings = allInsights.filter(i => i.severity === "critical" || i.severity === "warn");
  const infoInsights = allInsights.filter(i => i.severity === "info");
  
  // Always include 1-2 critical/warnings and 2-3 info
  const selectedInsights: Insight[] = [];
  
  // Pick 1-2 critical/warnings
  const numWarnings = Math.min(2, criticalWarnings.length);
  const shuffledWarnings = criticalWarnings.sort(() => Math.random() - 0.5);
  selectedInsights.push(...shuffledWarnings.slice(0, numWarnings));
  
  // Fill remaining with info (total 4)
  const numInfo = 4 - selectedInsights.length;
  const shuffledInfo = infoInsights.sort(() => Math.random() - 0.5);
  selectedInsights.push(...shuffledInfo.slice(0, numInfo));
  
  // Re-number IDs
  return selectedInsights.map((insight, index) => ({
    ...insight,
    id: String(index + 1)
  }));
}

/**
 * Main transformer function - converts all Bright Data to frontend format
 */
export function transformLettaResponse(brightData: any, farmSizeAcres: number = 50) {
  logger.info('Transforming complete Letta response', 'transformLettaResponse', { farmSizeAcres });
  
  return {
    suitability: transformCropsToSuitability(brightData),
    rainfall: transformRainfallData(brightData),
    revenue: transformCropsToRevenue(brightData, farmSizeAcres),
    kpiData: transformToKpiData(brightData),
    insights: transformToInsights(brightData)
  };
}

