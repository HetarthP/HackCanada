"use client";

import { useEffect, useRef, useCallback, useTransition } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    SendIcon,
    XIcon,
    LoaderIcon,
    Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
}

interface AnimatedAIChatProps {
    onClose?: () => void;
    messages?: ChatMessage[];
    setMessages?: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
    loading?: boolean;
    setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
}

interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}

function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            textarea.style.height = `${minHeight}px`;
            const newHeight = Math.max(
                minHeight,
                Math.min(
                    textarea.scrollHeight,
                    maxHeight ?? Number.POSITIVE_INFINITY
                )
            );

            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

export function AnimatedAIChat({
    onClose,
    messages: externalMessages,
    setMessages: externalSetMessages,
    loading: externalLoading,
    setLoading: externalSetLoading,
}: AnimatedAIChatProps) {
    // Use external state if provided, otherwise use internal state
    const [internalMessages, internalSetMessages] = useState<ChatMessage[]>([
        {
            id: "welcome",
            role: "assistant",
            content:
                "👋 Hey! I'm your Spotlight AI marketing strategist. Ask me anything about VPP strategy, budget allocation, or campaign planning.",
        },
    ]);
    const [internalLoading, internalSetLoading] = useState(false);

    const messages = externalMessages ?? internalMessages;
    const setMessages = externalSetMessages ?? internalSetMessages;
    const isLoading = externalLoading ?? internalLoading;
    const setIsLoading = externalSetLoading ?? internalSetLoading;

    const [value, setValue] = useState("");
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 60,
        maxHeight: 200,
    });
    const [inputFocused, setInputFocused] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.trim()) {
                handleSendMessage();
            }
        }
    };

    const handleSendMessage = async () => {
        const trimmed = value.trim();
        if (!trimmed || isLoading) return;

        const userMsg: ChatMessage = {
            id: `user-${Date.now()}`,
            role: "user",
            content: trimmed,
        };
        setMessages((prev) => [...prev, userMsg]);
        setValue("");
        adjustHeight(true);
        setIsLoading(true);

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
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col w-full items-center justify-center bg-transparent text-white relative overflow-hidden backdrop-blur-md">
            {onClose && (
                <button 
                  onClick={onClose}
                  className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-50 text-white"
                >
                    <XIcon className="w-6 h-6" />
                </button>
            )}

            {/* Background glows */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full mix-blend-normal filter blur-[128px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-300/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse delay-700" />
                <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-teal-800/10 rounded-full mix-blend-normal filter blur-[96px] animate-pulse delay-1000" />
            </div>

            <div className="w-full max-w-2xl mx-auto relative z-10 flex flex-col h-screen py-6">
                {/* Header */}
                <motion.div
                    className="text-center space-y-2 shrink-0 pt-6 pb-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <h1 className="text-3xl font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-teal-100">
                        Spotlight AI
                    </h1>
                    <p className="text-sm text-teal-200/50">Your AI marketing strategist</p>
                </motion.div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-4 space-y-4 min-h-0 scrollbar-thin scrollbar-thumb-teal-800/50 scrollbar-track-transparent">
                    {messages.map((msg, i) => (
                        <motion.div
                            key={msg.id}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: i === messages.length - 1 ? 0.1 : 0 }}
                        >
                            <div
                                className={cn(
                                    "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                                    msg.role === "user"
                                        ? "bg-teal-500 text-black font-medium rounded-br-md"
                                        : "bg-white/[0.06] text-gray-200 border border-teal-500/20 rounded-bl-md"
                                )}
                            >
                                {msg.role === "assistant" && (
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                        <Sparkles className="w-3 h-3 text-teal-400" />
                                        <span className="text-[10px] font-medium text-teal-400/80 uppercase tracking-wider">Spotlight AI</span>
                                    </div>
                                )}
                                <div className="whitespace-pre-wrap">{msg.content}</div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Typing indicator */}
                    {isLoading && (
                        <motion.div
                            className="flex justify-start"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="bg-white/[0.06] border border-teal-500/20 rounded-2xl rounded-bl-md px-4 py-3">
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <Sparkles className="w-3 h-3 text-teal-400" />
                                    <span className="text-[10px] font-medium text-teal-400/80 uppercase tracking-wider">Spotlight AI</span>
                                </div>
                                <TypingDots />
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <motion.div 
                    className="shrink-0 mt-4 backdrop-blur-2xl bg-black/40 rounded-2xl border border-teal-500/20 shadow-[0_0_40px_rgba(20,184,166,0.1)]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="p-4">
                        <textarea
                            ref={textareaRef}
                            value={value}
                            onChange={(e) => {
                                setValue(e.target.value);
                                adjustHeight();
                            }}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setInputFocused(true)}
                            onBlur={() => setInputFocused(false)}
                            disabled={isLoading}
                            placeholder="Ask Spotlight AI a question..."
                            className={cn(
                                "w-full px-4 py-3",
                                "resize-none",
                                "bg-transparent",
                                "border-none",
                                "text-white text-[15px]",
                                "focus:outline-none",
                                "placeholder:text-gray-500",
                                "min-h-[60px]",
                                "disabled:opacity-50"
                            )}
                            style={{ overflow: "hidden" }}
                        />
                    </div>

                    <div className="p-4 border-t border-teal-500/20 flex items-center justify-between gap-4 bg-black/40 rounded-b-2xl">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-600 rounded text-zinc-400 font-mono text-[10px]">Enter</kbd>
                            <span>to send</span>
                        </div>
                        <motion.button
                            type="button"
                            onClick={handleSendMessage}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isLoading || !value.trim()}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                "flex items-center gap-2",
                                value.trim()
                                    ? "bg-teal-500 text-black shadow-lg shadow-teal-500/20"
                                    : "bg-white/[0.05] text-white/40"
                            )}
                        >
                            {isLoading ? (
                                <LoaderIcon className="w-4 h-4 animate-[spin_2s_linear_infinite]" />
                            ) : (
                                <SendIcon className="w-4 h-4" />
                            )}
                            <span>Send</span>
                        </motion.button>
                    </div>
                </motion.div>
            </div>

            {/* Cursor glow */}
            {inputFocused && (
                <motion.div 
                    className="fixed w-[50rem] h-[50rem] rounded-full pointer-events-none z-0 opacity-[0.03] bg-gradient-to-r from-teal-400 via-teal-600 to-emerald-500 blur-[96px]"
                    animate={{
                        x: mousePosition.x - 400,
                        y: mousePosition.y - 400,
                    }}
                    transition={{
                        type: "spring",
                        damping: 25,
                        stiffness: 150,
                        mass: 0.5,
                    }}
                />
            )}
        </div>
    );
}

function TypingDots() {
    return (
        <div className="flex items-center ml-1">
            {[1, 2, 3].map((dot) => (
                <motion.div
                    key={dot}
                    className="w-1.5 h-1.5 bg-teal-400 rounded-full mx-0.5"
                    initial={{ opacity: 0.3 }}
                    animate={{ 
                        opacity: [0.3, 0.9, 0.3],
                        scale: [0.85, 1.1, 0.85]
                    }}
                    transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: dot * 0.15,
                        ease: "easeInOut",
                    }}
                    style={{
                        boxShadow: "0 0 8px rgba(20, 184, 166, 0.4)"
                    }}
                />
            ))}
        </div>
    );
}
