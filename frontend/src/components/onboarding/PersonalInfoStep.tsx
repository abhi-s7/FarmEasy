import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OnboardingData } from "@/pages/Onboarding";
import { showError } from "@/utils/toast";

interface PersonalInfoStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
}

const PersonalInfoStep = ({ data, updateData, onNext }: PersonalInfoStepProps) => {
  const handleNext = () => {
    if (!data.name) {
      showError("Please fill in your name");
      return;
    }
    
    // Only validate email format if user entered something
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        showError("Please enter a valid email address");
        return;
      }
    }
    
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          👋 Let's get to know you
        </h2>
        <p className="text-gray-600">
          Tell us a bit about yourself to personalize your experience.
        </p>
      </div>

      <div className="space-y-5">
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-base font-semibold">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter your full name"
            value={data.name}
            onChange={(e) => updateData({ name: e.target.value })}
            className="h-14 text-base"
          />
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-base font-semibold">
            Email Address <span className="text-gray-400">(Optional)</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="your.email@example.com"
            value={data.email}
            onChange={(e) => updateData({ email: e.target.value })}
            className="h-14 text-base"
          />
        </div>

        {/* Phone Field */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-base font-semibold">
            Phone Number <span className="text-gray-400">(Optional)</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={data.phone}
            onChange={(e) => updateData({ phone: e.target.value })}
            className="h-14 text-base"
          />
        </div>
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          🔒 Your information is secure and will only be used to personalize your farming experience.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-4">
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

export default PersonalInfoStep;