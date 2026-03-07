"use client";

import { CldUploadWidget } from "next-cloudinary";
import { UploadCloud } from "lucide-react";

interface VideoUploaderProps {
    onUpload: (publicId: string) => void;
}

export default function VideoUploader({ onUpload }: VideoUploaderProps) {
    return (
        <CldUploadWidget
            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "vpp_unsigned"}
            options={{
                sources: ["local", "url", "camera"],
                resourceType: "video",
                maxFileSize: 500_000_000, // 500 MB
                clientAllowedFormats: ["mp4", "mov", "avi", "webm"],
            }}
            onSuccess={(result: any) => {
                if (result?.info?.public_id) {
                    onUpload(result.info.public_id);
                }
            }}
        >
            {({ open }) => (
                <div
                    onClick={() => open()}
                    className="w-full border-2 border-dashed border-teal-900/50 hover:border-teal-500/50 bg-black hover:bg-teal-900/10 rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all group shadow-inner"
                >
                    <div className="w-20 h-20 rounded-full bg-teal-900/30 group-hover:bg-teal-800/40 flex items-center justify-center mb-6 transition-colors">
                        <UploadCloud className="w-10 h-10 text-teal-400 group-hover:text-teal-300 transition-colors" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-teal-400 transition-colors">
                        Click to upload or drag and drop
                    </h3>
                    <p className="text-gray-500 text-sm">
                        MP4, MOV, AVI, WebM · Max 500 MB
                    </p>
                </div>
            )}
        </CldUploadWidget>
    );
}
