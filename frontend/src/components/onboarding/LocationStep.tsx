import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation } from "lucide-react";
import { OnboardingData } from "@/pages/Onboarding";
import { showSuccess, showError } from "@/utils/toast";

interface LocationStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const LocationStep = ({ data, updateData, onNext, onBack }: LocationStepProps) => {
  const [loading, setLoading] = useState(false);
  const [locationMethod, setLocationMethod] = useState<"gps" | "manual" | null>(null);

  const handleGPSLocation = () => {
    setLoading(true);
    setLocationMethod("gps");
    
    // Simulate GPS location (frontend-only - no real geolocation)
    setTimeout(() => {
      const mockLat = 40.7128 + (Math.random() - 0.5) * 2;
      const mockLon = -74.0060 + (Math.random() - 0.5) * 2;
      const mockCounty = "Sample County";
      
      updateData({
        lat: mockLat,
        lon: mockLon,
        county: mockCounty,
      });
      
      setLoading(false);
      showSuccess("Location detected successfully!");
    }, 1500);
  };

  const handleManualLocation = () => {
    setLocationMethod("manual");
    
    // Simulate manual location selection
    const mockLat = 39.8283 + (Math.random() - 0.5) * 2;
    const mockLon = -98.5795 + (Math.random() - 0.5) * 2;
    const mockCounty = "Manual County";
    
    updateData({
      lat: mockLat,
      lon: mockLon,
      county: mockCounty,
    });
    
    showSuccess("Location set successfully!");
  };

  const canProceed = data.lat !== null && data.lon !== null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          📍 Where is your farm located?
        </h2>
        <p className="text-gray-600">
          We'll use this to provide location-specific farming advice and weather updates.
        </p>
      </div>

      <div className="space-y-4">
        {/* GPS Option */}
        <button
          onClick={handleGPSLocation}
          disabled={loading}
          className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left"
        >
          <div className="flex items-start gap-4">
            <div className="bg-emerald-100 p-3 rounded-full">
              <Navigation className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">Use GPS Location</h3>
              <p className="text-gray-600 text-sm">
                Automatically detect your current location
              </p>
            </div>
          </div>
        </button>

        {/* Manual Option */}
        <button
          onClick={handleManualLocation}
          disabled={loading}
          className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left"
        >
          <div className="flex items-start gap-4">
            <div className="bg-amber-100 p-3 rounded-full">
              <MapPin className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">Enter Manually</h3>
              <p className="text-gray-600 text-sm">
                Select your farm location on the map
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Location Preview */}
      {canProceed && (
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <h4 className="font-semibold text-emerald-900">Location Set</h4>
          </div>
          <div className="text-sm text-emerald-800 space-y-1">
            <p>Latitude: {data.lat?.toFixed(4)}</p>
            <p>Longitude: {data.lon?.toFixed(4)}</p>
            <p>County: {data.county}</p>
          </div>
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
          onClick={onNext}
          disabled={!canProceed || loading}
          size="lg"
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-8"
        >
          {loading ? "Detecting..." : "Next"}
        </Button>
      </div>
    </div>
  );
};

export default LocationStep;