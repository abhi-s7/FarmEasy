import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { fetchInsights } from "@/lib/mockData";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";

const InsightsList = () => {
  const { t } = useTranslation();
  
  const { data, isLoading } = useQuery({
    queryKey: ["insights"],
    queryFn: fetchInsights,
  });

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case "critical":
        return { icon: AlertCircle, color: "bg-red-500", textColor: "text-red-700", bgColor: "bg-red-50" };
      case "warn":
        return { icon: AlertTriangle, color: "bg-yellow-500", textColor: "text-yellow-700", bgColor: "bg-yellow-50" };
      default:
        return { icon: Info, color: "bg-blue-500", textColor: "text-blue-700", bgColor: "bg-blue-50" };
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t("dashboard.insights")}</h3>
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
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t("dashboard.insights")}</h3>
        
        <div className="space-y-3">
          {data.map((insight, index) => {
            const config = getSeverityConfig(insight.severity);
            const Icon = config.icon;
            
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${config.bgColor}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${config.color}`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium ${config.textColor}`}>{insight.text}</p>
                      <Badge variant={insight.severity === "critical" ? "destructive" : "secondary"} className="text-xs">
                        {insight.severity}
                      </Badge>
                    </div>
                    {insight.action && (
                      <Button
                        variant="link"
                        size="sm"
                        className={`mt-2 p-0 h-auto ${config.textColor}`}
                        onClick={() => insight.action?.href && window.open(insight.action.href, "_blank")}
                      >
                        {insight.action.label} →
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
};

export default InsightsList;