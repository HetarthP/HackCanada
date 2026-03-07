"use client";

import { useState, useRef, useEffect, FormEvent } from "react";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content:
                "👋 Welcome to Ghost-Merchant! I'm your AI marketing strategist. " +
                "I already know your brand profile — ask me anything about VPP strategy, " +
                "budget allocation, or campaign planning.",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = "auto";
            inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
        }
    }, [input]);

    const sendMessage = async (e: FormEvent) => {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed || loading) return;

        const userMsg: Message = {
            id: `user-${Date.now()}`,
            role: "user",
            content: trimmed,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);
        setError("");

        try {
            // 1) Get access token from the Next.js API route
            const tokenRes = await fetch("/api/chat-token");
            if (!tokenRes.ok) {
                throw new Error("Not authenticated. Please log in.");
            }
            const { accessToken } = await tokenRes.json();

            // 2) POST to FastAPI backend
            const chatRes = await fetch(`${API_URL}/api/chat/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ message: trimmed }),
            });

            if (!chatRes.ok) {
                const errData = await chatRes.json().catch(() => ({}));
                throw new Error(
                    errData.detail || `Server error (${chatRes.status})`
                );
            }

            const data = await chatRes.json();

            const aiMsg: Message = {
                id: `ai-${Date.now()}`,
                role: "assistant",
                content: data.reply,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiMsg]);
        } catch (err: unknown) {
            const msg =
                err instanceof Error ? err.message : "Something went wrong.";
            setError(msg);
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage(e as unknown as FormEvent);
        }
    };

    return (
        <div className="chat-container">
            {/* ── Message List ──────────────────────── */}
            <div className="chat-messages">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`chat-bubble ${
                            msg.role === "user"
                                ? "chat-bubble-user"
                                : "chat-bubble-ai"
                        }`}
                    >
                        <div className="chat-bubble-header">
                            <span className="chat-bubble-role">
                                {msg.role === "user" ? "You" : "🤖 Ghost-Merchant"}
                            </span>
                            <span className="chat-bubble-time">
                                {msg.timestamp.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </span>
                        </div>
                        <div className="chat-bubble-content">{msg.content}</div>
                    </div>
                ))}

                {loading && (
                    <div className="chat-bubble chat-bubble-ai">
                        <div className="chat-bubble-header">
                            <span className="chat-bubble-role">
                                🤖 Ghost-Merchant
                            </span>
                        </div>
                        <div className="chat-typing">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="chat-error">⚠️ {error}</div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* ── Input Row ────────────────────────── */}
            <form className="chat-input-row" onSubmit={sendMessage}>
                <textarea
                    ref={inputRef}
                    className="chat-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about your VPP strategy..."
                    rows={1}
                    disabled={loading}
                />
                <button
                    type="submit"
                    className="btn btn-primary chat-send-btn"
                    disabled={!input.trim() || loading}
                >
                    {loading ? "..." : "Send"}
                </button>
            </form>
        </div>
    );
}
