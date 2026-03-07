"use client";

import React from "react";

export default function ChatNavLink() {
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        document.dispatchEvent(new Event("open-chat"));
      }}
    >
      💬 Chat
    </a>
  );
}
