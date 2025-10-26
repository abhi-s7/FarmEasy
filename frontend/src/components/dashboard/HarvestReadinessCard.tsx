import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Wheat, Calendar, Package, CheckCircle } from "lucide-react";

const HarvestReadinessCard = () => {
  // Simple mock data - no external dependencies
  const data = {
    maturityPct: 85,
    harvestWindow: "2-3 weeks",
    storageTip: "Keep dry, 13-15% moisture",
    recommendation: "Crop is approaching maturity. Begin preparing harvest equipment and storage facilities.",
  };

  const chartData = [
    { name: "Maturity", value: data.maturityPct },
    { name: "Remaining", value: 100 - data.maturityPct },
  ];

  const getColor = (pct: number) => {
    if (pct >= 90) return "#10b981";
    if (pct >= 75) return "#f59e0b";
    return "#3b82f6";
  };

  const getStatus = (pct: number) => {
    if (pct >= 90) return { text: "Ready", color: "bg-green-100 text-green-700" };
    if (pct >= 75) return { text: "Soon", color: "bg-amber-100 text-amber-700" };
    return { text: "Growing", color: "bg-blue-100 text-blue-700" };
  };

  const status = getStatus(data.maturityPct);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="h-full"
    >
      <Card className="h-full p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wheat className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold">Harvest Readiness</h3>
          </div>
          <Badge className={status.color}>
            {status.text}
          </Badge>
        </div>

        {/* Main Content - Gauge and Details */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-6 mb-6">
            {/* Maturity Gauge */}
            <div className="relative w-28 h-28 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    aria-label={`Crop maturity at ${data.maturityPct}%`}
                  >
                    <Cell fill={getColor(data.maturityPct)} />
                    <Cell fill="#e5e7eb" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold">{data.maturityPct}%</p>
                  <p className="text-[10px] text-gray-500 uppercase">Mature</p>
                </div>
              </div>
            </div>

            {/* Key Details */}
            <div className="flex-1 space-y-3">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-blue-700 uppercase font-semibold">Harvest Window</p>
                    <p className="text-sm font-medium text-gray-900">{data.harvestWindow}</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                <div className="flex items-start gap-2">
                  <Package className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-green-700 uppercase font-semibold">Storage Tip</p>
                    <p className="text-sm font-medium text-gray-900">{data.storageTip}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 mb-4">
            <div className="flex gap-2">
              <CheckCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-700 leading-relaxed">{data.recommendation}</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full gap-2">
              <Wheat className="w-4 h-4" />
              View Full Advisory
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Harvest & Storage Advisory</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2 text-blue-900">Current Status:</h4>
                <p className="text-sm text-gray-700">{data.recommendation}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold mb-2 text-green-900">Pre-Harvest Checklist:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>Check moisture content daily (target: 13-15%)</li>
                  <li>Inspect equipment and ensure proper calibration</li>
                  <li>Prepare storage facilities and ensure cleanliness</li>
                  <li>Monitor weather forecasts for optimal harvest window</li>
                </ul>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg">
                <h4 className="font-semibold mb-2 text-amber-900">Post-Harvest Storage:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>Dry grain to recommended moisture levels immediately</li>
                  <li>Store in well-ventilated, pest-free facilities</li>
                  <li>Monitor temperature and humidity regularly</li>
                  <li>Implement proper pest management protocols</li>
                </ul>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold mb-2 text-purple-900">Quality Preservation:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>Avoid mixing different crop varieties or harvest dates</li>
                  <li>Use aeration systems to maintain uniform temperature</li>
                  <li>Conduct regular quality checks for mold or pest damage</li>
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </Card>
    </motion.div>
  );
};

export default HarvestReadinessCard;
