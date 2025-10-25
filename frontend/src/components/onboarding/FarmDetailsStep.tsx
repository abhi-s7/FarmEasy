import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { OnboardingData } from "@/pages/Onboarding";
import { showError } from "@/utils/toast";

interface FarmDetailsStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const SOIL_TYPES = ["Clay", "Sandy", "Loam", "Silt", "Peat", "Chalk"];
const IRRIGATION_METHODS = ["Drip", "Sprinkler", "Flood", "Rainfed", "Center Pivot"];

const FarmDetailsStep = ({ data, updateData, onNext, onBack }: FarmDetailsStepProps) => {
  const handleNext = () => {
    if (!data.soilType || !data.irrigationType || !data.farmSize) {
      showError("Please fill in all farm details");
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🚜 Tell us about your farm
        </h2>
        <p className="text-gray-600">
          These details help us provide tailored farming advice.
        </p>
      </div>

      <div className="space-y-6">
        {/* Soil Type */}
        <div className="space-y-2">
          <Label htmlFor="soilType" className="text-base font-semibold">
            Soil Type
          </Label>
          <Select
            value={data.soilType}
            onValueChange={(value) => updateData({ soilType: value })}
          >
            <SelectTrigger className="h-14 text-base">
              <SelectValue placeholder="Select your soil type" />
            </SelectTrigger>
            <SelectContent>
              {SOIL_TYPES.map((type) => (
                <SelectItem key={type} value={type} className="text-base py-3">
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Irrigation Method */}
        <div className="space-y-2">
          <Label htmlFor="irrigationType" className="text-base font-semibold">
            Irrigation Method
          </Label>
          <Select
            value={data.irrigationType}
            onValueChange={(value) => updateData({ irrigationType: value })}
          >
            <SelectTrigger className="h-14 text-base">
              <SelectValue placeholder="Select irrigation method" />
            </SelectTrigger>
            <SelectContent>
              {IRRIGATION_METHODS.map((method) => (
                <SelectItem key={method} value={method} className="text-base py-3">
                  {method}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Farm Size */}
        <div className="space-y-2">
          <Label htmlFor="farmSize" className="text-base font-semibold">
            Farm Size
          </Label>
          <div className="flex gap-3">
            <Input
              id="farmSize"
              type="text"
              placeholder="e.g., 50"
              value={data.farmSize.replace(/[^0-9.]/g, "")}
              onChange={(e) => {
                const value = e.target.value;
                updateData({ farmSize: value ? `${value} acres` : "" });
              }}
              className="h-14 text-base flex-1"
            />
            <Select
              value={data.farmSize.includes("hectares") ? "hectares" : "acres"}
              onValueChange={(unit) => {
                const numValue = data.farmSize.replace(/[^0-9.]/g, "");
                updateData({ farmSize: numValue ? `${numValue} ${unit}` : "" });
              }}
            >
              <SelectTrigger className="h-14 text-base w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="acres" className="text-base">Acres</SelectItem>
                <SelectItem value="hectares" className="text-base">Hectares</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          onClick={onBack}
          variant="outline"
          size="lg"
          className="px-8"
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          size="lg"
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-8"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default FarmDetailsStep;