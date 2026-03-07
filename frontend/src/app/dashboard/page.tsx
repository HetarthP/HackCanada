"use client";

import { useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import Link from "next/link";
import {
    Plus, Brain, ChevronRight, Video, FolderPlus, Loader2,
    CheckCircle2, Circle, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Suspense, useEffect, useState, useCallback } from "react";
import { CldVideoPlayer } from "next-cloudinary";
import "next-cloudinary/dist/cld-video-player.css";

// This is the hardcoded path to the Cloudinary video
const DEMO_RESULT_PUBLIC_ID = "0307_wpxwyd";

const PIPELINE_STEPS = [
    {
        id: "analyzing",
        title: "Analyzing with Gemini 2.5 Flash",
        description: "Scanning video frames for natural scene breaks and optimal insertion points.",
        duration: 3500,
    },
    {
        id: "generating",
        title: "Generating with WaveSpeed AI",
        description: "Extending the best 1-second source clip into a branded 5-second placement.",
        duration: 4000,
    },
    {
        id: "rendering",
        title: "Rendering with Cloudinary fl_splice",
        description: "Stitching original footage and AI-generated content into a seamless output.",
        duration: 3500,
    },
];

/* ─── Dashboard ───────────────────────────────────────────────────── */

function DashboardContent() {
    const searchParams = useSearchParams();
    const videoId = searchParams?.get("videoId");

    // Pipeline state
    const [pipelineActive, setPipelineActive] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(-1);
    const [pipelineComplete, setPipelineComplete] = useState(false);

    // Auto-start the fake processing pipeline as soon as video loads
    useEffect(() => {
        if (videoId && !pipelineActive && !pipelineComplete) {
            setPipelineActive(true);
            setCurrentStepIndex(0);
        }
    }, [videoId, pipelineActive, pipelineComplete]);

    useEffect(() => {
        if (!pipelineActive || currentStepIndex < 0) return;

        if (currentStepIndex >= PIPELINE_STEPS.length) {
            // All steps done
            setPipelineActive(false);
            setPipelineComplete(true);
            return;
        }

        const step = PIPELINE_STEPS[currentStepIndex];
        const timer = setTimeout(() => {
            setCurrentStepIndex((prev) => prev + 1);
        }, step.duration);

        return () => clearTimeout(timer);
    }, [pipelineActive, currentStepIndex]);

    const getStepState = (index: number) => {
        if (pipelineComplete) return "complete";
        if (!pipelineActive) return index === 0 ? "pending" : "pending";
        if (index < currentStepIndex) return "complete";
        if (index === currentStepIndex) return "active";
        return "pending";
    };

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-[calc(100vh-4rem)] flex flex-col items-center">
            <div className="w-full flex items-center gap-2 text-sm text-gray-500 mb-8 max-w-5xl">
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
                    <p className="text-gray-400 mb-8">
                        Upload a video to get started with AI-powered product placement.
                    </p>
                    <Link href="/select-video">
                        <button className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-400 text-black px-6 py-3 rounded-full font-semibold transition-transform hover:scale-105">
                            <Plus className="w-5 h-5" />
                            Upload Video
                        </button>
                    </Link>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-5xl space-y-8"
                >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-center sm:text-left">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">
                                {pipelineComplete ? "AdSwap Complete" : "Project Processing"}
                            </h1>
                            <p className="text-gray-400 max-w-2xl">
                                {pipelineComplete
                                    ? "✅ AI analysis and video synthesis complete. Compare the original and generated version below."
                                    : "Our AI is analyzing the footage and synthesizing the product placement..."}
                            </p>
                        </div>
                        {pipelineActive && (
                            <span className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold flex items-center gap-2 shrink-0">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing...
                            </span>
                        )}
                        {pipelineComplete && (
                            <span className="px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-semibold flex items-center gap-2 shrink-0">
                                <CheckCircle2 className="w-4 h-4" />
                                Ready
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col gap-8 w-full">
                        {/* Video Display Section */}
                        {pipelineComplete ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                {/* Original */}
                                <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-4 shadow-xl flex flex-col">
                                    <div className="flex items-center justify-between mb-4 px-2">
                                        <h3 className="text-white font-semibold text-base">Original Footage</h3>
                                        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Source</span>
                                    </div>
                                    <div className="relative rounded-2xl overflow-hidden bg-black border border-gray-800 flex-1">
                                        <CldVideoPlayer
                                            id={`player-original-${videoId}`}
                                            width="1920"
                                            height="1080"
                                            src={videoId}
                                        />
                                    </div>
                                </div>
                                {/* Result */}
                                <div className="bg-gray-900/50 border border-teal-900/30 rounded-3xl p-4 shadow-[0_10px_40px_rgba(20,184,166,0.1)] flex flex-col">
                                    <div className="flex items-center justify-between mb-4 px-2">
                                        <h3 className="text-teal-400 font-bold text-base flex items-center gap-2">
                                            <Sparkles className="w-4 h-4" /> Synthesized Result
                                        </h3>
                                        <span className="text-xs text-teal-500/60 uppercase tracking-wider font-semibold">AI Generated</span>
                                    </div>
                                    <div className="relative rounded-2xl overflow-hidden bg-black border border-teal-800/50 flex-1 shadow-[0_0_20px_rgba(20,184,166,0.15)] flex items-center justify-center">
                                         {/* Cloudinary Result Video */}
                                         <CldVideoPlayer
                                            id={`player-result-${DEMO_RESULT_PUBLIC_ID}`}
                                            width="1920"
                                            height="1080"
                                            src={DEMO_RESULT_PUBLIC_ID}
                                         />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-900/50 border border-teal-900/30 rounded-3xl p-4 overflow-hidden shadow-2xl w-full max-w-4xl mx-auto">
                                <div className="flex items-center justify-between mb-4 px-2">
                                    <h3 className="text-white font-semibold flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 text-teal-400 animate-spin" />
                                        Analyzing Source Video...
                                    </h3>
                                </div>
                                <div className="relative rounded-2xl overflow-hidden bg-black border border-gray-800 opacity-60 pointer-events-none filter grayscale hover:grayscale-0 transition-all duration-1000">
                                    <CldVideoPlayer
                                        id={`player-preview-${videoId}`}
                                        width="1920"
                                        height="1080"
                                        src={videoId}
                                    />
                                    {/* Overlay making it look like it's scanning */}
                                    <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay"></div>
                                    <div className="absolute top-0 left-0 w-full h-1 bg-teal-400/50 shadow-[0_0_20px_rgba(45,212,191,1)] animate-scan"></div>
                                </div>
                            </div>
                        )}

                        {/* Pipeline Stages centered below */}
                        <AnimatePresence>
                            {(pipelineActive || pipelineComplete) && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8 max-w-4xl w-full mx-auto"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-white">AdSwap Pipeline</h2>
                                            <p className="text-sm text-gray-500 mt-1">Real-time processing via Gemini, WaveSpeed & Cloudinary</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {PIPELINE_STEPS.map((step, index) => {
                                            const state = getStepState(index);
                                            return (
                                                <motion.div
                                                    key={step.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className={`rounded-2xl border p-5 transition-all duration-700 h-full flex flex-col ${
                                                        state === "complete"
                                                            ? "border-teal-500/40 bg-teal-500/10 shadow-[0_0_15px_rgba(20,184,166,0.1)]"
                                                            : state === "active"
                                                                ? "border-blue-500/40 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.1)] relative overflow-hidden"
                                                                : "border-gray-800 bg-black/40 opacity-50"
                                                    }`}
                                                >
                                                    {state === "active" && (
                                                         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-blue-400/10 to-transparent -translate-x-full animate-shimmer" />
                                                    )}
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="shrink-0">
                                                            {state === "complete" ? (
                                                                <CheckCircle2 className="w-6 h-6 text-teal-400" />
                                                            ) : state === "active" ? (
                                                                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                                                            ) : (
                                                                <Circle className="w-6 h-6 text-gray-600" />
                                                            )}
                                                        </div>
                                                        <p className="font-semibold text-white leading-tight">{step.title}</p>
                                                    </div>
                                                    <p className="text-sm text-gray-400 flex-1">{step.description}</p>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Bottom action */}
                        {pipelineComplete && (
                             <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex justify-center mt-4 w-full"
                             >
                                <Link href="/select-video" passHref>
                                    <button className="flex items-center gap-2 bg-gray-800 text-white border border-gray-700 px-6 py-3 rounded-full font-medium transition-colors hover:bg-gray-700 hover:text-white">
                                        <FolderPlus className="w-5 h-5 mr-1" />
                                        Process Another Video
                                    </button>
                                </Link>
                             </motion.div>
                        )}
                    </div>
                </motion.div>
            )}
            
            {/* Custom CSS for Animations */}
            <style jsx global>{`
                @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .animate-scan {
                    animation: scan 2s linear infinite;
                }
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
            `}</style>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <DashboardLayout>
            <Suspense
                fallback={
                    <div className="h-full w-full flex items-center justify-center min-h-screen">
                        <span className="w-8 h-8 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
                    </div>
                }
            >
                <DashboardContent />
            </Suspense>
        </DashboardLayout>
    );
}
