import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { fetchRevenueData } from "@/lib/mockData";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const RevenueChart = () => {
  const { t } = useTranslation();
  
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
        <h3 className="text-lg font-semibold mb-4">{t("dashboard.revenueChart")}</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          {t("common.noData")}
        </div>
      </Card>
    );
  }

  // Aggregate data by month
  const aggregatedData = data.reduce((acc: any[], item) => {
    const existing = acc.find((d) => d.month === item.month);
    if (existing) {
      existing[item.crop] = item.revenue;
    } else {
      acc.push({
        month: item.month,
        [item.crop]: item.revenue,
      });
    }
    return acc;
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t("dashboard.revenueChart")}</h3>
        
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={aggregatedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip
              content={({ payload, label }) => {
                if (payload && payload.length > 0) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border rounded shadow-lg">
                      <p className="font-semibold mb-2">{label}</p>
                      {Object.keys(data)
                        .filter((key) => key !== "month")
                        .map((crop) => (
                          <p key={crop} className="text-sm">
                            {crop}: ${data[crop].toLocaleString()}
                          </p>
                        ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Bar dataKey="Wheat" fill="#f59e0b" />
            <Bar dataKey="Corn" fill="#10b981" />
            <Bar dataKey="Soybeans" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </motion.div>
  );
};

export default RevenueChart;