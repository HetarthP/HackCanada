"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, X, Loader2, Maximize2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface AIAssistantProps {
  /** "panel" = sidebar overlay, "page" = full-page view */
  mode?: "panel" | "page";
  /** Called when the close button is clicked (panel mode only) */
  onClose?: () => void;
}

const AIAssistant = ({ mode = "page", onClose }: AIAssistantProps) => {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Send message to backend (with optional Auth0 token for persistent memory)
  const sendToBackend = async (userMessage: string) => {
    setIsTyping(true);

    try {
      // Try to get an access token from the Next.js Auth0 route
      let accessToken: string | null = null;
      try {
        const tokenRes = await fetch("/auth/access-token");
        if (tokenRes.ok) {
          const tokenData = await tokenRes.json();
          accessToken = tokenData.token || tokenData.accessToken || null;
        }
      } catch {
        // Not authenticated — continue without token (anonymous mode)
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      const chatRes = await fetch(`${API_URL}/api/chat/`, {
        method: "POST",
        headers,
        body: JSON.stringify({ message: userMessage }),
      });

      if (!chatRes.ok) {
        const errData = await chatRes.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error (${chatRes.status})`);
      }

      const data = await chatRes.json();
      setMessages((prev) => [...prev, { text: data.reply, isUser: false }]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setMessages((prev) => [...prev, { text: `⚠️ ${msg}`, isUser: false }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() === "" || isTyping) return;

    const userMessage = input;
    setMessages((prev) => [...prev, { text: userMessage, isUser: true }]);
    setInput("");
    sendToBackend(userMessage);
  };

  const clearChat = () => {
    setMessages([]);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const containerHeight =
    mode === "panel" ? "h-full" : "max-w-4xl h-[calc(100vh-200px)] min-h-[600px] mt-8";

  return (
    <div
      className={`w-full mx-auto ${containerHeight} overflow-hidden flex flex-col backdrop-blur-xl bg-black/60 border border-teal-900/30 shadow-[0_0_40px_rgba(20,184,166,0.1)]`}
      style={{
        borderRadius: mode === "panel" ? "0" : "1rem",
      }}
    >
      {/* Header */}
      <div
        className="p-4 flex justify-between items-center shrink-0 border-b border-teal-900/30 bg-black/40"
      >
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-teal-400" />
          <h2 className="font-semibold text-white tracking-wide">
            Spotlight AI
          </h2>
        </div>
        <div className="flex items-center space-x-2 text-gray-400">
          {mode === "panel" && (
            <a
              href="/brand/chat"
              className="transition-colors hover:text-white p-1"
              title="Open full page"
            >
              <Maximize2 className="h-4 w-4" />
            </a>
          )}
          {mode === "page" && (
            <button
              onClick={clearChat}
              className="text-xs uppercase tracking-wide transition-colors hover:text-white px-2 py-1"
            >
              Clear
            </button>
          )}
          {mode === "panel" && onClose && (
            <button
              onClick={onClose}
              className="transition-colors hover:text-white p-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages container */}
      <div className="flex-1 p-4 overflow-y-auto no-scrollbar relative min-h-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Sparkles className="h-12 w-12 mb-4 text-teal-500 opacity-80" />
            <h3 className="text-xl mb-2 text-white font-medium">
              How can I help you today?
            </h3>
            <p className="text-sm max-w-xs text-gray-400">
              Ask me about VPP strategy, budget allocation, or campaign
              planning. I already know your brand profile!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 animate-fade-in ${
                    msg.isUser
                      ? "bg-teal-600/20 border border-teal-500/30 text-white rounded-2xl rounded-tr-sm shadow-[0_0_15px_rgba(20,184,166,0.15)]"
                      : "bg-gray-900/60 border border-teal-900/40 text-gray-200 rounded-2xl rounded-tl-sm backdrop-blur-md"
                  }`}
                >
                  <p className="text-[14px] leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-4 bg-gray-900/60 border border-teal-900/40 rounded-2xl rounded-tl-sm backdrop-blur-md">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                    <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" style={{ animationDelay: "0.2s" }} />
                    <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" style={{ animationDelay: "0.4s" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input form */}
      <form
        onSubmit={handleSubmit}
        className={`p-4 transition-colors duration-200 shrink-0 border-t ${isFocused ? "border-teal-500/50 bg-black/80" : "border-teal-900/30 bg-black/40"} backdrop-blur-md`}
      >
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Type your message..."
            className="w-full py-3.5 pl-5 pr-12 focus:outline-none bg-gray-900/50 border border-gray-800 focus:border-teal-500/50 rounded-full text-white text-sm transition-colors shadow-inner"
            disabled={isTyping}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <button
            type="submit"
            disabled={input.trim() === "" || isTyping}
            className={`absolute right-1.5 rounded-full p-2.5 transition-all outline-none ${
              input.trim() === "" || isTyping
                ? "text-gray-600 bg-transparent cursor-not-allowed"
                : "text-white bg-teal-600 hover:bg-teal-500 hover:shadow-[0_0_15px_rgba(20,184,166,0.4)]"
            }`}
          >
            {isTyping ? (
              <Loader2 className="h-4 w-4 animate-spin text-teal-500" />
            ) : (
              <Send className={`h-4 w-4 ${input.trim() === "" || isTyping ? "ml-[-2px]" : "ml-[-2px] mt-[1px]"}`} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AIAssistant;
