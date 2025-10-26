import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PersonalInfoStep from "@/components/onboarding/PersonalInfoStep";
import LocationStep from "@/components/onboarding/LocationStep";
import CropsStep from "@/components/onboarding/CropsStep";
import FarmDetailsStep from "@/components/onboarding/FarmDetailsStep";
import PreferencesStep from "@/components/onboarding/PreferencesStep";
import SuccessScreen from "@/components/onboarding/SuccessScreen";
import ProgressIndicator from "@/components/onboarding/ProgressIndicator";
import { Sprout } from "lucide-react";
import { showError } from "@/utils/toast";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface OnboardingData {
  // Personal Information
  name: string;
  email: string;
  phone: string;
  
  // Farm Location
  lat: number | null;
  lon: number | null;
  county: string;
  
  // Farm Details
  preferredCrops: string[];
  soilType: string;
  irrigationType: string;
  farmSize: string;
  
  // Preferences
  language: string;
  interactionMode: "voice" | "text" | "";
  
  // Chat History
  chatHistory: ChatMessage[];
}

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    name: "",
    email: "",
    phone: "",
    lat: null,
    lon: null,
    county: "",
    preferredCrops: [],
    soilType: "",
    irrigationType: "",
    farmSize: "",
    language: "",
    interactionMode: "",
    chatHistory: [],
  });

  const totalSteps = 5;

  const updateFormData = (data: Partial<OnboardingData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleFinish = async () => {
    try {
      // Call backend API
      const response = await fetch('http://localhost:3001/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          location: {
            lat: formData.lat,
            lon: formData.lon,
            county: formData.county,
          },
          crops: formData.preferredCrops,
          soilType: formData.soilType,
          irrigationType: formData.irrigationType,
          farmSize: formData.farmSize,
          language: formData.language,
          interactionMode: formData.interactionMode,
        }),
      });
      
      if (!response.ok) throw new Error('Setup failed');
      
      const data = await response.json();
      console.log('✅ Setup successful:', data);
      
      // Show success screen
      setShowSuccess(true);
      
      // Auto-redirect after 3 seconds
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    } catch (error) {
      console.error('❌ Setup error:', error);
      showError("Failed to save farm setup. Please try again.");
    }
  };

  if (showSuccess) {
    return <SuccessScreen userName={formData.name} />;
  }

  const steps = [
    <PersonalInfoStep
      key="personal"
      data={formData}
      updateData={updateFormData}
      onNext={handleNext}
    />,
    <LocationStep
      key="location"
      data={formData}
      updateData={updateFormData}
      onNext={handleNext}
      onBack={handleBack}
    />,
    <CropsStep
      key="crops"
      data={formData}
      updateData={updateFormData}
      onNext={handleNext}
      onBack={handleBack}
    />,
    <FarmDetailsStep
      key="details"
      data={formData}
      updateData={updateFormData}
      onNext={handleNext}
      onBack={handleBack}
    />,
    <PreferencesStep
      key="preferences"
      data={formData}
      updateData={updateFormData}
      onFinish={handleFinish}
      onBack={handleBack}
    />,
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-emerald-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-emerald-500 p-4 rounded-full">
              <Sprout className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Farm Easy
          </h1>
          <p className="text-gray-600">
            Let's set up your AI farm assistant in just 5 steps
          </p>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />

        {/* Step Content */}
        <Card className="p-6 md:p-8 shadow-lg border-2 border-emerald-100">
          {steps[currentStep]}
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;