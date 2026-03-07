"use client";

import React, { useState, useEffect } from "react";
import AIAssistant from "@/components/ui/ai-assistant";

/**
 * Slide-in sidebar panel with the AI assistant. Renders on all pages via layout.
 * Listens for the "open-chat" event dispatched by the navbar link.
 */
export default function ChatPanel() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    document.addEventListener("open-chat", handleOpen);
    return () => document.removeEventListener("open-chat", handleOpen);
  }, []);

  return (
    <>
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-50 w-[400px] h-[600px] max-h-[85vh] overflow-hidden animate-slide-in-right"
          style={{
            borderRadius: "var(--radius)",
            boxShadow: "0 8px 48px rgba(0,0,0,0.5), 0 0 24px var(--accent-glow)",
            border: "1px solid var(--border)",
          }}
        >
          <AIAssistant mode="panel" onClose={() => setIsOpen(false)} />
        </div>
      )}
    </>
  );
}
