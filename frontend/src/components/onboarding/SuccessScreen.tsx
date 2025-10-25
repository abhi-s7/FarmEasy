import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sprout } from "lucide-react";

interface SuccessScreenProps {
  userName: string;
}

const SuccessScreen = ({ userName }: SuccessScreenProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-emerald-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="bg-emerald-500 p-6 rounded-full animate-pulse">
              <Sprout className="w-16 h-16 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-lg">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome, {userName}! 🌾
          </h1>
          <p className="text-xl text-gray-600">
            Your farm is all set up and ready to grow!
          </p>
          <p className="text-gray-500">
            Redirecting you to your dashboard...
          </p>
        </div>

        {/* Farm Illustration */}
        <div className="bg-white rounded-lg p-8 shadow-lg border-2 border-emerald-100">
          <div className="text-6xl mb-4">🚜</div>
          <p className="text-gray-700 font-medium">
            Your AI farm assistant is ready to help you succeed!
          </p>
        </div>

        {/* Manual Navigation */}
        <Button
          onClick={() => navigate("/dashboard")}
          size="lg"
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-8"
        >
          Go to Dashboard Now
        </Button>
      </div>
    </div>
  );
};

export default SuccessScreen;