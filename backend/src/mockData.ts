import { Profile, KpiData, Suitability, Insight, RevenueMonth, RainfallMonth } from "./types";

export const mockProfile: Profile = {
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

export const mockKpiData: KpiData = {
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

export const mockSuitability: Suitability[] = [
  { crop: "Wheat", score: 92, subScores: { soil: 95, climate: 90, water: 88, market: 95 } },
  { crop: "Corn", score: 85, subScores: { soil: 88, climate: 85, water: 82, market: 85 } },
  { crop: "Soybeans", score: 78, subScores: { soil: 80, climate: 75, water: 78, market: 80 } },
  { crop: "Rice", score: 65, subScores: { soil: 70, climate: 60, water: 65, market: 65 } },
  { crop: "Cotton", score: 72, subScores: { soil: 75, climate: 70, water: 68, market: 75 } },
];

export const mockInsights: Insight[] = [
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

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const crops = ["Wheat", "Corn", "Soybeans"];

export const mockRevenueData: RevenueMonth[] = months.flatMap((month) =>
  crops.map((crop) => ({
    month,
    crop,
    revenue: Math.floor(Math.random() * 5000) + 3000,
  }))
);

export const mockRainfallData: RainfallMonth[] = months.map((month) => ({
  month,
  mm: Math.floor(Math.random() * 150) + 20,
  yieldIndex: Math.floor(Math.random() * 40) + 60,
}));