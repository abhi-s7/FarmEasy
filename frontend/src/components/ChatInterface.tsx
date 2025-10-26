import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Mic, Send, MicOff } from "lucide-react";
import { OnboardingData, ChatMessage } from "@/pages/Onboarding";
import { showSuccess, showError } from "@/utils/toast";

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
    currentRecognition?: SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

declare const SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

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

    try {
      // Call the Letta agent backend
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          userId: farmData.name || "default_user"
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from agent');
      }

      const data = await response.json();

      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "Sorry, I couldn't generate a response.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);

      // Speak response if in voice mode
      if (isVoiceMode && aiResponse.content) {
        speakResponse(aiResponse.content);
      }

      // Save to localStorage
      const updatedData = {
        ...farmData,
        chatHistory: [...messages, userMessage, aiResponse],
      };
      localStorage.setItem("farmSetup", JSON.stringify(updatedData));

    } catch (error) {
      console.error('Error communicating with agent:', error);

      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I'm having trouble connecting to the AI assistant right now. Please check your internet connection and try again. If the problem persists, contact support.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);

      // Save to localStorage even with error
      const updatedData = {
        ...farmData,
        chatHistory: [...messages, userMessage, aiResponse],
      };
      localStorage.setItem("farmSetup", JSON.stringify(updatedData));
    }
  };

  const handleVoiceToggle = () => {
    if (!isRecording) {
      // Check if speech recognition is supported
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        showError("Speech recognition is not supported in this browser");
        return;
      }

      setIsRecording(true);
      showSuccess("Voice recording started");

      // Start speech recognition
      startSpeechRecognition();

    } else {
      setIsRecording(false);
      showError("Recording cancelled");
      stopSpeechRecognition();
    }
  };

  const startSpeechRecognition = () => {
    // Check for HTTPS (required for most browsers)
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      showError("Speech recognition requires HTTPS for security. Please use https:// or localhost.");
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showError("Speech recognition is not supported in this browser. Try Chrome, Edge, or Safari on iOS.");
      setIsRecording(false);
      return;
    }

    // Request microphone permission explicitly
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          console.log('Speech recognition started');
          showSuccess('Listening... Speak now');
        };

        recognition.onresult = (event: any) => {
          const last = event.results.length - 1;
          const transcript = event.results[last][0].transcript;
          console.log('Speech recognition result:', transcript);

          if (transcript && transcript.trim()) {
            setInputMessage(transcript.trim());
            showSuccess("Voice captured: " + transcript.trim().substring(0, 50) + (transcript.length > 50 ? "..." : ""));

            // Auto-send after a brief delay
            setTimeout(() => {
              handleSendMessage();
            }, 1000);
          } else {
            showError("No speech detected. Please try again.");
            setIsRecording(false);
          }
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);

          let errorMessage = "Speech recognition failed";
          switch (event.error) {
            case 'no-speech':
              errorMessage = "No speech detected. Please speak louder or closer to microphone.";
              break;
            case 'audio-capture':
              errorMessage = "No microphone found. Please check your microphone connection.";
              break;
            case 'not-allowed':
              errorMessage = "Microphone permission denied. Please allow microphone access and try again.";
              break;
            case 'network':
              errorMessage = "Network error occurred. Please check your internet connection.";
              break;
            case 'aborted':
              errorMessage = "Speech recognition was cancelled.";
              return; // Don't show error for aborted
            default:
              errorMessage = `Speech recognition error: ${event.error}`;
          }
          showError(errorMessage);
        };

        recognition.onend = () => {
          console.log('Speech recognition ended');
          setIsRecording(false);
        };

        try {
          (window as any).currentRecognition = recognition;
          recognition.start();
        } catch (error) {
          console.error('Failed to start speech recognition:', error);
          showError("Failed to start voice recognition. Please try again.");
          setIsRecording(false);
        }
      })
      .catch((error) => {
        console.error('Microphone permission denied:', error);
        showError("Microphone access required for voice input. Please allow microphone permission.");
        setIsRecording(false);
      });
  };

  const stopSpeechRecognition = () => {
    if ((window as any).currentRecognition) {
      (window as any).currentRecognition.abort();
    }
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

  const speakResponse = (text: string) => {
    // Check if speech synthesis is supported
    if (!('speechSynthesis' in window)) {
      console.log('Text-to-speech not supported in this browser');
      showError('Text-to-speech not supported in this browser');
      return;
    }

    // Cancel any ongoing speech
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1;
      utterance.volume = 0.8; // Set volume

      utterance.onstart = () => {
        console.log('Speech synthesis started');
      };

      utterance.onend = () => {
        console.log('Speech synthesis ended');
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        showError('Text-to-speech error occurred');
      };

      // Get available voices and prefer a natural-sounding one
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => voice.lang === 'en-US' && voice.name.includes('Natural')) ||
                            voices.find(voice => voice.lang.startsWith('en'));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      // Speak the response
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Failed to initialize speech synthesis:', error);
      showError('Failed to initialize text-to-speech');
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
                  ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                  : "bg-emerald-500 hover:bg-emerald-600 text-white"
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
