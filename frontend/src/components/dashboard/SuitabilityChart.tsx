import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { fetchSuitability } from "@/lib/mockData";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";

const SuitabilityChart = () => {
  const { t } = useTranslation();
  const [whatIfEnabled, setWhatIfEnabled] = useState(false);
  
  const { data, isLoading } = useQuery({
    queryKey: ["suitability", whatIfEnabled ? 20 : 0],
    queryFn: () => fetchSuitability(whatIfEnabled ? 20 : undefined),
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
        <h3 className="text-lg font-semibold mb-4">{t("dashboard.suitabilityChart")}</h3>
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
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{t("dashboard.suitabilityChart")}</h3>
          <div className="flex items-center gap-2">
            <Switch
              id="what-if"
              checked={whatIfEnabled}
              onCheckedChange={setWhatIfEnabled}
            />
            <Label htmlFor="what-if" className="text-sm cursor-pointer">
              {t("dashboard.whatIf")} (+20% rainfall)
            </Label>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="crop" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Radar
              name="Suitability"
              dataKey="score"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.6}
            />
            <Tooltip
              content={({ payload }) => {
                if (payload && payload[0]) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border rounded shadow-lg">
                      <p className="font-semibold">{data.crop}</p>
                      <p className="text-sm">Score: {data.score}</p>
                      {data.subScores && (
                        <div className="text-xs mt-2 space-y-1">
                          <p>Soil: {data.subScores.soil}</p>
                          <p>Climate: {data.subScores.climate}</p>
                          <p>Water: {data.subScores.water}</p>
                          <p>Market: {data.subScores.market}</p>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </Card>
    </motion.div>
  );
};

export default SuitabilityChart;