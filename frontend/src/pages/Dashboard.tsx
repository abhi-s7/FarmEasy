import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cloud, Sun, CloudRain, Droplets, Sprout, DollarSign, Settings, MapPin, Waves } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchProfile, fetchKpiData } from "@/lib/mockData";
import { useTranslation } from "react-i18next";
import KpiCard from "@/components/dashboard/KpiCard";
import PestRiskCard from "@/components/dashboard/PestRiskCard";
import SoilConditionsCard from "@/components/dashboard/SoilConditionsCard";
import HarvestReadinessCard from "@/components/dashboard/HarvestReadinessCard";
import CropYieldRankingChart from "@/components/dashboard/CropYieldRankingChart";
import RainYieldChart from "@/components/dashboard/RainYieldChart";
import InsightsList from "@/components/dashboard/InsightsList";
import AssistantFab from "@/components/dashboard/AssistantFab";
import AssistantDrawer from "@/components/dashboard/AssistantDrawer";
import { OnboardingData } from "./Onboarding";
import { getDashboardData } from "@/lib/dashboardData";
import LoadingProgress from "@/components/LoadingProgress";

const Dashboard = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [farmData, setFarmData] = useState<OnboardingData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");
  const [progress, setProgress] = useState(0);
  const [dashboardData, setDashboardData] = useState<any>(null);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
  });

  const { data: kpiData, isLoading: kpiLoading } = useQuery({
    queryKey: ["kpi"],
    queryFn: fetchKpiData,
  });

  useEffect(() => {
    async function loadData() {
      try {
        // First check if cache exists
        const cached = localStorage.getItem("farmData");
        
        if (!cached) {
          // No cache means user hasn't completed onboarding
          console.log('No cached data, redirecting to onboarding');
          navigate("/onboarding");
          return;
        }
        
        // Fetch dashboard data with progress (will use cache if valid)
        const rawData = await getDashboardData((msg, prog) => {
          setLoadingMessage(msg);
          setProgress(prog);
        });
        
        setDashboardData(rawData);
        
        // Check language
        if (rawData?.language) {
          i18n.changeLanguage(rawData.language);
        }
        
        // Small delay to show 100%
        setTimeout(() => {
          setIsLoadingData(false);
        }, 300);
        
      } catch (error: any) {
        console.error('Failed to load dashboard:', error);
        
        // Only redirect if it's a profile error AND no cache exists
        const cached = localStorage.getItem("farmData");
        if (!cached && error.message?.includes('Profile not configured')) {
          navigate("/onboarding");
        } else {
          // If cache exists but fetch failed, still show dashboard with cached data
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              setDashboardData(parsed.rawData);
              setIsLoadingData(false);
            } catch (e) {
              setLoadingMessage("Error loading data");
              setTimeout(() => setIsLoadingData(false), 1000);
            }
          } else {
            setLoadingMessage("Error loading data");
            setTimeout(() => setIsLoadingData(false), 1000);
          }
        }
      }
    }
    
    loadData();
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

  if (isLoadingData) {
    return <LoadingProgress message={loadingMessage} progress={progress} />;
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
            title="Soil pH Level"
            value={kpiData ? `${kpiData.soilpH}` : "--"}
            subtitle="Optimal range: 6.0-7.0"
            icon={Droplets}
            iconColor="bg-emerald-500"
            isLoading={kpiLoading}
          />
          <KpiCard
            title="Soil Drainage"
            value={kpiData?.drainage || "--"}
            subtitle="Water retention capacity"
            icon={Waves}
            iconColor="bg-cyan-500"
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

        {/* Farm Health Insights - Grid */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Farm Health Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            <PestRiskCard />
            <HarvestReadinessCard />
            <SoilConditionsCard />
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-fr">
          <CropYieldRankingChart />
          <RainYieldChart />
          <div className="lg:col-span-2">
            <InsightsList />
          </div>
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