import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cloud, Sun, CloudRain, Droplets, Sprout, DollarSign, Settings, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchProfile, fetchKpiData } from "@/lib/mockData";
import { useTranslation } from "react-i18next";
import KpiCard from "@/components/dashboard/KpiCard";
import PestRiskCard from "@/components/dashboard/PestRiskCard";
import WaterEfficiencyCard from "@/components/dashboard/WaterEfficiencyCard";
import SoilConditionsCard from "@/components/dashboard/SoilConditionsCard";
import HarvestReadinessCard from "@/components/dashboard/HarvestReadinessCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import CropYieldRankingChart from "@/components/dashboard/CropYieldRankingChart";
import RainYieldChart from "@/components/dashboard/RainYieldChart";
import InsightsList from "@/components/dashboard/InsightsList";
import AssistantFab from "@/components/dashboard/AssistantFab";
import AssistantDrawer from "@/components/dashboard/AssistantDrawer";
import { OnboardingData } from "./Onboarding";

const Dashboard = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [farmData, setFarmData] = useState<OnboardingData | null>(null);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
  });

  const { data: kpiData, isLoading: kpiLoading } = useQuery({
    queryKey: ["kpi"],
    queryFn: fetchKpiData,
  });

  useEffect(() => {
    const storedData = localStorage.getItem("farmSetup");
    if (storedData) {
      const data = JSON.parse(storedData);
      setFarmData(data);
      if (data.language) {
        i18n.changeLanguage(data.language);
      }
    } else {
      navigate("/onboarding");
    }
  }, [navigate, i18n]);

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    if (farmData) {
      const updatedData = { ...farmData, language: lang };
      setFarmData(updatedData);
      localStorage.setItem("farmSetup", JSON.stringify(updatedData));
    }
  };

  const getWeatherIcon = () => {
    if (!kpiData) return <Cloud className="w-5 h-5 text-white" />;
    switch (kpiData.weather.icon) {
      case "sunny":
        return <Sun className="w-5 h-5 text-white" />;
      case "rainy":
        return <CloudRain className="w-5 h-5 text-white" />;
      default:
        return <Cloud className="w-5 h-5 text-white" />;
    }
  };

  if (!farmData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile?.name || farmData.name}'s Farm
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="gap-1">
                    <MapPin className="w-3 h-3" />
                    {profile?.location.place || farmData.county}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Select value={i18n.language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">🇺🇸 English</SelectItem>
                  <SelectItem value="es">🇪🇸 Español</SelectItem>
                  <SelectItem value="hi">🇮🇳 हिंदी</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                onClick={() => navigate("/onboarding")}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard
            title={t("dashboard.weather")}
            value={kpiData ? `${kpiData.weather.temp}°F` : "--"}
            subtitle={kpiData?.weather.condition}
            icon={getWeatherIcon as any}
            iconColor="bg-blue-500"
            isLoading={kpiLoading}
          />
          <KpiCard
            title={t("dashboard.soilIrrigation")}
            value={kpiData ? `${kpiData.soilHealth}%` : "--"}
            subtitle={`Irrigation: ${kpiData?.irrigationEfficiency || "--"}%`}
            icon={Droplets}
            iconColor="bg-emerald-500"
            isLoading={kpiLoading}
          />
          <KpiCard
            title={t("dashboard.cropSuitability")}
            value={kpiData ? `${kpiData.cropSuitability}%` : "--"}
            subtitle="Excellent conditions"
            icon={Sprout}
            iconColor="bg-green-500"
            isLoading={kpiLoading}
          />
          <KpiCard
            title={t("dashboard.revenue")}
            value={kpiData ? `$${kpiData.estimatedRevenue.toLocaleString()}` : "--"}
            subtitle="This month"
            icon={DollarSign}
            iconColor="bg-amber-500"
            isLoading={kpiLoading}
          />
        </div>

        {/* Farm Health Insights - 2×2 Grid */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Farm Health Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PestRiskCard />
            <WaterEfficiencyCard />
            <SoilConditionsCard />
            <HarvestReadinessCard />
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart />
          <CropYieldRankingChart />
          <RainYieldChart />
          <InsightsList />
        </div>
      </div>

      {/* Assistant FAB */}
      <AssistantFab onClick={() => setAssistantOpen(true)} />

      {/* Assistant Drawer */}
      <AssistantDrawer
        open={assistantOpen}
        onOpenChange={setAssistantOpen}
        farmData={farmData}
      />
    </div>
  );
};

export default Dashboard;