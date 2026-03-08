"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, LogOut } from "lucide-react";
import { ShinyButton } from "@/components/ui/shiny-button";
import { SessionData } from "@auth0/nextjs-auth0/types";

export function LandingHero({ session }: { session: SessionData | null }) {
    return (
        <div className="relative min-h-screen bg-black overflow-hidden flex flex-col items-center justify-center">
            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-500/20 rounded-full blur-[120px] opacity-50 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)] pointer-events-none" />

            {/* Navbar (Minimal for Landing) */}
            <nav className="absolute top-0 w-full p-6 flex justify-between items-center z-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-black flex items-center justify-center p-[1px]">
                        <div className="w-full h-full bg-black rounded-lg flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-teal-400" />
                        </div>
                    </div>
                    <span className="text-white font-bold text-xl tracking-tight">Spotlight</span>
                </div>
                <div className="flex gap-4 items-center">
                    {session ? (
                        <Link href="/auth/logout">
                            <button className="flex items-center gap-2 px-5 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors font-medium">
                                <LogOut className="w-4 h-4" />
                                Log Out
                            </button>
                        </Link>
                    ) : (
                        <Link href="/auth/login">
                            <button className="px-5 py-2 rounded-xl text-gray-300 hover:text-white transition-colors font-medium">
                                Log In
                            </button>
                        </Link>
                    )}
                </div>
            </nav>

            {/* Hero Content */}
            <div className="relative z-10 text-center max-w-4xl px-4 flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-teal-900/50 bg-teal-900/20 text-teal-400 mb-8"
                >
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">The future of product placement is here</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-6xl md:text-8xl font-black text-white tracking-tight mb-6 leading-tight"
                >
                    Where Media <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-teal-600">
                        Meets AI
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto"
                >
                    Automatically detect product placement opportunities in your videos and seamlessly overlay photorealistic brand assets with a single click.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4"
                >
                    <Link href={session ? "/create" : "/login"} className="w-full sm:w-auto flex">
                        <ShinyButton className="w-full sm:w-auto transition-transform hover:scale-105 flex items-center justify-center gap-2">
                            <span>Get Started</span>
                            <ArrowRight className="w-5 h-5 relative top-[1px]" />
                        </ShinyButton>
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
