"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { cn } from "@/lib/utils";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { FolderKanban, CheckCircle2, Clock, PlayCircle, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";

export default function LibraryPage() {
    // Mock data for UI demonstration
    const stats = [
        { label: "Total Projects", value: "24", icon: FolderKanban, color: "text-blue-400" },
        { label: "Completed", value: "18", icon: CheckCircle2, color: "text-teal-400" },
        { label: "In Progress", value: "6", icon: Clock, color: "text-yellow-400" },
    ];

    const projects = [
        { id: 1, title: "Summer Campaign 2024", duration: "02:45", status: "completed", thumbnail: "https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&q=80&w=800", date: "Oct 24, 2024" },
        { id: 2, title: "Product Launch Teaser", duration: "01:15", status: "processing", thumbnail: "https://images.unsplash.com/photo-1563298723-dcfebaa392e3?auto=format&fit=crop&q=80&w=800", date: "Oct 22, 2024" },
        { id: 3, title: "Social Media Ad V2", duration: "00:30", status: "completed", thumbnail: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=800", date: "Oct 18, 2024" },
        { id: 4, title: "Internal Training Q3", duration: "12:20", status: "completed", thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800", date: "Oct 15, 2024" },
        { id: 5, title: "Holiday Promo Concept", duration: "03:10", status: "processing", thumbnail: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800", date: "Oct 10, 2024" },
        { id: 6, title: "Influencer Recap", duration: "05:45", status: "completed", thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800", date: "Oct 05, 2024" },
    ];

    return (
        <DashboardLayout>
            <div className="relative min-h-screen w-full bg-black">
                {/* Background Gradient Animation Layer */}
                <div className="absolute inset-0 z-0">
                    <BackgroundGradientAnimation
                        gradientBackgroundStart="rgb(0, 0, 0)"
                        gradientBackgroundEnd="rgb(0, 20, 20)"
                        firstColor="13, 148, 136"
                        secondColor="20, 184, 166"
                        thirdColor="45, 212, 191"
                        fourthColor="15, 118, 110"
                        fifthColor="94, 234, 212"
                        pointerColor="20, 184, 166"
                        size="70%"
                        blendingValue="hard-light"
                        interactive={false}
                        containerClassName="absolute inset-0 opacity-40"
                    />
                </div>
                {/* Animated Grid Pattern Overlay */}
                <AnimatedGridPattern
                    numSquares={40}
                    maxOpacity={0.3}
                    duration={1.5}
                    repeatDelay={0.3}
                    className={cn(
                        "fill-teal-400/50 stroke-teal-400/40",
                        "[mask-image:radial-gradient(900px_circle_at_center,white,transparent)]",
                        "inset-x-0 inset-y-[-10%] h-[120%] z-[1]",
                    )}
                />
                <div className="relative z-10 p-8 max-w-7xl mx-auto w-full flex-1">
                    <div className="mb-10">
                        <h1 className="text-3xl font-bold text-white mb-2">Video Library</h1>
                        <p className="text-gray-400">Manage your product placement projects and track processing status.</p>
                    </div>

                    {/* Stats Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {stats.map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: idx * 0.1 }}
                                className="relative rounded-2xl border border-teal-900/30 p-[1px]"
                            >
                                <GlowingEffect
                                    spread={40}
                                    glow={true}
                                    disabled={false}
                                    proximity={64}
                                    inactiveZone={0.01}
                                    borderWidth={2}
                                />
                                <div className="relative bg-gray-900 rounded-2xl p-6 flex items-center justify-between backdrop-blur-xl">
                                    <div>
                                        <p className="text-gray-400 text-sm font-medium mb-1">{stat.label}</p>
                                        <p className="text-3xl font-bold text-white">{stat.value}</p>
                                    </div>
                                    <div className={`w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center ${stat.color}`}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Projects Grid */}
                    <h2 className="text-xl font-semibold text-white mb-6">Recent Projects</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project, idx) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, delay: 0.2 + idx * 0.05 }}
                                className="relative rounded-2xl border border-gray-800 p-[1px] group cursor-pointer"
                            >
                                <GlowingEffect
                                    spread={40}
                                    glow={true}
                                    disabled={false}
                                    proximity={64}
                                    inactiveZone={0.01}
                                    borderWidth={2}
                                />
                                <div className="relative bg-gray-900 rounded-2xl overflow-hidden transition-all hover:shadow-[0_8px_30px_rgba(20,184,166,0.1)] backdrop-blur-xl">
                                    <div className="relative aspect-video w-full bg-gray-800 overflow-hidden">
                                        <img
                                            src={project.thumbnail}
                                            alt={project.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                                        <div className="absolute top-3 w-full px-3 flex justify-between items-start">
                                            <div className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-xs font-medium text-white flex items-center gap-1.5 border border-white/10">
                                                <Clock className="w-3 h-3" />
                                                {project.duration}
                                            </div>
                                            <button className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="w-12 h-12 rounded-full bg-teal-500/90 text-white flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all">
                                                <PlayCircle className="w-6 h-6 ml-1" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold text-white mb-1 truncate">{project.title}</h3>
                                        <div className="flex items-center justify-between mt-3">
                                            <span className="text-xs text-gray-400">{project.date}</span>
                                            {project.status === "completed" ? (
                                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-teal-500/10 text-teal-400 border border-teal-500/20">
                                                    Completed
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                                                    Processing
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
