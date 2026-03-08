"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import SearchBar from "@/components/SearchBar";
import MovieCard from "@/components/MovieCard";
import { useRouter } from "next/navigation";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";

const defaultMovies: Movie[] = [
    {
        imdbID: "tt0144084",
        Title: "American Psycho",
        Year: "2000",
        Poster: "https://m.media-amazon.com/images/M/MV5BNzBjM2I5ZjUtNmIzNy00OGNkLWIwZDMtOTAwYWUwMzA2YjdlXkEyXkFqcGc@._V1_SX300.jpg",
        Type: "movie"
    },
    {
        imdbID: "tt0133093",
        Title: "The Matrix",
        Year: "1999",
        Poster: "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
        Type: "movie"
    },
    {
        imdbID: "tt0816692",
        Title: "Interstellar",
        Year: "2014",
        Poster: "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg",
        Type: "movie"
    },
    {
        imdbID: "tt0468569",
        Title: "The Dark Knight",
        Year: "2008",
        Poster: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg",
        Type: "movie"
    },
    {
        imdbID: "tt1375666",
        Title: "Inception",
        Year: "2010",
        Poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
        Type: "movie"
    }
];

interface Movie {
    imdbID: string;
    Title: string;
    Year: string;
    Poster: string;
    Type: string;
}

export default function CatalogPage() {
    const router = useRouter();
    const [movies, setMovies] = useState<Movie[]>(defaultMovies);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [hasSearched, setHasSearched] = useState(false);

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
            setHasSearched(true);
        } catch {
            setError("Failed to fetch results. Is the backend running?");
            setMovies([]);
            setHasSearched(true);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = async (publicId: string, title?: string) => {
        try {
            // Non-blocking ingest call
            fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/videos/ingest`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    imdb_id: publicId,
                    cloudinary_public_id: publicId,
                    title: title || "Catalog Selection",
                }),
            }).catch(() => {});
        } catch {
            // Ignore any sync errors
        }
        router.push(`/catalog/watch/${publicId}`);
    };

    return (
        <DashboardLayout>
            <div className="relative min-h-[calc(100vh-4rem)] w-full bg-black overflow-hidden flex flex-col items-center">
                {/* Background Details */}
                <div className="absolute inset-0 z-0">
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

                <div className="relative z-10 w-full max-w-7xl mx-auto flex-1 overflow-y-auto pb-24 px-4 sm:px-8 py-12">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Choose from Our Catalog</h1>
                        <p className="text-gray-400 text-lg">Search our connected OMdb database for existing films and videos.</p>
                    </div>

                    <div className="flex flex-col gap-8 w-full items-center">
                        <div className="max-w-2xl w-full">
                            <SearchBar onSearch={handleSearch} loading={loading} />
                        </div>
                        
                        {error && <p className="text-red-400 text-center">{error}</p>}
                        
                        
                        {movies.length > 0 && (
                            <div className="w-full">
                                {!hasSearched && (
                                    <h2 className="text-xl font-semibold mb-6 text-gray-300 text-left w-full pl-2 border-l-4 border-teal-500">
                                        Suggestions
                                    </h2>
                                )}
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mt-2 w-full">
                                    {movies.map((movie) => (
                                        <div 
                                            key={movie.imdbID} 
                                            className="group relative overflow-hidden rounded-xl border border-gray-800 hover:border-teal-500/50 transition-colors cursor-pointer shadow-lg aspect-[2/3]" 
                                            onClick={() => handleSelect(movie.imdbID, movie.Title)}
                                        >
                                            <MovieCard movie={movie} />
                                            <div className="absolute inset-0 bg-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                <button className="px-4 py-2 bg-teal-500 text-white font-semibold rounded-lg shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                                    Play
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {movies.length === 0 && !loading && !error && hasSearched && (
                            <div className="text-gray-500 text-center mt-12">
                                <p>No movies found. Try another search.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
