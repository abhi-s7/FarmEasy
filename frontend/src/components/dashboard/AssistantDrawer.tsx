import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import ChatInterface from "@/components/ChatInterface";
import { OnboardingData } from "@/pages/Onboarding";
import { MessageSquare, Mic } from "lucide-react";

interface AssistantDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farmData: OnboardingData;
}

const AssistantDrawer = ({ open, onOpenChange, farmData }: AssistantDrawerProps) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle>{t("dashboard.assistant")}</SheetTitle>
        </SheetHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-[calc(100vh-80px)]">
          <TabsList className="w-full rounded-none border-b">
            <TabsTrigger value="chat" className="flex-1 gap-2">
              <MessageSquare className="w-4 h-4" />
              {t("dashboard.chat")}
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex-1 gap-2">
              <Mic className="w-4 h-4" />
              {t("dashboard.voice")}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="h-full m-0 p-0">
            <div className="h-full">
              <ChatInterface farmData={farmData} />
            </div>
          </TabsContent>
          
          <TabsContent value="voice" className="h-full m-0 p-6">
            <div className="flex flex-col items-center justify-center h-full space-y-6">
              <div className="text-6xl">🎤</div>
              <h3 className="text-xl font-semibold">Voice Mode</h3>
              <p className="text-gray-600 text-center max-w-md">
                Voice interaction coming soon. Use the chat tab to communicate with your AI assistant.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default AssistantDrawer;