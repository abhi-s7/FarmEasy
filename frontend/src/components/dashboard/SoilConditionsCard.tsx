import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { fetchSoilData } from "@/lib/mockData";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Droplets, Thermometer, Layers, Activity, Info, Sprout, FlaskConical } from "lucide-react";
import { SoilData } from "@/types/dashboard";

const SoilConditionsCard = () => {
  const { data: soilData, isLoading } = useQuery<SoilData>({
    queryKey: ["soil"],
    queryFn: fetchSoilData,
  });

  if (isLoading || !soilData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="h-full"
      >
        <Card className="h-full p-6 rounded-2xl shadow-md flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-semibold">Soil Conditions</h3>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-400">Loading soil data...</p>
          </div>
        </Card>
      </motion.div>
    );
  }

  const { properties } = soilData;

  // Parse composition data for pie chart
  const compositionData = [
    { name: "Sand", value: parseInt(properties.sandContent), color: "#f59e0b" },
    { name: "Silt", value: parseInt(properties.siltContent), color: "#8b5cf6" },
    { name: "Clay", value: parseInt(properties.clayContent), color: "#ef4444" },
  ];

  // Determine pH status
  const getPhStatus = (pH: number) => {
    if (pH < 6.0) return { text: "Acidic", color: "bg-red-100 text-red-700" };
    if (pH > 7.5) return { text: "Alkaline", color: "bg-blue-100 text-blue-700" };
    return { text: "Optimal", color: "bg-green-100 text-green-700" };
  };

  const phStatus = getPhStatus(properties.pH);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="h-full"
    >
      <Card className="h-full p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-semibold">Soil Conditions</h3>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Info className="w-4 h-4" />
                Full Analysis
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Complete Soil Analysis</DialogTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Soil Series: {properties.soilSeries} | Location: {soilData.pincode}
                </p>
              </DialogHeader>
              
              <div className="mt-6 space-y-6">
                {/* Composition Chart */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-4 text-center">Soil Composition</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={compositionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {compositionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* All 6 Properties Grid - Detailed View */}
                <div className="grid grid-cols-2 gap-4">
                  {/* pH Level */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <FlaskConical className="w-5 h-5 text-blue-600" />
                      <p className="text-xs font-semibold text-blue-900">pH Level</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-900">{properties.pH}</p>
                    <Badge className={`mt-2 text-xs ${phStatus.color}`}>
                      {phStatus.text}
                    </Badge>
                  </div>

                  {/* Texture */}
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Layers className="w-5 h-5 text-amber-600" />
                      <p className="text-xs font-semibold text-amber-900">Texture</p>
                    </div>
                    <p className="text-xl font-bold text-amber-900">{properties.texture}</p>
                    <p className="text-xs text-amber-700 mt-1">Ideal for crops</p>
                  </div>

                  {/* Drainage */}
                  <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-4 rounded-xl border border-cyan-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Droplets className="w-5 h-5 text-cyan-600" />
                      <p className="text-xs font-semibold text-cyan-900">Drainage</p>
                    </div>
                    <p className="text-lg font-bold text-cyan-900">{properties.drainage}</p>
                    <p className="text-xs text-cyan-700 mt-1">Water retention capacity</p>
                  </div>

                  {/* Organic Matter */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Sprout className="w-5 h-5 text-green-600" />
                      <p className="text-xs font-semibold text-green-900">Organic Matter</p>
                    </div>
                    <p className="text-2xl font-bold text-green-900">{properties.organicMatter}</p>
                    <p className="text-xs text-green-700 mt-1">Nutrient content level</p>
                  </div>

                  {/* Permeability */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-5 h-5 text-purple-600" />
                      <p className="text-xs font-semibold text-purple-900">Permeability</p>
                    </div>
                    <p className="text-lg font-bold text-purple-900">{properties.permeability}</p>
                    <p className="text-xs text-purple-700 mt-1">Water flow rate</p>
                  </div>

                  {/* Soil Series */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Thermometer className="w-5 h-5 text-gray-600" />
                      <p className="text-xs font-semibold text-gray-900">Soil Series</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{properties.soilSeries}</p>
                    <p className="text-xs text-gray-700 mt-1">USDA Classification</p>
                  </div>
                </div>

                {/* Parent Material */}
                <div className="p-4 bg-gray-100 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 mb-1">Parent Material</p>
                  <p className="text-gray-900">{properties.parentMaterial}</p>
                </div>

                {/* Key Insights */}
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">Key Insights</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{soilData.keyInsights}</p>
                </div>

                {/* Sources */}
                {soilData.sources && soilData.sources.length > 0 && (
                  <div className="pt-4 border-t">
                    <p className="text-xs text-gray-500 font-medium mb-2">Data Sources:</p>
                    <div className="space-y-1">
                      {soilData.sources.map((source, index) => (
                        <a
                          key={index}
                          href={source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline block truncate"
                        >
                          {source}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quick Summary - Top 4 Metrics */}
        <div className="grid grid-cols-2 gap-3">
          {/* pH Level */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <FlaskConical className="w-5 h-5 text-blue-600" />
              <p className="text-xs font-semibold text-blue-900">pH Level</p>
            </div>
            <p className="text-2xl font-bold text-blue-900">{properties.pH}</p>
            <Badge className={`mt-2 text-xs ${phStatus.color}`}>
              {phStatus.text}
            </Badge>
          </div>

          {/* Texture */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-5 h-5 text-amber-600" />
              <p className="text-xs font-semibold text-amber-900">Texture</p>
            </div>
            <p className="text-xl font-bold text-amber-900">{properties.texture}</p>
            <p className="text-xs text-amber-700 mt-1">Well-suited soil</p>
          </div>

          {/* Drainage */}
          <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-4 rounded-xl border border-cyan-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-5 h-5 text-cyan-600" />
              <p className="text-xs font-semibold text-cyan-900">Drainage</p>
            </div>
            <p className="text-lg font-bold text-cyan-900">{properties.drainage}</p>
            <p className="text-xs text-cyan-700 mt-1">Water retention</p>
          </div>

          {/* Organic Matter */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <Sprout className="w-5 h-5 text-green-600" />
              <p className="text-xs font-semibold text-green-900">Organic Matter</p>
            </div>
            <p className="text-2xl font-bold text-green-900">{properties.organicMatter}</p>
            <p className="text-xs text-green-700 mt-1">Nutrient rich</p>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          View complete soil profile including permeability & composition
        </p>
      </Card>
    </motion.div>
  );
};

export default SoilConditionsCard;
