"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { Bot, Loader2, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatContext {
  customerId?: string;
  customerEmail?: string;
  isAuthenticated: boolean;
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your customer support assistant for TechStore. I can help you browse products, check your orders, or place new orders.\n\nTo access your account or orders, I'll need to verify your identity with your email and PIN.\n\nHow can I help you today?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<ChatContext>({ isAuthenticated: false });
  const [isMaximized, setIsMaximized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (content: string) => {
    const userMessage: Message = { role: "user", content };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, context }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      setMessages([...newMessages, { role: "assistant", content: data.response }]);
      
      if (data.context) {
        setContext(data.context);
      }
    } catch (error) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: `I'm sorry, I encountered an error: ${
            error instanceof Error ? error.message : "Unknown error"
          }. Please try again.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={cn(
      "flex flex-col shadow-xl transition-all duration-300",
      isMaximized 
        ? "fixed inset-4 z-50 max-w-none h-auto" 
        : "w-full max-w-2xl mx-auto h-[600px]"
    )}>
      <CardHeader className="border-b bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-6 w-6" />
          TechStore Support
          {context.isAuthenticated && (
            <span className="ml-auto text-sm font-normal opacity-90 mr-2">
              Logged in: {context.customerEmail}
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "text-white hover:bg-white/20",
              !context.isAuthenticated && "ml-auto"
            )}
            onClick={() => setIsMaximized(!isMaximized)}
          >
            {isMaximized ? (
              <Minimize2 className="h-5 w-5" />
            ) : (
              <Maximize2 className="h-5 w-5" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
          <div className="space-y-2">
            {messages.map((message, index) => (
              <ChatMessage key={index} role={message.role} content={message.content} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 p-4 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          <ChatInput onSend={handleSend} disabled={isLoading} />
        </div>
      </CardContent>
    </Card>
  );
}
