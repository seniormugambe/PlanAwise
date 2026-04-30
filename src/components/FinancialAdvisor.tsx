import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AnimatedBotAvatar } from "@/components/AnimatedBotAvatar";
import {
  Send,
  User,
  Sparkles,
  RotateCcw,
  Heart,
  Star,
  TrendingUp,
  DollarSign,
  ArrowDown,
  Zap,
} from "lucide-react";
import { useFinancialChat } from "@/hooks/useFinancialChat";
import { useGamification } from "@/hooks/useGamification";

const suggestedQuestions = [
  { text: "💰 How can I boost my emergency fund?", icon: "💰" },
  { text: "📈 Is my savings rate on track?", icon: "📈" },
  { text: "🎯 Help me prioritize my goals!", icon: "🎯" },
  { text: "🤔 Invest or pay debt first?", icon: "🤔" },
  { text: "✨ Best budgeting tips for me?", icon: "✨" },
];

const botPersonalities = [
  {
    name: "Finley",
    emoji: "🤖",
    color: "bg-blue-500",
    description: "Your friendly financial guide",
    mood: "happy" as const,
  },
  {
    name: "Penny",
    emoji: "💎",
    color: "bg-purple-500", 
    description: "Savings specialist",
    mood: "excited" as const,
  },
  {
    name: "Buck",
    emoji: "💰",
    color: "bg-green-500",
    description: "Investment enthusiast", 
    mood: "neutral" as const,
  },
];

const encouragingMessages = [
  "You're doing great! 🌟",
  "Smart question! 💡",
  "I love helping with this! ❤️",
  "Excellent thinking! 🎯",
  "You're on the right track! 🚀",
];

const getGreetingByTime = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning! ☀️";
  if (hour < 17) return "Good afternoon! 🌤️";
  return "Good evening! 🌙";
};

export const FinancialAdvisor = () => {
  const { messages, isLoading, sendMessage, clearChat } = useFinancialChat();
  const [isGeminiConnected, setIsGeminiConnected] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      const apiKey = localStorage.getItem('gemini_api_key');
      try {
        const response = await fetch('/api/ai/status', {
          headers: {
            ...(apiKey ? { 'x-api-key': apiKey } : {}),
          },
        });
        if (response.ok) {
          const data = await response.json();
          setIsGeminiConnected(Boolean(data.connected));
          return;
        }
      } catch (error) {
        console.error('AI backend status error:', error);
      }
      setIsGeminiConnected(Boolean(apiKey));
    };

    checkConnection();

    const handleStorage = () => {
      const apiKey = localStorage.getItem('gemini_api_key');
      setIsGeminiConnected(Boolean(apiKey));
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);
  const [inputValue, setInputValue] = useState("");
  const [currentBot, setCurrentBot] = useState(botPersonalities[0]);
  const [isTyping, setIsTyping] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Handle scroll detection for scroll-to-bottom button
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom && messages.length > 3);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    setIsTyping(true);
    setMessageCount(prev => prev + 1);
    try {
      await sendMessage(content);
      setErrorMsg(null);
    } catch (err: any) {
      setErrorMsg("Gemini AI is not connected or there was an error. Please check your API key in AI Settings.");
    }
    setInputValue("");
    setIsTyping(false);
    const heartChance = messageCount < 3 ? 0.8 : 0.3;
    if (Math.random() > heartChance) {
      setShowHeartAnimation(true);
      setTimeout(() => setShowHeartAnimation(false), 2000);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    const cleanQuestion = question.replace(/[^\w\s?]/g, "").trim();
    sendMessage(cleanQuestion);
  };

  const switchBot = () => {
    const nextIndex =
      (botPersonalities.indexOf(currentBot) + 1) % botPersonalities.length;
    setCurrentBot(botPersonalities[nextIndex]);
  };

  return (
    <Card className="h-[700px] flex flex-col bg-background border-0 shadow-none">
      {/* Floating hearts animation */}
      {showHeartAnimation && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {[...Array(5)].map((_, i) => (
            <Heart
              key={i}
              className="absolute w-4 h-4 text-red-400 animate-bounce"
              style={{
                left: `${20 + i * 15}%`,
                top: `${60 + i * 5}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: "2s",
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <AnimatedBotAvatar
            mood={isLoading || isTyping ? 'thinking' : currentBot.mood}
            size="lg"
            onClick={switchBot}
            isTyping={isLoading || isTyping}
            className="shadow-lg hover:shadow-xl transition-shadow duration-300"
          />
          <div>
            <h3 className="font-bold text-lg text-foreground">
              {currentBot.name} AI
            </h3>
            <p className="text-sm text-muted-foreground">
              {currentBot.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {messages.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              className="hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="ml-2 hidden sm:inline">Clear</span>
            </Button>
          )}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${isGeminiConnected ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}> 
            <div className={`w-2 h-2 rounded-full animate-pulse ${isGeminiConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={`text-xs font-medium ${isGeminiConnected ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
              {isGeminiConnected ? 'Gemini AI Connected' : 'Gemini AI Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 flex flex-col">
        {/* Suggested Questions */}
        {messages.length === 1 && (
          <div className="p-6 space-y-4 animate-fade-in bg-gradient-to-br from-primary/5 to-accent/5">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                <h4 className="text-lg font-semibold text-foreground">
                  {getGreetingByTime()} Let's talk money 💰
                </h4>
              </div>
              <p className="text-muted-foreground max-w-md mx-auto">
                I'm {currentBot.name}, your personal financial advisor! I've analyzed your financial situation and I'm excited to help you make smart money decisions. Pick a topic below or ask me anything:
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  className="flex items-center gap-3 p-4 bg-card hover:bg-card/80 border border-border/50 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-md text-left group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => handleSuggestedQuestion(question.text)}
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                    {question.icon}
                  </span>
                  <span className="font-medium text-foreground">
                    {question.text.replace(/[^\w\s?]/g, "").trim()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-hidden relative">
          <ScrollArea className="h-full" onScrollCapture={handleScroll}>
            <div className="p-4 space-y-6">
              {messages.slice(1).map((message, index) => (
                <div
                  key={message.id}
                  className={`flex gap-4 animate-fade-in ${
                    message.isUser ? "justify-end" : "justify-start"
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {!message.isUser && (
                    <div className="flex-shrink-0">
                      <AnimatedBotAvatar
                        mood={currentBot.mood}
                        size="md"
                        className="shadow-md"
                      />
                    </div>
                  )}

                  <div className={`max-w-[75%] ${message.isUser ? 'order-first' : ''}`}>
                    <div
                      className={`rounded-2xl p-4 shadow-sm transition-all duration-300 hover:shadow-md ${
                        message.isUser
                          ? "bg-primary text-primary-foreground ml-auto"
                          : "bg-card border border-border/50 hover:border-primary/20"
                      }`}
                    >
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap m-0 text-balance">
                          {message.content}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-current/10">
                        <span className="text-xs opacity-70 font-medium">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {!message.isUser && message.category && (
                          <span className="text-xs opacity-70 capitalize flex items-center gap-1">
                            {message.category === 'budgeting' && '📊'}
                            {message.category === 'saving' && '💰'}
                            {message.category === 'investing' && '📈'}
                            {message.category === 'debt' && '💳'}
                            {message.category === 'general' && '💡'}
                            {message.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {message.isUser && (
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-md hover:scale-110 transition-transform duration-300">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {(isLoading || isTyping) && (
                <div className="flex gap-4 justify-start animate-fade-in">
                  <div className="flex-shrink-0">
                    <AnimatedBotAvatar
                      mood="thinking"
                      size="md"
                      isTyping={true}
                      className="shadow-md"
                    />
                  </div>
                  <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm max-w-[75%]">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm text-muted-foreground font-medium">
                        {currentBot.name} is crafting a response...
                      </span>
                      <Sparkles className="w-4 h-4 text-primary animate-spin" />
                    </div>
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce"></div>
                      <div
                        className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.15s" }}
                      ></div>
                      <div
                        className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.3s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Invisible element for auto-scroll */}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Scroll to bottom button */}
          {showScrollButton && (
            <Button
              onClick={scrollToBottom}
              size="sm"
              className="absolute bottom-4 right-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-10"
              variant="secondary"
            >
              <ArrowDown className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t bg-card/50 backdrop-blur-sm">
          {/* Quick Actions */}
          {!isLoading && inputValue.length === 0 && messages.length > 1 && (
            <div className="flex flex-wrap justify-center gap-2 p-3 border-b">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setInputValue("How am I doing financially?")}
                className="text-xs hover:bg-primary/10 transition-all duration-300"
              >
                <TrendingUp className="w-3 h-3 mr-2" />
                Quick Check
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setInputValue("Give me a money tip!")}
                className="text-xs hover:bg-primary/10 transition-all duration-300"
              >
                <Star className="w-3 h-3 mr-2" />
                Money Tip
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setInputValue("Help me save more money")}
                className="text-xs hover:bg-primary/10 transition-all duration-300"
              >
                <DollarSign className="w-3 h-3 mr-2" />
                Save More
              </Button>
            </div>
          )}
          
          {/* Input Field */}
          <div className="p-4">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={`Ask ${currentBot.name} anything about money... 💬`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(inputValue);
                    }
                  }}
                  disabled={isLoading}
                  className="min-h-[48px] pr-16 text-base border-2 focus:border-primary/50 transition-all duration-300 rounded-xl"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {inputValue.length > 0 && (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      {inputValue.length}
                    </span>
                  )}
                </div>
              </div>
              <Button
                onClick={() => handleSendMessage(inputValue)}
                disabled={isLoading || !inputValue.trim()}
                size="lg"
                className="h-[48px] px-6 rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 shadow-md hover:shadow-lg"
                variant="default"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                <span className="ml-2 hidden sm:inline font-medium">
                  {isLoading ? "Sending..." : "Send"}
                </span>
              </Button>
            </div>
            
            {/* Enhanced Helper Text */}
            <div className="flex items-center justify-between mt-3 text-xs">
              <div className="flex items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Enter</kbd>
                  to send
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Shift</kbd>
                  <span>+</span>
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Enter</kbd>
                  for new line
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${isGeminiConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="font-medium">{isGeminiConnected ? `${currentBot.name} is online` : `${currentBot.name} is offline`}</span>
                </span>
              </div>
            </div>

            {/* Message Counter */}
            {messageCount > 0 && (
              <div className="mt-2 text-center">
                <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                  💬 {messageCount} message{messageCount !== 1 ? 's' : ''} sent
                </span>
              </div>
            )}
            {/* Error Message */}
            {errorMsg && (
              <div className="mt-2 text-center">
                <span className="text-xs text-red-600 bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-full">
                  {errorMsg}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
