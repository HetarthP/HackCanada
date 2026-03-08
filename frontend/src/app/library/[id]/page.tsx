"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card-v2";
import { Button } from "@/components/ui/button";
import VideoPlayer from "@/components/ui/video-player";
import {
    ChevronLeft,
    Send,
    Scan,
    DollarSign,
    Target,
    Target as TargetIcon,
    AlertCircle,
    Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function VideoAnalysisPage() {
    const params = useParams();
    const router = useRouter();
    const videoId = params.id as string;

    const [analysis, setAnalysis] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMediaReady, setIsMediaReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const playerRef = useRef<any>(null); // To handle seeking

    const [brandContext, setBrandContext] = useState({
        brand_name: "Tim Hortons",
        industry: "Coffee & Food",
        budget: "$100,000",
        target_demo: "All demographics",
        tone: "Warm, welcoming, iconic",
        goals: "Seamless product integration in high-visibility content",
        product_image_url: "/tims.png"
    });

    // Served directly from Next.js public folder for instant loading
    const VIDEO_SRC = "/espresso.mp4";
    const API_VIDEO_SRC = "http://localhost:8000/api/video-stream/espresso.mp4";

    useEffect(() => {
        async function fetchAnalysis() {
            try {
                // Fetch from the real backend analyzer which uses the new Gemini implementation
                const response = await fetch("http://localhost:8000/api/render/analyze", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        video_url: API_VIDEO_SRC,
                        product_image_url: brandContext.product_image_url,
                        user_id: "auth0|default"
                    })
                });

                if (!response.ok) {
                    throw new Error("Analysis failed with status " + response.status);
                }

                const data = await response.json();

                // Enforce 5-second buffering screen for UX
                setTimeout(() => {
                    setAnalysis(data);
                    setIsLoading(false);
                    setIsMediaReady(true);
                }, 5000);

            } catch (error: any) {
                console.error("Failed to set analysis:", error);
                setError(error.message || "Failed to load AI Analysis.");
                setIsLoading(false);
            }
        }
        fetchAnalysis();
    }, [videoId]);

    const handleSlotClick = (slot: any) => {
        setActiveSlotId(slot.id);
        if (playerRef.current) {
            playerRef.current.seekToTimestamp(slot.start_time);
        }
    };

    const currentSlots = (analysis?.detected_slots || []).slice(0, 5);
    const summary = analysis?.summary || { total_slots: 0, est_revenue: "$0", avg_confidence: "0%" };
    const showLoading = (isLoading || !isMediaReady) && !error;

    return (
        <DashboardLayout>
            {/* 1. Loader Overlay: Stay exactly 5 seconds */}
            {showLoading && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black gap-4 animate-in fade-in duration-500">
                    <div className="relative w-24 h-24">
                        <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin" />
                        <div className="absolute inset-2 rounded-full border-b-2 border-teal-500 animate-spin-slow" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] font-mono text-indigo-400 animate-pulse">AI</span>
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-white font-bold text-lg mb-1 tracking-tight">PROFILING SCENE...</p>
                        <p className="text-gray-500 font-mono text-[10px] animate-pulse uppercase tracking-[0.2em]">
                            {isLoading ? "GEMINI STRATEGIC SCAN IN PROGRESS" : "SYNCING VIDEO BUFFER"}
                        </p>
                    </div>
                </div>
            )}

            {/* 2. Main UI: Mounted behind loader with opacity transition */}
            <div className={cn(
                "relative min-h-screen w-full bg-[#050505] text-white p-8 overflow-x-hidden transition-opacity duration-1000",
                showLoading ? "opacity-0" : "opacity-100"
            )}>
                {/* Header */}
                <button
                    onClick={() => router.push("/library")}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Back to Library</span>
                </button>

                <div className="max-w-[1640px] mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold mb-2 tracking-tight">Espresso Scene Diagnostic</h1>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5">GEMINI 1.5 PRO</span>
                                <span className="w-1 h-1 rounded-full bg-gray-700" />
                                <span>Real-time Strategic Scan</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-end mr-4">
                                <span className="text-[10px] text-gray-500 uppercase tracking-widest leading-none mb-1">Target Product</span>
                                <span className="text-sm font-bold text-teal-400">{brandContext.brand_name}</span>
                            </div>
                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10">
                                <img src={brandContext.product_image_url} className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Main Player Area */}
                        <div className="lg:col-span-8 space-y-6">
                            <div className="relative rounded-2xl overflow-hidden border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                                <VideoPlayer
                                    ref={playerRef}
                                    src={VIDEO_SRC}
                                    onCanPlay={() => setIsMediaReady(true)}
                                    onLoadedMetadata={() => setIsMediaReady(true)}
                                    onError={() => {
                                        console.error("Video failed to load");
                                        setIsMediaReady(true); // Proceed anyway to show UI
                                    }}
                                    onTimeUpdate={(t) => setCurrentTime(t)}
                                    markers={currentSlots.map((s: any) => ({
                                        timestamp: s.start_time,
                                        id: s.id
                                    }))}
                                />
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card className="p-5 bg-white/[0.02] border-white/[0.05] flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/10">
                                        <Scan className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold">{summary.total_slots}</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Detected Slots</p>
                                    </div>
                                </Card>
                                <Card className="p-5 bg-white/[0.02] border-white/[0.05] flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 border border-teal-500/10">
                                        <DollarSign className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold">{summary.est_revenue}</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Est. Revenue</p>
                                    </div>
                                </Card>
                                <Card className="p-5 bg-white/[0.02] border-white/[0.05] flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/10">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold">{summary.avg_confidence}</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Diag. Confidence</p>
                                    </div>
                                </Card>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-4 flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                    <TargetIcon className="w-3 h-3" />
                                    Strategic Opps
                                </h2>
                                <Button size="sm" className="bg-teal-600 hover:bg-teal-700 h-7 text-[10px] uppercase font-bold tracking-widest">
                                    Export All
                                </Button>
                            </div>

                            {error ? (
                                <Card className="p-8 border-red-500/20 bg-red-500/5 flex flex-col items-center justify-center text-center">
                                    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                                    <h3 className="text-lg font-bold text-red-400 mb-2">Analysis Failed</h3>
                                    <p className="text-sm text-red-200/80 mb-6">{error}</p>
                                    <Button onClick={() => window.location.reload()} className="bg-red-500 hover:bg-red-600 text-white font-bold w-full">
                                        Retry Scan
                                    </Button>
                                </Card>
                            ) : (
                                <div className="space-y-4 overflow-y-auto pr-1 max-h-[700px] custom-scrollbar">
                                    <AnimatePresence>
                                        {currentSlots.map((slot: any) => (
                                            <motion.div
                                                key={slot.id}
                                                layout
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                onClick={() => handleSlotClick(slot)}
                                            >
                                                <Card className={cn(
                                                    "p-4 transition-all cursor-pointer border-white/[0.03] group relative overflow-hidden",
                                                    activeSlotId === slot.id ? "bg-indigo-500/10 border-indigo-500/30 ring-1 ring-indigo-500/20" : "bg-white/[0.03] hover:bg-white/[0.05]"
                                                )}>
                                                    <div className={cn(
                                                        "absolute left-0 top-0 bottom-0 w-1",
                                                        activeSlotId === slot.id ? "bg-teal-400" : "bg-white/5 group-hover:bg-white/20"
                                                    )} />

                                                    <div className="flex justify-between items-start mb-2 ml-2">
                                                        <span className="text-[10px] font-mono text-indigo-400 px-1.5 py-0.5 bg-indigo-500/10 rounded">
                                                            {slot.timestamp}
                                                        </span>
                                                        <span className="text-[10px] text-gray-500 uppercase font-black">{slot.category}</span>
                                                    </div>

                                                    <h3 className="text-[13px] font-bold mb-2 ml-2 leading-tight group-hover:text-indigo-300 transition-colors">
                                                        {slot.description}
                                                    </h3>

                                                    <div className="flex items-center gap-4 ml-2 mb-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-[9px] text-gray-600 uppercase tracking-tighter mb-0.5">Ctx. Fit</span>
                                                            <div className="flex gap-0.5">
                                                                {[...Array(10)].map((_, i) => (
                                                                    <div key={i} className={cn("w-1.5 h-1 rounded-[1px]", i < slot.fit_rating ? "bg-teal-500" : "bg-white/10")} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[9px] text-gray-600 uppercase tracking-tighter mb-0.5">Tech Score</span>
                                                            <div className="flex gap-0.5">
                                                                {[...Array(10)].map((_, i) => (
                                                                    <div key={i} className={cn("w-1.5 h-1 rounded-[1px]", i < slot.accuracy_rating ? "bg-indigo-500" : "bg-white/10")} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between ml-2">
                                                        <span className="text-sm font-black text-white">{slot.revenue_est}</span>
                                                        <Button
                                                            variant="ghost"
                                                            className="h-6 text-[9px] uppercase tracking-widest text-indigo-400 hover:text-white hover:bg-indigo-500 p-0 px-2"
                                                        >
                                                            Queue Placement
                                                        </Button>
                                                    </div>
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}

                            <Card className="p-4 bg-teal-500/5 border-teal-500/20">
                                <div className="flex gap-3">
                                    <AlertCircle className="w-4 h-4 text-teal-500 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] text-teal-200/80 font-bold mb-1 uppercase tracking-wider">AI Reasoning</p>
                                        <p className="text-[11px] text-gray-400 leading-relaxed italic">
                                            "Targeting high-traffic areas near neutral surfaces to minimize occlusion artifacting during V2V inpainting."
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(-360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 3s linear infinite;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #1a1a1a;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #222;
                }
            `}</style>
        </DashboardLayout>
    );
}
