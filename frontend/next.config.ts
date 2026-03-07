import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
            },
            {
                protocol: "https",
                hostname: "m.media-amazon.com", // OMDb poster images
            },
        ],
    },
    env: {
        NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:
            process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    },
    // Prevent Next.js from trying to bundle Node.js-only ffmpeg binaries into the client bundle
    serverExternalPackages: ["fluent-ffmpeg", "@ffmpeg-installer/ffmpeg", "@ffmpeg-installer/darwin-arm64"],
};

export default nextConfig;
