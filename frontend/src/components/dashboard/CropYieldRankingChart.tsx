import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { fetchSuitability, fetchProfile } from "@/lib/mockData";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, Info, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Suitability, Profile } from "@/types/dashboard";

const CropYieldRankingChart = () => {
  const { data: suitabilityData, isLoading: suitabilityLoading } = useQuery<Suitability[]>({
    queryKey: ["suitability"],
    queryFn: () => fetchSuitability(),
  });

  const { data: profile, isLoading: profileLoading } = useQuery<Profile>({
    queryKey: ["profile"],
    queryFn: fetchProfile,
  });

  const [showAllTopCrops, setShowAllTopCrops] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<any>(null);

  const isLoading = suitabilityLoading || profileLoading;

  if (isLoading) {
    return (
      <Card className="p-6 h-full flex flex-col">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="flex-1 w-full" />
      </Card>
    );
  }

  if (!suitabilityData || suitabilityData.length === 0 || !profile) {
    return (
      <Card className="p-6 h-full flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-gray-700" />
          <h3 className="text-lg font-semibold">Top Crops vs Your Crops</h3>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500">
          No data available
        </div>
      </Card>
    );
  }

  // Get top regional crops from bright data
  const topRegionalCrops = showAllTopCrops 
    ? suitabilityData
    : suitabilityData.slice(0, 3);
  
  // Get user's crops data - if crop not in suitability data, add it with default scores
  const userCropsData = profile.crops.map(cropName => {
    const existingCrop = suitabilityData.find(c => c.crop === cropName);
    if (existingCrop) {
      return existingCrop;
    }
    // If crop not found, create a default entry
    return {
      crop: cropName,
      score: 70, // Default score
      subScores: { soil: 70, climate: 70, water: 70, market: 70 }
    };
  });

  // Color mapping
  const getTopCropColor = (index: number) => {
    const colors = ["#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#06b6d4"];
    return colors[index % colors.length];
  };

  const getUserCropColor = (index: number) => {
    const colors = ["#f59e0b", "#ef4444", "#f97316", "#eab308", "#84cc16"];
    return colors[index % colors.length];
  };

  const handleCropClick = (crop: any) => {
    setSelectedCrop(crop);
    setDialogOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="h-full"
    >
      <Card className="p-6 h-full flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-gray-700" />
          <h3 className="text-lg font-semibold">Top Crops vs Your Crops</h3>
        </div>
        
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side: Top Regional Crops */}
          <div className="flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-700">Top Crops for Your Area</h4>
              {suitabilityData.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllTopCrops(!showAllTopCrops)}
                  className="h-7 text-xs"
                >
                  {showAllTopCrops ? (
                    <>
                      <ChevronUp className="w-3 h-3 mr-1" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3 mr-1" />
                      Show All ({suitabilityData.length})
                    </>
                  )}
                </Button>
              )}
            </div>
            
            <div className="overflow-y-auto h-[180px]">
              <div style={{ height: `${topRegionalCrops.length * 60}px`, minHeight: '180px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topRegionalCrops} layout="vertical" margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="crop" type="category" width={80} tick={{ fontSize: 12 }} />
                    <Tooltip
                      content={({ payload }) => {
                        if (payload && payload[0]) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border rounded shadow-lg">
                              <p className="font-semibold">{data.crop}</p>
                              <p className="text-sm">Score: {data.score}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {data.profitability || "Click for details"}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="score" radius={[0, 8, 8, 0]} onClick={(data) => handleCropClick(data)}>
                      {topRegionalCrops.map((entry, index) => (
                        <Cell 
                          key={`cell-top-${index}`} 
                          fill={getTopCropColor(index)}
                          className="cursor-pointer hover:opacity-80"
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Ranking List for Top Crops */}
            <div className="mt-3 pt-3 border-t max-h-32 overflow-y-auto">
              <div className="space-y-1.5">
                {topRegionalCrops.map((crop, index) => (
                  <div 
                    key={crop.crop} 
                    className="flex items-center justify-between text-xs cursor-pointer hover:bg-gray-50 p-1.5 rounded"
                    onClick={() => handleCropClick(crop)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-500 w-6">#{index + 1}</span>
                      <span className="font-medium">{crop.crop}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600">{crop.score}</span>
                      <Info className="w-3 h-3 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side: User's Crops */}
          <div className="flex flex-col min-h-0 border-l pl-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Your Crops</h4>
            
            {userCropsData.length > 0 ? (
              <>
                <div className="overflow-y-auto h-[180px]">
                  <div style={{ height: `${userCropsData.length * 60}px`, minHeight: '180px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={userCropsData} layout="vertical" margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis dataKey="crop" type="category" width={80} tick={{ fontSize: 12 }} />
                        <Tooltip
                          content={({ payload }) => {
                            if (payload && payload[0]) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white p-3 border rounded shadow-lg">
                                  <p className="font-semibold">{data.crop}</p>
                                  <p className="text-sm">Score: {data.score}</p>
                                  <p className="text-xs text-amber-600 mt-1">Your Crop</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="score" radius={[0, 8, 8, 0]} onClick={(data) => handleCropClick(data)}>
                          {userCropsData.map((entry, index) => (
                            <Cell 
                              key={`cell-user-${index}`} 
                              fill={getUserCropColor(index)}
                              className="cursor-pointer hover:opacity-80"
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Ranking List for User Crops */}
                <div className="mt-3 pt-3 border-t">
                  <div className="space-y-1.5">
                    {userCropsData.map((crop, index) => (
                      <div 
                        key={crop.crop} 
                        className="flex items-center justify-between text-xs cursor-pointer hover:bg-amber-50 p-1.5 rounded"
                        onClick={() => handleCropClick(crop)}
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded" 
                            style={{ backgroundColor: getUserCropColor(index) }}
                          />
                          <span className="font-medium text-amber-700">{crop.crop}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-600">{crop.score}</span>
                          <Info className="w-3 h-3 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                No crops selected
              </div>
            )}
          </div>
        </div>

        {/* Details Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {selectedCrop?.crop}
                {userCropsData.find(c => c.crop === selectedCrop?.crop) && (
                  <span className="text-amber-600 ml-2 text-lg">(Your Crop)</span>
                )}
              </DialogTitle>
            </DialogHeader>
            
            {selectedCrop && (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Suitability Score</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedCrop.score}</p>
                  </div>
                  {selectedCrop.profitability && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Profitability</p>
                      <p className="text-lg font-semibold text-gray-900">{selectedCrop.profitability}</p>
                    </div>
                  )}
                </div>

                {selectedCrop.yield_estimate && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900 mb-1">Yield Estimate</p>
                    <p className="text-gray-700">{selectedCrop.yield_estimate}</p>
                  </div>
                )}

                {selectedCrop.reason && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm font-semibold text-green-900 mb-2">Why This Crop?</p>
                    <p className="text-gray-700 leading-relaxed">{selectedCrop.reason}</p>
                  </div>
                )}

                {selectedCrop.suitability_factors && (
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <p className="text-sm font-semibold text-amber-900 mb-2">Suitability Factors</p>
                    <p className="text-gray-700 leading-relaxed">{selectedCrop.suitability_factors}</p>
                  </div>
                )}

                {selectedCrop.subScores && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-semibold text-gray-900 mb-3">Detailed Scores</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-600">Soil</p>
                        <p className="text-lg font-semibold">{selectedCrop.subScores.soil}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Climate</p>
                        <p className="text-lg font-semibold">{selectedCrop.subScores.climate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Water</p>
                        <p className="text-lg font-semibold">{selectedCrop.subScores.water}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Market</p>
                        <p className="text-lg font-semibold">{selectedCrop.subScores.market}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </Card>
    </motion.div>
  );
};

export default CropYieldRankingChart;
