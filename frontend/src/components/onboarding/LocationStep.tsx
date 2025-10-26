import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation, Search } from "lucide-react";
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
  const [cityName, setCityName] = useState("");
  const [searching, setSearching] = useState(false);

  const handleGPSLocation = () => {
    setLoading(true);
    
    // Use real browser geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          
          // Reverse geocode to get location name
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
            );
            const locationData = await response.json();
            const county = locationData.address?.county || locationData.address?.city || locationData.address?.town || "Your Location";
            
            updateData({ lat, lon, county });
            setLocationMethod("gps");
            setLoading(false);
            showSuccess("Location detected successfully!");
          } catch (error) {
            updateData({ lat, lon, county: "Your Location" });
            setLocationMethod("gps");
            setLoading(false);
            showSuccess("Location detected!");
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLoading(false);
          
          // Show specific error messages based on error code
          if (error.code === 1) {
            showError("Location permission denied. Please use manual entry.");
          } else if (error.code === 2) {
            showError("Location unavailable. Please use manual entry.");
          } else if (error.code === 3) {
            showError("Location request timeout. Please use manual entry.");
          } else {
            showError("GPS location failed. Please use manual entry.");
          }
          
          // Automatically switch to manual mode
          setLocationMethod("manual");
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setLoading(false);
      showError("GPS not available in your browser. Please enter manually.");
      setLocationMethod("manual");
    }
  };

  const handleCitySearch = async () => {
    if (!cityName.trim()) {
      showError("Please enter a city name");
      return;
    }

    setSearching(true);
    
    try {
      // Use Nominatim geocoding API (free, no key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const location = data[0];
        updateData({
          lat: parseFloat(location.lat),
          lon: parseFloat(location.lon),
          county: location.display_name,
        });
        setLocationMethod("manual");
        showSuccess(`Location found: ${location.display_name}`);
      } else {
        showError("Location not found. Try a different city name.");
      }
    } catch (error) {
      showError("Failed to search location. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const handleManualLocation = () => {
    setLocationMethod("manual");
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
              <h3 className="font-semibold text-lg mb-1">Enter City Name</h3>
              <p className="text-gray-600 text-sm">
                Search for your city or farm location
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Manual City Input */}
      {locationMethod === "manual" && (
        <div className="bg-white border-2 border-amber-200 rounded-lg p-6 space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Enter Your City or Location</h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter your city name (e.g., "Chico, California" or "95926")
            </p>
          </div>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter city name or ZIP code..."
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCitySearch()}
              className="flex-1"
            />
            <Button
              onClick={handleCitySearch}
              disabled={searching || !cityName.trim()}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {searching ? (
                "Searching..."
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
        </div>
      )}

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