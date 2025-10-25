import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cloud, Sun, CloudRain, Droplets, Wind, Settings } from "lucide-react";
import { OnboardingData } from "./Onboarding";
import ChatInterface from "@/components/ChatInterface";

const Dashboard = () => {
  const navigate = useNavigate();
  const [farmData, setFarmData] = useState<OnboardingData | null>(null);
  const [weather, setWeather] = useState({
    temp: 72,
    condition: "Partly Cloudy",
    humidity: 65,
    windSpeed: 8,
    icon: "partly-cloudy"
  });

  useEffect(() => {
    const storedData = localStorage.getItem("farmSetup");
    if (storedData) {
      setFarmData(JSON.parse(storedData));
      simulateWeather();
    } else {
      navigate("/onboarding");
    }
  }, [navigate]);

  const simulateWeather = () => {
    const conditions = [
      { temp: 75, condition: "Sunny", humidity: 55, windSpeed: 5, icon: "sunny" },
      { temp: 68, condition: "Partly Cloudy", humidity: 65, windSpeed: 8, icon: "partly-cloudy" },
      { temp: 62, condition: "Rainy", humidity: 85, windSpeed: 12, icon: "rainy" },
      { temp: 70, condition: "Cloudy", humidity: 70, windSpeed: 10, icon: "cloudy" },
    ];
    const randomWeather = conditions[Math.floor(Math.random() * conditions.length)];
    setWeather(randomWeather);
  };

  const getWeatherIcon = () => {
    switch (weather.icon) {
      case "sunny":
        return <Sun className="w-10 h-10 text-yellow-500" />;
      case "rainy":
        return <CloudRain className="w-10 h-10 text-blue-500" />;
      case "cloudy":
        return <Cloud className="w-10 h-10 text-gray-500" />;
      default:
        return <Cloud className="w-10 h-10 text-gray-400" />;
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {farmData.name}! 👋
              </h1>
              <p className="text-sm text-gray-600">{farmData.county}</p>
            </div>
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

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Farm Overview */}
          <div className="lg:col-span-1 space-y-4">
            {/* Weather Card */}
            <Card className="p-5 border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-blue-50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Weather</h3>
                  <p className="text-2xl font-bold text-gray-900">{weather.temp}°F</p>
                  <p className="text-sm text-gray-700">{weather.condition}</p>
                </div>
                <div className="bg-white p-3 rounded-full shadow-md">
                  {getWeatherIcon()}
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between text-gray-600">
                  <span className="flex items-center gap-2">
                    <Droplets className="w-4 h-4" />
                    Humidity
                  </span>
                  <span className="font-medium">{weather.humidity}%</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span className="flex items-center gap-2">
                    <Wind className="w-4 h-4" />
                    Wind
                  </span>
                  <span className="font-medium">{weather.windSpeed} mph</span>
                </div>
              </div>
            </Card>

            {/* Farm Summary Card */}
            <Card className="p-5 border-2 border-emerald-100">
              <h3 className="font-semibold text-gray-900 mb-4">Farm Summary</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs mb-1">Crops</p>
                  <div className="flex flex-wrap gap-1">
                    {farmData.preferredCrops.slice(0, 3).map((crop) => (
                      <span
                        key={crop}
                        className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs"
                      >
                        {crop}
                      </span>
                    ))}
                    {farmData.preferredCrops.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{farmData.preferredCrops.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Farm Size</p>
                  <p className="font-medium text-gray-900">{farmData.farmSize}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Soil Type</p>
                  <p className="font-medium text-gray-900">{farmData.soilType}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Irrigation</p>
                  <p className="font-medium text-gray-900">{farmData.irrigationType}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content - Chat Interface */}
          <div className="lg:col-span-2">
            <ChatInterface farmData={farmData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;