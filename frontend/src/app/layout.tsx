import type { Metadata } from "next";
import "./globals.css";
import ChatPanel from "@/components/ChatPanel";
import ChatNavLink from "@/components/ChatNavLink";

export const metadata: Metadata = {
    title: "VPP — Virtual Product Placement",
    description:
        "AI-powered virtual product placement. Detect 3D ad slots in video and overlay photorealistic brand assets.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                {/* ── Navbar ─────────────────────────────── */}
                <nav className="navbar">
                    <div className="container">
                        <a href="/" className="navbar-brand">
                            ▶ VPP
                        </a>
                        <ul className="navbar-links">
                            <li>
                                <a href="/">Discover</a>
                            </li>
                            <li>
                                <a href="/dashboard">Creator</a>
                            </li>
                            <li>
                                <a href="/brand">Brand</a>
                            </li>
                            <li>
                                <ChatNavLink />
                            </li>
                        </ul>
                    </div>
                </nav>

                {/* ── Page Content ───────────────────────── */}
                <main className="container page">{children}</main>

                {/* ── Floating Chat Panel ────────────────── */}
                <ChatPanel />
            </body>
        </html>
    );
}
