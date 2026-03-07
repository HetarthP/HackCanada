"use client";

import Link from "next/link";
import { Sparkles, Mail, Lock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { GlowingEffect } from "@/components/ui/glowing-effect";

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background flare */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

            <Link href="/" className="absolute top-8 left-8 flex items-center gap-3 z-10 transition-opacity hover:opacity-80">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-black flex items-center justify-center p-[1px]">
                    <div className="w-full h-full bg-black rounded-lg flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-teal-400" />
                    </div>
                </div>
                <span className="text-white font-bold text-xl tracking-tight">adswap</span>
            </Link>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="relative rounded-2xl p-[1px] border border-teal-900/30">
                    <GlowingEffect
                        spread={40}
                        glow={true}
                        disabled={false}
                        proximity={64}
                        inactiveZone={0.01}
                        borderWidth={2}
                    />
                <div className="relative bg-gradient-to-b from-gray-900 to-black rounded-2xl p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
                        <p className="text-gray-400 text-sm">Sign in to continue to your dashboard</p>
                    </div>

                    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); window.location.href = '/dashboard'; }}>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="email"
                                    className="w-full bg-black border border-gray-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-600 outline-none transition-all"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="password"
                                    className="w-full bg-black border border-gray-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-600 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-2 mb-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded bg-black border-gray-800 text-teal-500 focus:ring-teal-500/20" />
                                <span className="text-sm text-gray-400">Remember me</span>
                            </label>
                            <Link href="#" className="text-sm text-teal-400 hover:text-teal-300 transition-colors">
                                Forgot password?
                            </Link>
                        </div>

                        <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(20,184,166,0.2)] transition-all transform hover:scale-[1.02]">
                            Sign In
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        Don't have an account? <Link href="#" className="text-teal-400 hover:text-teal-300">Sign up</Link>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-800">
                        <a href="/api/auth/login" className="block w-full py-3 rounded-xl bg-gray-900 border border-gray-800 hover:border-teal-900 text-white font-medium text-center transition-all hover:bg-gray-800">
                            Continue with Auth0 Single Sign-On
                        </a>
                    </div>
                </div>
                </div>
            </motion.div>
        </div>
    );
}
