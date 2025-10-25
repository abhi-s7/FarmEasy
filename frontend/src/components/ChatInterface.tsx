import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Mic, Send, MicOff } from "lucide-react";
import { OnboardingData, ChatMessage } from "@/pages/Onboarding";
import { showSuccess, showError } from "@/utils/toast";

interface ChatInterfaceProps {
  farmData: OnboardingData;
}

const ChatInterface = ({ farmData }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>(farmData.chatHistory || []);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(farmData.interactionMode === "voice");
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Simulate AI response (frontend-only)
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateMockResponse(inputMessage, farmData),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);

      // Save to localStorage
      const updatedData = {
        ...farmData,
        chatHistory: [...messages, userMessage, aiResponse],
      };
      localStorage.setItem("farmSetup", JSON.stringify(updatedData));
    }, 1500);
  };

  const generateMockResponse = (question: string, data: OnboardingData): string => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes("weather")) {
      return `Based on your location in ${data.county}, the current weather is partly cloudy with a temperature of 72°F. It's a good day for outdoor farm work!`;
    }
    
    if (lowerQuestion.includes("crop") || lowerQuestion.includes("plant")) {
      return `You're growing ${data.preferredCrops.join(", ")}. Given your ${data.soilType} soil and ${data.irrigationType} irrigation system, I recommend monitoring soil moisture levels regularly.`;
    }
    
    if (lowerQuestion.includes("irrigation") || lowerQuestion.includes("water")) {
      return `With your ${data.irrigationType} irrigation system on ${data.farmSize}, ensure you're watering during early morning or late evening to minimize evaporation. Your ${data.soilType} soil retains moisture differently than other soil types.`;
    }
    
    return `I'm here to help with your farm! You can ask me about weather conditions, crop recommendations for your ${data.preferredCrops[0] || "crops"}, irrigation tips, or any farming advice specific to your ${data.farmSize} farm in ${data.county}.`;
  };

  const handleVoiceToggle = () => {
    if (!isRecording) {
      setIsRecording(true);
      showSuccess("Voice recording started");
      
      // Simulate voice recording (frontend-only)
      setTimeout(() => {
        setIsRecording(false);
        setInputMessage("What's the best time to water my crops?");
        showSuccess("Voice message captured");
      }, 2000);
    } else {
      setIsRecording(false);
      showError("Recording cancelled");
    }
  };

  const toggleMode = () => {
    const newMode = !isVoiceMode;
    setIsVoiceMode(newMode);
    
    const updatedData = {
      ...farmData,
      interactionMode: newMode ? "voice" : "text",
    };
    localStorage.setItem("farmSetup", JSON.stringify(updatedData));
    
    showSuccess(`Switched to ${newMode ? "voice" : "text"} mode`);
  };

  return (
    <Card className="h-[calc(100vh-200px)] flex flex-col border-2 border-emerald-100">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">AI Farm Assistant</h2>
            <p className="text-sm text-gray-500">Ask me anything about your farm</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={toggleMode}
              variant={isVoiceMode ? "default" : "outline"}
              size="sm"
              className="gap-2"
            >
              <Mic className="w-4 h-4" />
              Voice
            </Button>
            <Button
              onClick={toggleMode}
              variant={!isVoiceMode ? "default" : "outline"}
              size="sm"
              className="gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Text
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-3">
              <div className="text-6xl">🌾</div>
              <h3 className="text-lg font-semibold text-gray-900">
                Start a conversation
              </h3>
              <p className="text-sm text-gray-500 max-w-md">
                Ask me about weather, crop recommendations, irrigation tips, or any farming advice!
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === "user"
                      ? "bg-emerald-500 text-white"
                      : "bg-white border border-gray-200 text-gray-900"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={`text-xs mt-2 ${
                      message.role === "user" ? "text-emerald-100" : "text-gray-400"
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
        <div className="flex gap-2">
          {isVoiceMode ? (
            <Button
              onClick={handleVoiceToggle}
              className={`flex-1 h-12 ${
                isRecording
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-emerald-500 hover:bg-emerald-600"
              }`}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-5 h-5 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5 mr-2" />
                  Hold to Speak
                </>
              )}
            </Button>
          ) : (
            <>
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type your message here..."
                className="flex-1 min-h-[48px] max-h-32 resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="h-12 px-6 bg-emerald-500 hover:bg-emerald-600"
              >
                <Send className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ChatInterface;