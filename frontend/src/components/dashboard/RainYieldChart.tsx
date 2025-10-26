import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { fetchRainfallData } from "@/lib/mockData";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Info } from "lucide-react";
import { RainfallData } from "@/types/dashboard";

const RainYieldChart = () => {
  const { t } = useTranslation();
  
  const { data, isLoading } = useQuery<RainfallData>({
    queryKey: ["rainfall"],
    queryFn: fetchRainfallData,
  });

  if (isLoading) {
    return (
      <Card className="p-6 h-full flex flex-col">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="flex-1 w-full" />
      </Card>
    );
  }

  if (!data || !data.months || data.months.length === 0) {
    return (
      <Card className="p-6 h-full flex flex-col">
        <h3 className="text-lg font-semibold mb-4">{t("dashboard.rainfallChart")}</h3>
        <div className="flex-1 flex items-center justify-center text-gray-500">
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
      className="h-full"
    >
      <Card className="p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{t("dashboard.rainfallChart")}</h3>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Info className="w-4 h-4" />
                Key Findings
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[70vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Rainfall Analysis - Key Findings</DialogTitle>
              </DialogHeader>
              <div className="mt-4 space-y-3">
                {data.keyFindings.map((finding, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{finding}</p>
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.months}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis label={{ value: "Rainfall (mm)", angle: -90, position: "insideLeft" }} />
              <Tooltip
                content={({ payload, label }) => {
                  if (payload && payload.length > 0) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border rounded shadow-lg">
                        <p className="font-semibold mb-2">{label}</p>
                        <p className="text-sm">Rainfall: {data.mm} mm</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {data.mm > 100
                            ? "High rainfall recorded"
                            : "Moderate rainfall, monitor irrigation needs"}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar dataKey="mm" fill="#3b82f6" name="Rainfall (mm)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  );
};

export default RainYieldChart;