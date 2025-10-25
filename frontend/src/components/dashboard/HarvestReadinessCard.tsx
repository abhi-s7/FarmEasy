import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Wheat, Calendar, Package } from "lucide-react";

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Card className="p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-2 mb-4">
          <Wheat className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold">Harvest Readiness</h3>
        </div>

        <div className="flex items-center gap-6 mb-4">
          <div className="relative w-32 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
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
                <p className="text-xs text-gray-500">Mature</p>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Harvest Window</p>
                <p className="text-sm font-medium">{data.harvestWindow}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Package className="w-4 h-4 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Storage Tip</p>
                <p className="text-sm font-medium">{data.storageTip}</p>
              </div>
            </div>
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              View Full Advisory
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Harvest & Storage Advisory</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <h4 className="font-semibold mb-2">Current Status:</h4>
                <p className="text-sm text-gray-700">{data.recommendation}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Pre-Harvest Checklist:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>Check moisture content daily (target: 13-15%)</li>
                  <li>Inspect equipment and ensure proper calibration</li>
                  <li>Prepare storage facilities and ensure cleanliness</li>
                  <li>Monitor weather forecasts for optimal harvest window</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Post-Harvest Storage:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>Dry grain to recommended moisture levels immediately</li>
                  <li>Store in well-ventilated, pest-free facilities</li>
                  <li>Monitor temperature and humidity regularly</li>
                  <li>Implement proper pest management protocols</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Quality Preservation:</h4>
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