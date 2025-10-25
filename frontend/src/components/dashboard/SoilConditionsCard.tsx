import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Thermometer } from "lucide-react";

const SoilConditionsCard = () => {
  // Generate simple mock data for 24 hours
  const generateMockData = () => {
    const data = [];
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        time: time.getHours() + ":00",
        tempC: 18 + Math.sin(i / 4) * 3 + Math.random() * 2,
        humidity: 55 + Math.cos(i / 3) * 10 + Math.random() * 5,
      });
    }
    return data;
  };

  const chartData = generateMockData();
  const currentData = chartData[chartData.length - 1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold">Soil Conditions (24h)</h3>
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          <Badge className="bg-orange-100 text-orange-700">
            {currentData.tempC.toFixed(1)}°C
          </Badge>
          <Badge className="bg-blue-100 text-blue-700">
            {currentData.humidity.toFixed(0)}% Moisture
          </Badge>
        </div>

        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 10 }}
              interval={5}
            />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip
              content={({ payload, label }) => {
                if (payload && payload.length > 0) {
                  return (
                    <div className="bg-white p-3 border rounded shadow-lg">
                      <p className="font-semibold mb-1">{label}</p>
                      <p className="text-sm text-orange-600">
                        Temperature: {payload[0].value?.toFixed(1)}°C
                      </p>
                      <p className="text-sm text-blue-600">
                        Moisture: {payload[1].value?.toFixed(0)}%
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="tempC" 
              stroke="#f97316" 
              strokeWidth={2}
              name="Temp (°C)"
              dot={false}
              aria-label="Soil temperature over 24 hours"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="humidity" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Moisture (%)"
              dot={false}
              aria-label="Soil moisture over 24 hours"
            />
          </LineChart>
        </ResponsiveContainer>

        <p className="text-sm text-gray-600 mt-4">
          Soil conditions are stable. Temperature and moisture levels are within optimal range for crop growth.
        </p>
      </Card>
    </motion.div>
  );
};

export default SoilConditionsCard;