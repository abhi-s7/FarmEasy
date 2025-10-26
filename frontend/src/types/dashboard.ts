export type Profile = {
  name: string;
  email: string;
  phone: string;
  location: {
    lat: number;
    lon: number;
    place: string;
  };
  language: string;
  soil: string;
  irrigation: string;
  farmSize: {
    value: number;
    unit: "ac" | "ha";
  };
  crops: string[];
  selectedCrop: string;
};

export type Suitability = {
  crop: string;
  score: number;
  subScores?: {
    soil: number;
    climate: number;
    water: number;
    market: number;
  };
  profitability?: string;
  yield_estimate?: string;
  reason?: string;
  suitability_factors?: string;
};

export type RevenueMonth = {
  month: string;
  crop: string;
  revenue: number;
};

export type RainfallMonth = {
  month: string;
  mm: number;
  yieldIndex: number;
};

export type RainfallData = {
  months: RainfallMonth[];
  keyFindings: string[];
};

export type SoilData = {
  pincode: string;
  properties: {
    soilSeries: string;
    drainage: string;
    texture: string;
    pH: number;
    organicMatter: string;
    permeability: string;
    parentMaterial: string;
    depthCoverageCm: string;
    sandContent: string;
    siltContent: string;
    clayContent: string;
  };
  keyInsights: string;
  sources: string[];
};

export type Insight = {
  id: string;
  severity: "info" | "warn" | "critical";
  text: string;
  action?: {
    label: string;
    href?: string;
  };
};

export type WeatherData = {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
};

export type KpiData = {
  weather: WeatherData;
  soilpH: number;
  drainage: string;
  estimatedRevenue: number;
};