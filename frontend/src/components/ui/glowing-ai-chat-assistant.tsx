"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Info, Bot, X, Maximize2, Sparkles } from 'lucide-react';
import { AnimatedAIChat } from './animated-ai-chat';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const FloatingAiAssistant = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "👋 Hey! I'm your Spotlight AI marketing strategist. Ask me anything about VPP strategy, budget allocation, or campaign planning.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const maxChars = 2000;
  const chatRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    setCharCount(value.length);
  };

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || loading) return;

    // Add user message to chat
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setMessage('');
    setCharCount(0);
    setLoading(true);

    try {
      // Try to get Auth0 access token for per-user memory isolation
      let accessToken: string | null = null;
      try {
        const tokenRes = await fetch("/auth/access-token");
        if (tokenRes.ok) {
          const tokenData = await tokenRes.json();
          accessToken = tokenData.token || tokenData.accessToken || null;
        }
      } catch {
        // Not authenticated — continue anonymously
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      const res = await fetch(`${API_URL}/api/chat/`, {
        method: "POST",
        headers,
        body: JSON.stringify({ message: trimmed }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error (${res.status})`);
      }

      const data = await res.json();
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: data.reply,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: unknown) {
      const errText = err instanceof Error ? err.message : "Something went wrong.";
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: `⚠️ ${errText}`,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Close chat when clicking outside & handle remote open
  useEffect(() => {
    const handleRemoteOpen = () => {
      setIsChatOpen(true);
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (chatRef.current && !chatRef.current.contains(target)) {
        if (!target.closest('.floating-ai-button')) {
          setIsChatOpen(false);
        }
      }
    };

    document.addEventListener('open-chat', handleRemoteOpen);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('open-chat', handleRemoteOpen);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating 3D Glowing AI Logo */}
      <button
        className={`floating-ai-button relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 transform ${isChatOpen ? 'rotate-90' : 'rotate-0'
          }`}
        onClick={() => setIsChatOpen(!isChatOpen)}
        style={{
          background: 'linear-gradient(135deg, rgba(20,184,166,0.8) 0%, rgba(13,148,136,0.8) 100%)',
          boxShadow: '0 0 20px rgba(20, 184, 166, 0.7), 0 0 40px rgba(20, 184, 166, 0.5), 0 0 60px rgba(15, 118, 110, 0.3)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        {/* 3D effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent opacity-30"></div>

        {/* Inner glow */}
        <div className="absolute inset-0 rounded-full border-2 border-white/10"></div>

        {/* AI Icon */}
        <div className="relative z-10">
          {isChatOpen ? <X /> : <Bot className="w-8 h-8 text-white" />}
        </div>

        {/* Glowing animation */}
        <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-teal-500"></div>
      </button>

      {isExpanded && (
        <div className="fixed inset-0 z-[100] bg-black">
          <AnimatedAIChat
            onClose={() => setIsExpanded(false)}
            messages={messages}
            setMessages={setMessages}
            loading={loading}
            setLoading={setLoading}
          />
        </div>
      )}

      {/* Chat Interface */}
      {isChatOpen && !isExpanded && (
        <div
          ref={chatRef}
          className="absolute bottom-20 right-0 w-[420px] max-w-[90vw] transition-all duration-300 origin-bottom-right"
          style={{
            animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
          }}
        >
          <div className="relative flex flex-col rounded-3xl bg-gradient-to-br from-zinc-800/80 to-zinc-900/90 border border-zinc-500/50 shadow-2xl backdrop-blur-3xl overflow-hidden" style={{ maxHeight: '70vh' }}>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-4 pb-2 shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-medium text-zinc-400">AI Assistant</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs font-medium bg-zinc-800/60 text-zinc-300 rounded-2xl">
                  GPT-4
                </span>
                <span className="px-2 py-1 text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 rounded-2xl">
                  Pro
                </span>
                <button
                  onClick={() => setIsExpanded(true)}
                  className="p-1.5 rounded-full hover:bg-zinc-700/50 transition-colors"
                  title="Expand to Fullscreen"
                >
                  <Maximize2 className="w-4 h-4 text-zinc-400" />
                </button>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-1.5 rounded-full hover:bg-zinc-700/50 transition-colors"
                >
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[200px] max-h-[40vh] scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === "user"
                        ? "bg-gradient-to-r from-teal-500 to-teal-400 text-black font-medium rounded-br-md"
                        : "bg-zinc-700/60 text-zinc-100 border border-zinc-600/30 rounded-bl-md"
                      }`}
                  >
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-1.5 mb-1">
                        <Sparkles className="w-3 h-3 text-teal-400" />
                        <span className="text-[10px] font-medium text-teal-400/80 uppercase tracking-wider">Spotlight AI</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-700/60 border border-zinc-600/30 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-3 h-3 text-teal-400" />
                      <span className="text-[10px] font-medium text-teal-400/80 uppercase tracking-wider">Spotlight AI</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Section */}
            <div className="relative shrink-0 border-t border-zinc-700/50">
              <textarea
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                rows={2}
                disabled={loading}
                className="w-full px-6 py-3 bg-transparent border-none outline-none resize-none text-sm font-normal leading-relaxed text-zinc-100 placeholder-zinc-500 scrollbar-none"
                placeholder="Ask about your VPP strategy..."
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              />
            </div>

            {/* Controls Section */}
            <div className="px-4 pb-4 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Character Counter */}
                  <div className="text-xs font-medium text-zinc-500">
                    <span>{charCount}</span>/<span className="text-zinc-400">{maxChars}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Info */}
                  <div className="flex items-center gap-1 text-xs text-zinc-500">
                    <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-600 rounded text-zinc-400 font-mono text-[10px]">Enter</kbd>
                    <span>to send</span>
                  </div>

                  {/* Send Button */}
                  <button
                    onClick={handleSend}
                    disabled={!message.trim() || loading}
                    className="group relative p-2.5 bg-gradient-to-r from-teal-500 to-teal-400 border-none rounded-xl cursor-pointer transition-all duration-300 text-black shadow-lg shadow-teal-500/20 hover:from-teal-400 hover:to-teal-300 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Floating Overlay */}
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.05), transparent, rgba(45, 212, 191, 0.05))'
              }}
            ></div>
          </div>
        </div>
      )}

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes popIn {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .floating-ai-button:hover {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 0 30px rgba(20, 184, 166, 0.9), 0 0 50px rgba(20, 184, 166, 0.7), 0 0 70px rgba(15, 118, 110, 0.5);
        }
      `}</style>
    </div>
  );
};

export { FloatingAiAssistant };
