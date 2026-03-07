"use client";

import { useState } from "react";
import { UploadCloud, Loader2, Sparkles, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PipelineUploaderProps {
    onComplete: (videoUrl: string) => void;
}

export default function PipelineUploader({ onComplete }: PipelineUploaderProps) {
    const [file, setFile] = useState<File | null>(null);
    const [brand, setBrand] = useState("Coca-Cola");
    const [productName, setProductName] = useState("classic red Coca-Cola can");
    const [status, setStatus] = useState<"idle" | "uploading" | "analyzing" | "generating" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleStartPipeline = async () => {
        if (!file || !brand || !productName) return;

        setStatus("uploading");
        setErrorMessage("");

        try {
            const formData = new FormData();
            formData.append("video", file);
            formData.append("brand", brand);
            formData.append("productName", productName);

            // Give user visual feedback that upload finished and Gemini is analyzing
            setTimeout(() => setStatus("analyzing"), 3000);

            // This is a long-standing request combining upload, DB, Gemini, FFMPEG, and WaveSpeed
            const res = await fetch("/api/process-video", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to process video");
            }

            // Simulate the switch to WaveSpeed rendering for UI effect (since fetch blocks)
            setStatus("generating");

            const data = await res.json();

            setStatus("success");
            setTimeout(() => {
                onComplete(data.final_video_url);
            }, 1000);

        } catch (error: any) {
            setStatus("error");
            setErrorMessage(error.message || "An unknown error occurred during generation.");
        }
    };

    return (
        <div className="w-full bg-black border-2 border-dashed border-teal-900/50 rounded-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden transition-all hover:border-teal-500/50">
            <AnimatePresence mode="wait">
                {status === "idle" && (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center w-full"
                    >
                        <UploadCloud className="w-12 h-12 text-teal-500 mb-4" />
                        <h3 className="text-xl font-semibold mb-2 text-white">Upload Video for GenAI Integration</h3>
                        <p className="text-gray-400 text-sm text-center mb-6">
                            Upload a raw video (MP4/MOV). Gemini will detect ad slots and WaveSpeed will generate the product.
                        </p>

                        <div className="w-full space-y-4 max-w-sm mb-6">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-teal-400 font-medium">Brand Name</label>
                                <input
                                    type="text"
                                    value={brand}
                                    onChange={(e) => setBrand(e.target.value)}
                                    className="px-4 py-2 bg-gray-900 border border-teal-900/30 rounded-lg text-white outline-none focus:border-teal-500 transition-colors"
                                    placeholder="e.g. Coca-Cola"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-teal-400 font-medium">Product Description</label>
                                <input
                                    type="text"
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                    className="px-4 py-2 bg-gray-900 border border-teal-900/30 rounded-lg text-white outline-none focus:border-teal-500 transition-colors"
                                    placeholder="e.g. classic red can"
                                />
                            </div>
                        </div>

                        <label className="cursor-pointer">
                            <div className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl transition-colors shadow-[0_0_15px_rgba(20,184,166,0.2)]">
                                {file ? file.name : "Select Video File"}
                            </div>
                            <input
                                type="file"
                                accept="video/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>

                        {file && (
                            <button
                                onClick={handleStartPipeline}
                                className="mt-4 px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
                            >
                                <Sparkles className="w-4 h-4" />
                                Start AI Pipeline
                            </button>
                        )}
                    </motion.div>
                )}

                {status === "uploading" && (
                    <motion.div
                        key="uploading"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center py-10"
                    >
                        <Loader2 className="w-12 h-12 text-teal-500 animate-spin mb-4" />
                        <h3 className="text-xl font-semibold text-white">Uploading Video...</h3>
                        <p className="text-gray-400 mt-2">Sending large video payload to the processing server.</p>
                    </motion.div>
                )}

                {status === "analyzing" && (
                    <motion.div
                        key="analyzing"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center py-10"
                    >
                        <Sparkles className="w-12 h-12 text-blue-500 animate-pulse mb-4" />
                        <h3 className="text-xl font-semibold text-white">Gemini 2.5 Flash is Analyzing...</h3>
                        <p className="text-gray-400 mt-2">Scanning video semantics for natural product placement slots.</p>
                    </motion.div>
                )}

                {status === "generating" && (
                    <motion.div
                        key="generating"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center py-10"
                    >
                        <div className="relative w-12 h-12 mb-4">
                            <div className="absolute inset-0 border-4 border-teal-500/20 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <h3 className="text-xl font-semibold text-white">WaveSpeed AI Rendering...</h3>
                        <p className="text-gray-400 mt-2">Applying Wan 2.5 generative video models. This may take a few minutes.</p>
                    </motion.div>
                )}

                {status === "error" && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center py-10"
                    >
                        <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                            <span className="text-red-500 text-2xl">!</span>
                        </div>
                        <h3 className="text-xl font-semibold text-white">Pipeline Failed</h3>
                        <p className="text-red-400 mt-2 text-center max-w-sm">{errorMessage}</p>
                        <button
                            onClick={() => setStatus("idle")}
                            className="mt-6 px-6 py-2 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            Try Again
                        </button>
                    </motion.div>
                )}

                {status === "success" && (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center py-10"
                    >
                        <CheckCircle className="w-12 h-12 text-teal-400 mb-4" />
                        <h3 className="text-xl font-semibold text-white">Generation Complete!</h3>
                        <p className="text-gray-400 mt-2">Redirecting to project dashboard...</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
