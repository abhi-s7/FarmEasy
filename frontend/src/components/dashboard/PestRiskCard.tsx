import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Bug, AlertTriangle } from "lucide-react";

const PestRiskCard = () => {
  // Simple mock data - no external dependencies
  const data = {
    level: "Medium",
    probability: 45,
    topRisks: ["Aphids", "Leaf Blight", "Stem Borers"],
    insight: "Moderate pest activity detected. Regular monitoring recommended.",
  };

  const getColorByLevel = (level: string) => {
    switch (level) {
      case "Low": return { bg: "bg-green-100", text: "text-green-700", chart: "#10b981" };
      case "Medium": return { bg: "bg-amber-100", text: "text-amber-700", chart: "#f59e0b" };
      case "High": return { bg: "bg-red-100", text: "text-red-700", chart: "#ef4444" };
      default: return { bg: "bg-gray-100", text: "text-gray-700", chart: "#6b7280" };
    }
  };

  const colors = getColorByLevel(data.level);
  const chartData = [
    { name: "Risk", value: data.probability },
    { name: "Safe", value: 100 - data.probability },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-semibold">Pest & Disease Risk</h3>
          </div>
          <Badge className={`${colors.bg} ${colors.text}`}>
            {data.level}
          </Badge>
        </div>

        <div className="flex items-center gap-6 mb-4">
          <div className="relative w-32 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={40}
                  outerRadius={60}
                  dataKey="value"
                  aria-label={`Pest risk gauge showing ${data.probability}% probability`}
                >
                  <Cell fill={colors.chart} />
                  <Cell fill="#e5e7eb" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold">{data.probability}%</p>
                <p className="text-xs text-gray-500">Risk</p>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700 mb-2">Top Threats:</p>
            <div className="space-y-1">
              {data.topRisks.map((risk, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>{risk}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">{data.insight}</p>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              View Recommendations
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pest Management Recommendations</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <h4 className="font-semibold mb-2">Preventive Measures:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>Apply neem-based organic pesticides weekly</li>
                  <li>Maintain proper field sanitation and remove crop residue</li>
                  <li>Use pheromone traps for early detection</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Monitoring Schedule:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>Inspect crops every 3-4 days during high-risk periods</li>
                  <li>Check undersides of leaves for eggs and larvae</li>
                  <li>Document pest sightings in farm log</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Treatment Options:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>Biological control: Release beneficial insects</li>
                  <li>Chemical control: Use approved pesticides as last resort</li>
                  <li>Consult local agricultural extension for specific recommendations</li>
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </Card>
    </motion.div>
  );
};

export default PestRiskCard;