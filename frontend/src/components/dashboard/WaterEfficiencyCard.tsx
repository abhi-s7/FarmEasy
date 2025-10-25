import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Droplets } from "lucide-react";

const WaterEfficiencyCard = () => {
  // Simple mock data - no external dependencies
  const data = {
    actual: 4200,
    optimal: 3800,
    efficiencyPct: 90,
    insight: "Water usage is within acceptable range. Consider optimizing irrigation schedule.",
  };

  const getStatusColor = (efficiency: number) => {
    if (efficiency >= 95) return { bg: "bg-green-100", text: "text-green-700", bar: "#10b981" };
    if (efficiency >= 85) return { bg: "bg-amber-100", text: "text-amber-700", bar: "#f59e0b" };
    return { bg: "bg-red-100", text: "text-red-700", bar: "#ef4444" };
  };

  const colors = getStatusColor(data.efficiencyPct);
  const chartData = [
    { name: "Actual", value: data.actual, color: colors.bar },
    { name: "Optimal", value: data.optimal, color: "#3b82f6" },
  ];

  const status = data.efficiencyPct >= 95 ? "Excellent" : data.efficiencyPct >= 85 ? "Good" : "Needs Improvement";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card className="p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Water Usage Efficiency</h3>
          </div>
          <Badge className={`${colors.bg} ${colors.text}`}>
            {status}
          </Badge>
        </div>

        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-bold">{data.efficiencyPct}%</span>
            <span className="text-sm text-gray-500">efficiency</span>
          </div>
          <p className="text-xs text-gray-500">
            Formula: (Optimal / Actual) × 100
          </p>
        </div>

        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis label={{ value: "L/ha", angle: -90, position: "insideLeft" }} />
            <Tooltip
              content={({ payload }) => {
                if (payload && payload[0]) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border rounded shadow-lg">
                      <p className="font-semibold">{data.name}</p>
                      <p className="text-sm">{data.value.toLocaleString()} L/ha</p>
                      {data.name === "Actual" && (
                        <p className="text-xs text-gray-500 mt-1">
                          Current water usage per hectare
                        </p>
                      )}
                      {data.name === "Optimal" && (
                        <p className="text-xs text-gray-500 mt-1">
                          Recommended usage for crop type
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} aria-label="Water usage comparison">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <p className="text-sm text-gray-600 mt-4">{data.insight}</p>
      </Card>
    </motion.div>
  );
};

export default WaterEfficiencyCard;