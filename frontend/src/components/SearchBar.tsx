"use client";

import { useState } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
    onSearch: (query: string) => void;
    loading?: boolean;
}

export default function SearchBar({ onSearch, loading }: SearchBarProps) {
    const [query, setQuery] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <form onSubmit={handleSubmit} className="relative w-full">
            <input
                id="movie-search"
                type="text"
                className="w-full bg-black border border-gray-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl py-4 pl-6 pr-32 text-white placeholder-gray-600 outline-none transition-all shadow-lg"
                placeholder="Search movies by title (e.g. Inception)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={loading}
            />
            <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-2 bottom-2 px-6 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(20,184,166,0.2)]"
            >
                {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        <Search className="w-4 h-4" />
                        <span className="hidden sm:inline">Search</span>
                    </>
                )}
            </button>
        </form>
    );
}
