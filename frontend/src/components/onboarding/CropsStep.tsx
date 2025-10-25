import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OnboardingData } from "@/pages/Onboarding";
import { showError } from "@/utils/toast";

interface CropsStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const AVAILABLE_CROPS = [
  "Wheat",
  "Rice",
  "Corn",
  "Soybeans",
  "Cotton",
  "Tomatoes",
  "Potatoes",
  "Lettuce",
  "Carrots",
  "Onions",
  "Peppers",
  "Cucumbers",
  "Beans",
  "Peas",
  "Cabbage",
  "Spinach",
];

const CropsStep = ({ data, updateData, onNext, onBack }: CropsStepProps) => {
  const toggleCrop = (crop: string) => {
    const currentCrops = data.preferredCrops;
    const newCrops = currentCrops.includes(crop)
      ? currentCrops.filter((c) => c !== crop)
      : [...currentCrops, crop];
    
    updateData({ preferredCrops: newCrops });
  };

  const handleNext = () => {
    if (data.preferredCrops.length === 0) {
      showError("Please select at least one crop");
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🌾 What crops do you grow?
        </h2>
        <p className="text-gray-600">
          Select all the crops you typically grow on your farm.
        </p>
      </div>

      {/* Crop Selection */}
      <div className="flex flex-wrap gap-3">
        {AVAILABLE_CROPS.map((crop) => {
          const isSelected = data.preferredCrops.includes(crop);
          return (
            <button
              key={crop}
              onClick={() => toggleCrop(crop)}
              className={`px-6 py-3 rounded-full text-base font-medium transition-all border-2 ${
                isSelected
                  ? "bg-emerald-500 text-white border-emerald-500 scale-105"
                  : "bg-white text-gray-700 border-gray-300 hover:border-emerald-300 hover:bg-emerald-50"
              }`}
            >
              {crop}
            </button>
          );
        })}
      </div>

      {/* Selected Count */}
      {data.preferredCrops.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
          <p className="text-amber-900 font-medium">
            {data.preferredCrops.length} crop{data.preferredCrops.length !== 1 ? "s" : ""} selected
          </p>
        </div>
      )}

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

export default CropsStep;