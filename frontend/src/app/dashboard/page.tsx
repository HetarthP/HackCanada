"use client";

import { useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import VideoPlayer from "@/components/VideoPlayer";
import Link from "next/link";
import { Plus, Brain, BarChart3, ChevronRight, Video } from "lucide-react";
import { motion } from "framer-motion";
import { Suspense } from "react";

function DashboardContent() {
    const searchParams = useSearchParams();
    const videoId = searchParams?.get("videoId");

    return (
        <div className="p-8 max-w-6xl mx-auto min-h-[calc(100vh-4rem)] flex flex-col">
            <div className="mb-8 flex items-center gap-2 text-sm text-gray-500">
                <Link href="/library" className="hover:text-white transition-colors">Library</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-teal-400">Current Project</span>
            </div>

            {!videoId ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 flex flex-col items-center justify-center text-center max-w-lg mx-auto"
                >
                    <div className="w-24 h-24 rounded-full bg-teal-900/20 flex items-center justify-center mb-6 border border-teal-500/20 shadow-[0_0_30px_rgba(20,184,166,0.1)]">
                        <Video className="w-10 h-10 text-teal-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">No active project</h2>
                    <p className="text-gray-400 mb-8">Start by uploading a new video or selecting one from our catalog to detect ad placement slots.</p>
                    <Link href="/create">
                        <button className="px-8 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all transform hover:scale-105">
                            <Plus className="w-5 h-5" />
                            Create New Project
                        </button>
                    </Link>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Project Editor</h1>
                            <p className="text-gray-400">Review your video and generate AI-powered ad placements.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-semibold">
                                Draft Mode
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Video Player Section */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="bg-gray-900/50 border border-teal-900/30 rounded-2xl p-2 md:p-4 overflow-hidden shadow-2xl">
                                <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-gray-800">
                                    <VideoPlayer publicId={videoId} />
                                </div>
                            </div>
                        </div>

                        {/* Actions Column */}
                        <div className="space-y-6">
                            <div className="bg-gradient-to-b from-gray-900 to-black border border-teal-900/30 rounded-2xl p-6 shadow-xl w-full text-left">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <Brain className="w-5 h-5 text-teal-400" />
                                    AI Detection
                                </h3>
                                <p className="text-sm text-gray-400 mb-6">
                                    Use our Gemini-powered vision model to automatically scan this video for optimal 3D ad placement slots.
                                </p>
                                <button className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(20,184,166,0.2)] transition-all transform hover:scale-[1.02]">
                                    <Brain className="w-4 h-4" />
                                    Detect Ad Slots
                                </button>
                            </div>

                            <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 rounded-2xl p-6 w-full text-left">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-gray-400" />
                                    Placement Data
                                </h3>
                                <p className="text-sm text-gray-500 mb-6">
                                    View the generated placement map to fine-tune the scale and mapping of inserted brands.
                                </p>
                                <button className="w-full py-3 rounded-xl bg-transparent border-2 border-gray-800 text-gray-300 hover:text-white hover:border-teal-500/50 hover:bg-teal-900/10 font-semibold flex items-center justify-center gap-2 transition-all">
                                    View Placement Map
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

export default function DashboardPage() {
    return (
        <DashboardLayout>
            <Suspense fallback={
                <div className="h-full w-full flex items-center justify-center">
                    <span className="w-8 h-8 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin"></span>
                </div>
            }>
                <DashboardContent />
            </Suspense>
        </DashboardLayout>
    );
}
