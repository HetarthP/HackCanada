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
        const tokenRes = await fetch("/auth/token");
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
      className={`w-full mx-auto ${containerHeight} overflow-hidden flex flex-col`}
      style={{
        background: "linear-gradient(135deg, var(--bg-secondary), var(--bg-card))",
        borderRadius: mode === "panel" ? "0" : "var(--radius)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Header */}
      <div
        className="p-4 flex justify-between items-center shrink-0"
        style={{
          background: "rgba(108, 99, 255, 0.15)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5" style={{ color: "var(--accent)" }} />
          <h2 className="font-medium" style={{ color: "var(--text-primary)" }}>
            Ghost-Merchant AI
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          {mode === "panel" && (
            <a
              href="/brand/chat"
              className="transition-colors"
              title="Open full page"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--text-primary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-secondary)")
              }
            >
              <Maximize2 className="h-4 w-4" />
            </a>
          )}
          {mode === "page" && (
            <button
              onClick={clearChat}
              className="text-xs uppercase tracking-wide transition-colors"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--text-primary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-secondary)")
              }
            >
              Clear
            </button>
          )}
          {mode === "panel" && onClose && (
            <button
              onClick={onClose}
              className="transition-colors"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--text-primary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-secondary)")
              }
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages container */}
      <div
        className="flex-1 p-4 overflow-y-auto"
        style={{ background: "rgba(10, 10, 15, 0.5)" }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Sparkles
              className="h-12 w-12 mb-4"
              style={{ color: "var(--accent)" }}
            />
            <h3
              className="text-xl mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              How can I help you today?
            </h3>
            <p
              className="text-sm max-w-xs"
              style={{ color: "var(--text-secondary)" }}
            >
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
                  className="max-w-[85%] p-3.5 animate-fade-in"
                  style={{
                    borderRadius: "var(--radius)",
                    ...(msg.isUser
                      ? {
                          background: "var(--accent)",
                          color: "#fff",
                          borderTopRightRadius: "4px",
                          boxShadow: "0 4px 16px var(--accent-glow)",
                        }
                      : {
                          background: "var(--bg-card)",
                          color: "var(--text-primary)",
                          borderTopLeftRadius: "4px",
                          border: "1px solid var(--border)",
                        }),
                  }}
                >
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div
                  className="max-w-[80%] p-3"
                  style={{
                    borderRadius: "var(--radius)",
                    borderTopLeftRadius: "4px",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ background: "var(--accent)" }}
                    />
                    <div
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{
                        background: "var(--accent)",
                        animationDelay: "0.2s",
                      }}
                    />
                    <div
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{
                        background: "var(--accent)",
                        animationDelay: "0.4s",
                      }}
                    />
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
        className="p-4 transition-colors duration-200 shrink-0"
        style={{
          borderTop: `1px solid ${isFocused ? "var(--accent)" : "var(--border)"}`,
          background: isFocused
            ? "rgba(26, 26, 46, 0.8)"
            : "var(--bg-primary)",
        }}
      >
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Type your message..."
            className="w-full py-3 pl-4 pr-12 focus:outline-none"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              borderRadius: "9999px",
              color: "var(--text-primary)",
              fontSize: "0.875rem",
            }}
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
            className="absolute right-1 rounded-full p-2 transition-colors"
            style={{
              background:
                input.trim() === "" || isTyping
                  ? "var(--bg-card)"
                  : "var(--accent)",
              color:
                input.trim() === "" || isTyping
                  ? "var(--text-secondary)"
                  : "#fff",
              cursor:
                input.trim() === "" || isTyping ? "not-allowed" : "pointer",
            }}
          >
            {isTyping ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AIAssistant;
