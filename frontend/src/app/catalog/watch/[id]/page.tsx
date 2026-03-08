"use client";

import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { ChevronLeft, Video } from "lucide-react";
import VideoPlayer from "@/components/ui/video-player";

export default function WatchPage() {
    const params = useParams();
    const router = useRouter();
    const imdbId = params.id as string;
    
    // Local Thor diner scene demo video instead of fetching actual movie from iframe
    const demoVideoSrc = "/thor.mp4";

    return (
        <DashboardLayout>
            <div className="relative min-h-[calc(100vh-4rem)] w-full bg-black flex flex-col items-center">
                {/* Background Details */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <BackgroundGradientAnimation
                        gradientBackgroundStart="rgb(5, 5, 5)"
                        gradientBackgroundEnd="rgb(10, 20, 30)"
                        firstColor="13, 148, 136" // teal-600
                        secondColor="20, 184, 166" // teal-500
                        thirdColor="30, 41, 59" // slate-800
                        fourthColor="15, 118, 110" // teal-700
                        fifthColor="2, 6, 23" // slate-950
                        pointerColor="255, 255, 255"
                        size="100%"
                        blendingValue="hard-light"
                        interactive={false}
                        containerClassName="absolute inset-0 opacity-20"
                    />
                </div>

                <div className="relative z-10 w-full max-w-6xl mx-auto flex-1 flex flex-col p-4 sm:p-8 pt-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <button 
                            onClick={() => router.push("/catalog")}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-lg backdrop-blur-md border border-white/10"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            Back to Catalog
                        </button>

                        <div className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 px-4 py-2 rounded-lg text-teal-400">
                            <Video className="w-4 h-4" />
                            <span className="text-sm font-medium tracking-wide uppercase">Source OMDB: {imdbId}</span>
                        </div>
                    </div>

                    {/* Custom Advanced Video Player with Built-in faux AI Rendering animations */}
                    <div className="w-full relative z-10 flex flex-col gap-8 mt-4">
                        <VideoPlayer src={demoVideoSrc} />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
