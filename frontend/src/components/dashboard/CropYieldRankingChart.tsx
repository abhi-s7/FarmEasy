import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { fetchRevenueData } from "@/lib/mockData";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp } from "lucide-react";

const CropYieldRankingChart = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["revenue"],
    queryFn: fetchRevenueData,
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-gray-700" />
          <h3 className="text-lg font-semibold">Highest Yield Crops</h3>
        </div>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No data available
        </div>
      </Card>
    );
  }

  // Calculate total revenue by crop
  const cropTotals = data.reduce((acc: Record<string, number>, item) => {
    if (!acc[item.crop]) {
      acc[item.crop] = 0;
    }
    acc[item.crop] += item.revenue;
    return acc;
  }, {});

  // Convert to array and sort by total revenue descending
  const rankedCrops = Object.entries(cropTotals)
    .map(([crop, total]) => ({
      crop,
      total: Math.round(total),
    }))
    .sort((a, b) => b.total - a.total);

  // Color mapping for crops
  const cropColors: Record<string, string> = {
    Wheat: "#f59e0b",
    Corn: "#10b981",
    Soybeans: "#3b82f6",
    Rice: "#8b5cf6",
    Cotton: "#ec4899",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-gray-700" />
          <h3 className="text-lg font-semibold">Highest Yield Crops</h3>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={rankedCrops} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="crop" type="category" width={80} />
            <Tooltip
              content={({ payload }) => {
                if (payload && payload[0]) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border rounded shadow-lg">
                      <p className="font-semibold">{data.crop}</p>
                      <p className="text-sm">Total Revenue: ${data.total.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Annual total across all months
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="total" radius={[0, 8, 8, 0]}>
              {rankedCrops.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={cropColors[entry.crop] || "#6b7280"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Ranking Summary */}
        <div className="mt-4 pt-4 border-t">
          <div className="space-y-2">
            {rankedCrops.map((crop, index) => (
              <div key={crop.crop} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-500">#{index + 1}</span>
                  <span className="font-medium">{crop.crop}</span>
                </div>
                <span className="text-gray-600">${crop.total.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default CropYieldRankingChart;