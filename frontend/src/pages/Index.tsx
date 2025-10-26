import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sprout } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has completed onboarding (check for cached farm data)
    const farmData = localStorage.getItem("farmData");
    if (farmData) {
      try {
        const parsed = JSON.parse(farmData);
        // If cache exists and has data, user has completed onboarding
        if (parsed.rawData) {
          navigate("/dashboard");
          return;
        }
      } catch (e) {
        console.error('Error parsing cache:', e);
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-emerald-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="bg-emerald-500 p-6 rounded-full">
            <Sprout className="w-16 h-16 text-white" />
          </div>
        </div>

        {/* Hero Text */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
            Farm Easy
          </h1>
          <p className="text-xl md:text-2xl text-gray-600">
            Your AI-Powered Farm Assistant
          </p>
          <p className="text-gray-500 max-w-lg mx-auto">
            Get personalized farming advice, weather updates, and crop recommendations
            tailored to your farm's unique needs.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 py-8">
          <div className="bg-white rounded-lg p-6 shadow-lg border-2 border-emerald-100">
            <div className="text-4xl mb-3">🌍</div>
            <h3 className="font-semibold text-lg mb-2">Location-Based</h3>
            <p className="text-sm text-gray-600">
              Get advice specific to your farm's location and climate
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg border-2 border-emerald-100">
            <div className="text-4xl mb-3">🌾</div>
            <h3 className="font-semibold text-lg mb-2">Crop Specific</h3>
            <p className="text-sm text-gray-600">
              Tailored recommendations for the crops you grow
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg border-2 border-emerald-100">
            <div className="text-4xl mb-3">🤖</div>
            <h3 className="font-semibold text-lg mb-2">AI-Powered</h3>
            <p className="text-sm text-gray-600">
              Smart assistant that learns and adapts to your needs
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          onClick={() => navigate("/onboarding")}
          size="lg"
          className="bg-emerald-500 hover:bg-emerald-600 text-white text-lg px-12 py-6 h-auto"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default Index;