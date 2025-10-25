interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressIndicator = ({ currentStep, totalSteps }: ProgressIndicatorProps) => {
  return (
    <div className="flex justify-center items-center gap-3 mb-8">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div key={index} className="flex items-center">
          <div
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentStep
                ? "bg-emerald-500 scale-125"
                : index < currentStep
                ? "bg-emerald-300"
                : "bg-gray-300"
            }`}
          />
          {index < totalSteps - 1 && (
            <div
              className={`w-8 h-0.5 mx-1 ${
                index < currentStep ? "bg-emerald-300" : "bg-gray-300"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default ProgressIndicator;