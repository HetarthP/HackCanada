import Image from "next/image";

interface MovieCardProps {
    movie: {
        imdbID: string;
        Title: string;
        Year: string;
        Poster: string;
        Type: string;
    };
}

export default function MovieCard({ movie }: MovieCardProps) {
    const posterSrc = movie.Poster !== "N/A" ? movie.Poster : "/placeholder-poster.png";

    return (
        <div className="flex flex-col h-full bg-gray-900 shadow-xl overflow-hidden w-full">
            <div className="relative w-full aspect-[2/3]">
                <Image
                    src={posterSrc}
                    alt={`${movie.Title} poster`}
                    fill
                    className="object-cover"
                    unoptimized
                />
            </div>
            <div className="p-4 flex flex-col flex-1 bg-gradient-to-t from-black to-gray-900">
                <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{movie.Title}</h3>
                <p className="text-sm text-gray-400 capitalize">
                    {movie.Year} · {movie.Type}
                </p>
                <p className="text-xs text-teal-500/50 mt-auto pt-2 font-mono">
                    ID: {movie.imdbID}
                </p>
            </div>
        </div>
    );
}
