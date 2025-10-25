import { useState } from "react";
import { Button } from "@/components/ui/button";
import { OnboardingData } from "@/pages/Onboarding";
import { showError } from "@/utils/toast";

interface PreferencesStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onFinish: () => void;
  onBack: () => void;
}

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
];

const PreferencesStep = ({ data, updateData, onFinish, onBack }: PreferencesStepProps) => {
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    if (!data.language) {
      showError("Please select your preferred language");
      return;
    }
    
    setLoading(true);
    await onFinish();
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🌍 Set your preferences
        </h2>
        <p className="text-gray-600">
          Choose your preferred language for the AI farm assistant.
        </p>
      </div>

      {/* Language Selection */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Preferred Language</h3>
        <div className="grid grid-cols-2 gap-3">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => updateData({ language: lang.code })}
              className={`p-5 rounded-lg border-2 text-base font-medium transition-all ${
                data.language === lang.code
                  ? "bg-emerald-500 text-white border-emerald-500 scale-105"
                  : "bg-white text-gray-700 border-gray-300 hover:border-emerald-300 hover:bg-emerald-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{lang.flag}</span>
                <span>{lang.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Language Confirmation */}
      {data.language && (
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4">
          <p className="text-emerald-900 font-medium">
            ✓ Language set to {LANGUAGES.find(l => l.code === data.language)?.name}
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
          disabled={loading}
        >
          Back
        </Button>
        <Button
          onClick={handleFinish}
          size="lg"
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-8"
          disabled={loading}
        >
          {loading ? "Saving..." : "Finish"}
        </Button>
      </div>
    </div>
  );
};

export default PreferencesStep;