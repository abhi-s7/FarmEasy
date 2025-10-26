import { Profile, Suitability, RevenueMonth, RainfallMonth, RainfallData, SoilData, Insight, KpiData } from "@/types/dashboard";
import { api } from "./api";

export const fetchProfile = async (): Promise<Profile> => {
  try {
    return await api.get('/api/profile');
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    // Fallback to default
    return {
      name: "John Farmer",
      email: "john@farm.com",
      phone: "+1234567890",
      location: { lat: 40.7128, lon: -74.006, place: "Sample County" },
      language: "en",
      soil: "Loam",
      irrigation: "Drip",
      farmSize: { value: 50, unit: "ac" },
      crops: ["Wheat", "Corn", "Soybeans"],
      selectedCrop: "Wheat",
    };
  }
};

export const fetchKpiData = async (): Promise<KpiData> => {
  try {
    return await api.get('/api/kpi');
  } catch (error) {
    console.error('Failed to fetch KPI data:', error);
    // Fallback to default
    return {
      weather: {
        temp: 72,
        condition: "Partly Cloudy",
        humidity: 65,
        windSpeed: 8,
        icon: "partly-cloudy",
      },
      soilpH: 6.5,
      drainage: "Well drained",
      estimatedRevenue: 12500,
    };
  }
};

export const fetchSuitability = async (whatIfRainfall?: number): Promise<Suitability[]> => {
  try {
    return await api.get('/api/suitability');
  } catch (error) {
    console.error('Failed to fetch suitability:', error);
    // Fallback to default
    return [
      { crop: "Wheat", score: 92, subScores: { soil: 95, climate: 90, water: 88, market: 95 } },
      { crop: "Corn", score: 85, subScores: { soil: 88, climate: 85, water: 82, market: 85 } },
      { crop: "Soybeans", score: 78, subScores: { soil: 80, climate: 75, water: 78, market: 80 } },
      { crop: "Rice", score: 65, subScores: { soil: 70, climate: 60, water: 65, market: 65 } },
      { crop: "Cotton", score: 72, subScores: { soil: 75, climate: 70, water: 68, market: 75 } },
    ];
  }
};

export const fetchRevenueData = async (): Promise<RevenueMonth[]> => {
  try {
    return await api.get('/api/revenue');
  } catch (error) {
    console.error('Failed to fetch revenue data:', error);
    // Fallback to default
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const crops = ["Wheat", "Corn", "Soybeans"];
    return months.flatMap((month) =>
      crops.map((crop) => ({
        month,
        crop,
        revenue: Math.floor(Math.random() * 5000) + 3000,
      }))
    );
  }
};

export const fetchRainfallData = async (): Promise<RainfallData> => {
  try {
    return await api.get('/api/rainfall');
  } catch (error) {
    console.error('Failed to fetch rainfall data:', error);
    // Fallback to default
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return {
      months: months.map((month) => ({
        month,
        mm: Math.floor(Math.random() * 150) + 20,
        yieldIndex: Math.floor(Math.random() * 40) + 60,
      })),
      keyFindings: [
        "Rainfall data unavailable. Using estimated values."
      ]
    };
  }
};

export const fetchSoilData = async (): Promise<SoilData> => {
  try {
    return await api.get('/api/soil');
  } catch (error) {
    console.error('Failed to fetch soil data:', error);
    // Fallback to default
    return {
      pincode: "00000",
      properties: {
        soilSeries: "Unknown",
        drainage: "Moderate",
        texture: "Loam",
        pH: 6.5,
        organicMatter: "2%",
        permeability: "Moderate",
        parentMaterial: "Unknown",
        depthCoverageCm: "0-60 cm",
        sandContent: "40%",
        siltContent: "40%",
        clayContent: "20%"
      },
      keyInsights: "Soil data unavailable.",
      sources: []
    };
  }
};

export const fetchInsights = async (): Promise<Insight[]> => {
  try {
    return await api.get('/api/insights');
  } catch (error) {
    console.error('Failed to fetch insights:', error);
    // Fallback to default
    return [
      {
        id: "1",
        severity: "critical",
        text: "Heavy rainfall expected in 3 days. Consider drainage preparation.",
        action: { label: "View Details", href: "#" },
      },
      {
        id: "2",
        severity: "warn",
        text: "Soil moisture levels are below optimal for wheat. Increase irrigation.",
        action: { label: "Adjust Schedule" },
      },
      {
        id: "3",
        severity: "info",
        text: "Market prices for corn are trending upward. Good time to harvest.",
        action: { label: "View Market" },
      },
    ];
  }
};