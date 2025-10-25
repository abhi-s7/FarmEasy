import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { fetchRainfallData } from "@/lib/mockData";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const RainYieldChart = () => {
  const { t } = useTranslation();
  
  const { data, isLoading } = useQuery({
    queryKey: ["rainfall"],
    queryFn: fetchRainfallData,
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
        <h3 className="text-lg font-semibold mb-4">{t("dashboard.rainfallChart")}</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          {t("common.noData")}
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t("dashboard.rainfallChart")}</h3>
        
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" label={{ value: "Rainfall (mm)", angle: -90, position: "insideLeft" }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: "Yield Index", angle: 90, position: "insideRight" }} />
            <Tooltip
              content={({ payload, label }) => {
                if (payload && payload.length > 0) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border rounded shadow-lg">
                      <p className="font-semibold mb-2">{label}</p>
                      <p className="text-sm">Rainfall: {data.mm} mm</p>
                      <p className="text-sm">Yield Index: {data.yieldIndex}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {data.mm > 100
                          ? "High rainfall may increase yield potential"
                          : "Moderate rainfall, monitor irrigation needs"}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="mm" fill="#3b82f6" name="Rainfall (mm)" />
            <Line yAxisId="right" type="monotone" dataKey="yieldIndex" stroke="#10b981" strokeWidth={2} name="Yield Index" />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>
    </motion.div>
  );
};

export default RainYieldChart;