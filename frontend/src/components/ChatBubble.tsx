import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Heart, ThumbsUp, Copy, Share } from "lucide-react";
import { ChatMessage } from "@/hooks/useFinancialChat";
import { useState } from "react";

interface ChatBubbleProps {
  message: ChatMessage;
  botEmoji: string;
  botColor: string;
  index: number;
}

export const ChatBubble = ({ message, botEmoji, botColor, index }: ChatBubbleProps) => {
  const [showReaction, setShowReaction] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    setShowReaction(true);
    setTimeout(() => setShowReaction(false), 1000);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div
      className={`group flex gap-4 animate-fade-in ${
        message.isUser ? "justify-end" : "justify-start"
      }`}
      style={{ animationDelay: `${index * 0.1}s` }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {!message.isUser && (
        <div className="flex-shrink-0">
          <div className={`w-10 h-10 rounded-full ${botColor} flex items-center justify-center shadow-md transition-transform duration-300 hover:scale-110`}>
            <span className="text-lg">{botEmoji}</span>
          </div>
        </div>
      )}

      <div className={`relative max-w-[75%] ${message.isUser ? 'order-first' : ''}`}>
        {/* Reaction animation */}
        {showReaction && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
            {liked ? (
              <Heart className="w-5 h-5 text-red-400 fill-current" />
            ) : (
              <ThumbsUp className="w-5 h-5 text-blue-400 fill-current" />
            )}
          </div>
        )}

        {/* Message Actions */}
        {showActions && !message.isUser && (
          <div className="absolute -top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className="h-6 w-6 p-0 bg-background/80 backdrop-blur-sm hover:bg-background"
            >
              <Heart className={`w-3 h-3 ${liked ? 'text-red-500 fill-current' : 'text-muted-foreground'}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-6 w-6 p-0 bg-background/80 backdrop-blur-sm hover:bg-background"
            >
              <Copy className="w-3 h-3 text-muted-foreground" />
            </Button>
          </div>
        )}

        <div
          className={`rounded-2xl p-4 shadow-sm transition-all duration-300 hover:shadow-md ${
            message.isUser
              ? "bg-primary text-primary-foreground"
              : "bg-card border border-border/50 hover:border-border"
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
              <Badge variant="outline" className="text-xs border-current/20">
                {message.category === 'budgeting' && '📊 '}
                {message.category === 'saving' && '💰 '}
                {message.category === 'investing' && '📈 '}
                {message.category === 'debt' && '💳 '}
                {message.category === 'general' && '💡 '}
                <span className="capitalize">{message.category}</span>
              </Badge>
            )}
          </div>
        </div>
      </div>

      {message.isUser && (
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-md transition-transform duration-300 hover:scale-110">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>
      )}
    </div>
  );
};