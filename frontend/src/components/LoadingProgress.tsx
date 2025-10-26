/**
 * Loading Progress Component
 * Shows a progress bar with a message during data fetching
 */

import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";

interface LoadingProgressProps {
  message?: string;
  progress?: number;
}

export default function LoadingProgress({ 
  message = "Fetching data, please wait...", 
  progress = 0 
}: LoadingProgressProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <h2 className="text-2xl font-semibold">Loading</h2>
          <p className="text-muted-foreground">{message}</p>
        </div>
        
        <Progress value={progress} className="w-full" />
        
        <p className="text-center text-sm text-muted-foreground">
          {progress}% complete
        </p>
      </Card>
    </div>
  );
}

