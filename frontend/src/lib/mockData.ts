import { Profile, Suitability, RevenueMonth, RainfallMonth, Insight, KpiData } from "@/types/dashboard";

export const fetchProfile = async (): Promise<Profile> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  const storedData = localStorage.getItem("farmSetup");
  if (storedData) {
    const data = JSON.parse(storedData);
    return {
      name: data.name,
      email: data.email,
      phone: data.phone,
      location: {
        lat: data.lat || 0,
        lon: data.lon || 0,
        place: data.county || "Unknown Location",
      },
      language: data.language || "en",
      soil: data.soilType || "Loam",
      irrigation: data.irrigationType || "Drip",
      farmSize: {
        value: parseFloat(data.farmSize) || 50,
        unit: data.farmSize?.includes("hectares") ? "ha" : "ac",
      },
      crops: data.preferredCrops || [],
      selectedCrop: data.preferredCrops?.[0] || "Wheat",
    };
  }
  
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
};

export const fetchKpiData = async (): Promise<KpiData> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  return {
    weather: {
      temp: 72,
      condition: "Partly Cloudy",
      humidity: 65,
      windSpeed: 8,
      icon: "partly-cloudy",
    },
    soilHealth: 85,
    irrigationEfficiency: 78,
    cropSuitability: 92,
    estimatedRevenue: 12500,
  };
};

export const fetchSuitability = async (whatIfRainfall?: number): Promise<Suitability[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  const baseScores = [
    { crop: "Wheat", score: 92, subScores: { soil: 95, climate: 90, water: 88, market: 95 } },
    { crop: "Corn", score: 85, subScores: { soil: 88, climate: 85, water: 82, market: 85 } },
    { crop: "Soybeans", score: 78, subScores: { soil: 80, climate: 75, water: 78, market: 80 } },
    { crop: "Rice", score: 65, subScores: { soil: 70, climate: 60, water: 65, market: 65 } },
    { crop: "Cotton", score: 72, subScores: { soil: 75, climate: 70, water: 68, market: 75 } },
  ];
  
  if (whatIfRainfall) {
    return baseScores.map((item) => ({
      ...item,
      score: Math.min(100, Math.max(0, item.score + whatIfRainfall)),
      subScores: item.subScores ? {
        ...item.subScores,
        water: Math.min(100, Math.max(0, item.subScores.water + whatIfRainfall)),
      } : undefined,
    }));
  }
  
  return baseScores;
};

export const fetchRevenueData = async (): Promise<RevenueMonth[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const crops = ["Wheat", "Corn", "Soybeans"];
  
  return months.flatMap((month) =>
    crops.map((crop) => ({
      month,
      crop,
      revenue: Math.floor(Math.random() * 5000) + 3000,
    }))
  );
};

export const fetchRainfallData = async (): Promise<RainfallMonth[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  return months.map((month) => ({
    month,
    mm: Math.floor(Math.random() * 150) + 20,
    yieldIndex: Math.floor(Math.random() * 40) + 60,
  }));
};

export const fetchInsights = async (): Promise<Insight[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  
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
    {
      id: "4",
      severity: "warn",
      text: "Pest activity detected in neighboring farms. Monitor your crops.",
    },
  ];
};