"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, UploadCloud, Film } from "lucide-react";
import { motion } from "framer-motion";
import VideoUploader from "@/components/VideoUploader";
import SearchBar from "@/components/SearchBar";
import MovieCard from "@/components/MovieCard";
import { useRouter } from "next/navigation";

interface Movie {
    imdbID: string;
    Title: string;
    Year: string;
    Poster: string;
    Type: string;
}

export default function SelectVideoPage() {
    const router = useRouter();
    const [selection, setSelection] = useState<"upload" | "catalog" | null>(null);
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSearch = async (query: string) => {
        if (!query.trim()) return;
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/movies/search?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (data.Search) {
                setMovies(data.Search);
            } else {
                setMovies([]);
                setError(data.Error || "No results found.");
            }
        } catch {
            setError("Failed to fetch results. Is the backend running?");
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = (publicId: string) => {
        // Automatically route to library or dashboard with the new video
        router.push(`/dashboard?videoId=${publicId}`);
    };

    return (
        <div className="min-h-screen bg-black text-white relative flex flex-col items-center">
            {/* Top Navigation */}
            <div className="absolute top-0 w-full p-6 flex justify-between items-center z-50">
                <Link href="/create">
                    <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back</span>
                    </button>
                </Link>
                <Link href="/create">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-900/30 text-teal-400 border border-teal-500/30 hover:bg-teal-900/50 transition-colors">
                        <Plus className="w-4 h-4" />
                        <span>Create Project</span>
                    </button>
                </Link>
            </div>

            {/* Main Content */}
            <div className="flex-1 w-full max-w-5xl px-4 py-24 flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Select Source Media</h1>
                    <p className="text-gray-400 text-lg">Choose where you want to import your video from.</p>
                </motion.div>

                {!selection ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl"
                    >
                        {/* Upload Card */}
                        <div
                            onClick={() => setSelection("upload")}
                            className="bg-gradient-to-b from-gray-900 to-black border border-teal-900/30 hover:border-teal-500/40 rounded-2xl p-10 cursor-pointer group transition-all transform hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(20,184,166,0.1)] flex flex-col items-center text-center"
                        >
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center mb-6 shadow-lg group-hover:shadow-[0_0_20px_rgba(20,184,166,0.5)] transition-shadow">
                                <UploadCloud className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-2xl font-semibold mb-3">Upload Your Own Video</h2>
                            <p className="text-gray-400">Upload a video file from your computer (MP4, MOV, WebM).</p>
                        </div>

                        {/* Catalog Card */}
                        <div
                            onClick={() => setSelection("catalog")}
                            className="bg-gradient-to-b from-gray-900 to-black border border-teal-900/30 hover:border-teal-500/40 rounded-2xl p-10 cursor-pointer group transition-all transform hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(20,184,166,0.1)] flex flex-col items-center text-center"
                        >
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center mb-6 shadow-lg group-hover:shadow-[0_0_20px_rgba(20,184,166,0.5)] transition-shadow">
                                <Film className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-2xl font-semibold mb-3">Choose from Our Catalog</h2>
                            <p className="text-gray-400">Search our connected database of existing films and videos.</p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-4xl bg-gray-900/50 border border-teal-900/30 rounded-2xl p-8"
                    >
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-800">
                            <h2 className="text-2xl font-semibold">
                                {selection === "upload" ? "Upload Media" : "Search Catalog"}
                            </h2>
                            <button
                                onClick={() => setSelection(null)}
                                className="text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                        </div>

                        {selection === "upload" && (
                            <div className="flex justify-center w-full">
                                <div className="w-full max-w-md [&>div]:w-full [&>div]:bg-black [&>div]:border-2 [&>div]:border-dashed [&>div]:border-teal-900/50 hover:[&>div]:border-teal-500/50 [&>div]:rounded-2xl transition-all">
                                    <VideoUploader onUpload={handleUpload} />
                                </div>
                            </div>
                        )}

                        {selection === "catalog" && (
                            <div className="flex flex-col gap-6 w-full">
                                <div className="max-w-xl mx-auto w-full">
                                    <SearchBar onSearch={handleSearch} loading={loading} />
                                </div>
                                {error && <p className="text-red-400 text-center">{error}</p>}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-4">
                                    {movies.map((movie) => (
                                        <div key={movie.imdbID} className="group relative overflow-hidden rounded-xl border border-gray-800 hover:border-teal-500/50 transition-colors cursor-pointer" onClick={() => handleUpload(movie.imdbID)}>
                                            <MovieCard movie={movie} />
                                            <div className="absolute inset-0 bg-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                <button className="px-4 py-2 bg-teal-500 text-white font-semibold rounded-lg shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                                    Select
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
