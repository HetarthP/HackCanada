"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import ThreeBackground from "@/components/ThreeBackground";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";
import Link from "next/link";

export default function CreatePage() {
    return (
        <DashboardLayout>
            <div className="relative w-full h-full min-h-screen bg-black overflow-hidden flex flex-col items-center justify-center p-8">
                <ThreeBackground />

                <div className="relative z-10 max-w-5xl w-full flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 text-center md:text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tight mb-6 leading-tight">
                                Create Your <br />
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-teal-600">
                                    AI-Powered Video
                                </span>
                            </h1>
                            <p className="text-xl text-gray-400 mb-10 max-w-xl mx-auto md:mx-0">
                                Discover ad placement opportunities contextually mapped in 3D space. Start by uploading your footage.
                            </p>
                            <Link href="/select-video" className="inline-block w-full sm:w-auto">
                                <button className="px-8 flex items-center justify-center md:justify-start gap-2 py-4 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all transform hover:scale-105 border-0 w-full sm:w-auto">
                                    Start Editing
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </Link>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex-1 w-full max-w-md mx-auto"
                    >
                        <div className="relative w-full aspect-video rounded-2xl border border-teal-900/50 bg-gray-900/80 backdrop-blur-xl shadow-2xl overflow-hidden group flex items-center justify-center">
                            <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/10 to-transparent pointer-events-none" />
                            <div className="w-16 h-16 rounded-full bg-teal-500/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-teal-500/30 transition-all cursor-pointer shadow-lg backdrop-blur-sm">
                                <PlayCircle className="w-8 h-8 text-teal-400 ml-1" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    );
}
