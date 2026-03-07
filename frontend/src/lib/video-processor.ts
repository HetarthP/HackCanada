import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import { v2 as cloudinary } from "cloudinary";
import path from "path";
import os from "os";
import fs from "fs/promises";
import { randomUUID } from "crypto";

// Configure fluent-ffmpeg to use the statically installed local binary
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// Configure Cloudinary explicitly rather than relying solely on NEXT_PUBLIC
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "",
    api_key: process.env.CLOUDINARY_API_KEY || "",
    api_secret: process.env.CLOUDINARY_API_SECRET || "",
});

export class VideoProcessor {
    /**
     * Slices a precise segment out of a video file locally using FFMPEG.
     * Returns the absolute path to the local output file.
     */
    static async sliceSegment(
        inputFilePath: string,
        startTimeSeconds: number,
        durationSeconds: number
    ): Promise<string> {
        const tempDir = os.tmpdir();
        const outputPath = path.join(tempDir, `adswap_slice_${randomUUID()}.mp4`);

        console.log(`[FFMPEG] Slicing video from ${startTimeSeconds}s for ${durationSeconds}s...`);

        return new Promise((resolve, reject) => {
            ffmpeg(inputFilePath)
                .setStartTime(startTimeSeconds)
                .setDuration(durationSeconds)
                // Use robust container and codec settings matching standard web requirements
                .outputOptions([
                    "-c:v libx264",
                    "-preset fast",
                    "-crf 23",
                    "-c:a aac",
                    "-b:a 128k",
                    "-movflags +faststart"
                ])
                .output(outputPath)
                .on("end", () => {
                    console.log(`[FFMPEG] Slice generated at ${outputPath}`);
                    resolve(outputPath);
                })
                .on("error", (err: Error) => {
                    console.error(`[FFMPEG] Error slicing video: ${err.message}`);
                    reject(err);
                })
                .run();
        });
    }

    /**
     * Extracts the last frame of a video clip as a PNG image.
     * Used to feed Veo 2's image-to-video generation.
     */
    static async extractLastFrame(videoFilePath: string): Promise<string> {
        const tempDir = os.tmpdir();
        const outputPath = path.join(tempDir, `adswap_frame_${randomUUID()}.png`);

        console.log(`[FFMPEG] Extracting last frame from ${videoFilePath}...`);

        return new Promise((resolve, reject) => {
            ffmpeg(videoFilePath)
                .inputOptions(["-sseof", "-0.1"])
                .outputOptions(["-frames:v", "1"])
                .output(outputPath)
                .on("end", () => {
                    console.log(`[FFMPEG] Last frame extracted to ${outputPath}`);
                    resolve(outputPath);
                })
                .on("error", (err: Error) => {
                    console.error(`[FFMPEG] Error extracting frame: ${err.message}`);
                    reject(err);
                })
                .run();
        });
    }

    /**
     * Uploads the sliced local video segment to tmpfiles.org for temporary public access.
     * This bypasses Localtunnel 503 errors and Cloudinary signature issues.
     */
    static async uploadToTmpfiles(localFilePath: string): Promise<string> {
        console.log(`[Host] Uploading temporary video segment to tmpfiles.org...`);

        try {
            const fileData = await fs.readFile(localFilePath);
            const blob = new Blob([fileData], { type: 'video/mp4' });

            const formData = new FormData();
            formData.append('file', blob, path.basename(localFilePath));

            const response = await fetch("https://tmpfiles.org/api/v1/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`tmpfiles.org upload failed: ${response.statusText}`);
            }

            const data = await response.json();
            // tmpfiles returns a URL like: https://tmpfiles.org/12345/video.mp4
            // We need the direct download link: https://tmpfiles.org/dl/12345/video.mp4
            const url = data.data.url.replace("tmpfiles.org/", "tmpfiles.org/dl/");

            console.log(`[Host] Successfully hosted at tmpfiles.org: ${url}`);
            return url;
        } catch (error: any) {
            console.error("[Host] tmpfiles.org upload failed", error);
            throw new Error(`Failed to upload to tmpfiles.org: ${error.message}`);
        }
    }

    /**
     * Downloads an external URL (such as the WaveSpeed result output) to the local disk.
     */
    static async downloadVideo(url: string, outputPath?: string): Promise<string> {
        if (!outputPath) {
            outputPath = path.join(os.tmpdir(), `adswap_download_${randomUUID()}.mp4`);
        }

        console.log(`[System] Downloading video from ${url}...`);

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to download video: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        await fs.writeFile(outputPath, buffer);
        console.log(`[System] Download complete => ${outputPath}`);

        return outputPath;
    }

    /**
     * Stitches an original video and a modified WaveSpeed segment together.
     * Splices the original video into Part 1 (0 to insertionPoint) and Part 2 (exitPoint to end),
     * and inserts the adSlotFilePath in the middle: Part 1 + Ad + Part 2.
     * The original footage between insertionPoint and exitPoint is completely removed.
     */
    static async stitchVideos(
        originalFilePath: string,
        adSlotFilePath: string,
        insertionPointSeconds: number,
        exitPointSeconds?: number
    ): Promise<string> {
        // If no exit point given, resume from where the insertion was
        const resumeFromSeconds = exitPointSeconds ?? insertionPointSeconds;

        const tempDir = os.tmpdir();
        const prefixPath = path.join(tempDir, `adswap_part1_${randomUUID()}.mp4`);
        const suffixPath = path.join(tempDir, `adswap_part2_${randomUUID()}.mp4`);
        const finalOutputPath = path.join(tempDir, `adswap_final_${randomUUID()}.mp4`);

        console.log(`[FFMPEG] Stitching: Original[0-${insertionPointSeconds}s] + AI Ad + Original[${resumeFromSeconds}s-end]`);

        // Phase 1: Extract the original video from 0s up to insertionPointSeconds
        await new Promise<void>((resolve, reject) => {
            if (insertionPointSeconds === 0) return resolve(); // nothing to slice
            ffmpeg(originalFilePath)
                .setStartTime(0)
                .setDuration(insertionPointSeconds)
                .outputOptions(["-c:v libx264", "-crf 23", "-c:a aac"])
                .output(prefixPath)
                .on("end", () => resolve())
                .on("error", reject)
                .run();
        });

        // Phase 2: Extract the rest of the original video from exitPointSeconds to the end
        // This SKIPS the entire drinking scene between insertionPoint and exitPoint
        await new Promise<void>((resolve, reject) => {
            ffmpeg(originalFilePath)
                .setStartTime(resumeFromSeconds)
                .outputOptions(["-c:v libx264", "-crf 23", "-c:a aac"])
                .output(suffixPath)
                .on("end", () => resolve())
                .on("error", reject)
                .run();
        });

        // Phase 3: Concatenate.
        // We write a text file for the ffmpeg concat demuxer.
        const concatListPath = path.join(tempDir, `adswap_concat_${randomUUID()}.txt`);
        let concatContent = "";

        // Only include prefix if the insertion point wasn't exactly at 0s
        if (insertionPointSeconds > 0) concatContent += `file '${prefixPath}'\n`;

        // Insert the AI-generated ad segment
        concatContent += `file '${adSlotFilePath}'\n`;

        // Append the rest of the original video
        concatContent += `file '${suffixPath}'\n`;

        await fs.writeFile(concatListPath, concatContent);

        return new Promise((resolve, reject) => {
            ffmpeg()
                .input(concatListPath)
                .inputOptions(["-f concat", "-safe 0"])
                // Re-encode to ensure all pieces (including the AI video) seamlessly bind together
                .outputOptions([
                    "-c:v libx264",
                    "-preset fast",
                    "-crf 23",
                    "-c:a aac",
                    "-b:a 128k",
                    "-movflags +faststart",
                    "-vsync 2"
                ])
                .output(finalOutputPath)
                .on("end", () => {
                    console.log(`[FFMPEG] Stitching complete: ${finalOutputPath}`);
                    resolve(finalOutputPath);
                })
                .on("error", (err: Error) => {
                    console.error(`[FFMPEG] Concatenation failed: ${err.message}`);
                    reject(err);
                })
                .run();
        });
    }

    /**
     * Helper to clean up temporary files after processing is fully complete.
     */
    static async cleanupFiles(filePaths: string[]) {
        for (const filePath of filePaths) {
            try {
                await fs.unlink(filePath);
                console.log(`[System] Cleaned up temporary file: ${filePath}`);
            } catch (error) {
                console.warn(`[System] Failed to clean up file: ${filePath}`, error);
            }
        }
    }
}
