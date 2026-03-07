import { GoogleGenAI } from "@google/genai";
import path from "path";
import os from "os";
import { randomUUID } from "crypto";

// Reuse the same Gemini SDK instance
const ai = new GoogleGenAI({});

export class VeoClient {
    /**
     * Builds the Halftime-style prompt for video generation.
     */
    buildPrompt(
        productName: string,
        brand: string,
        sceneDescription: string
    ): string {
        // Exact Halftime ad_generation_template.txt format
        return `The video continues smoothly. A ${productName} appears naturally in the scene. Ideally someone interacts with or holds the ${brand} product, but at minimum it blends seamlessly into the environment. Keep the original visual style.`;
    }

    /**
     * Generates a video using Veo 2 with an image-to-video approach.
     * Takes a base64 image (last frame of lead-up clip) and generates a continuation.
     */
    async generateFromImage(
        imageBase64: string,
        prompt: string,
        mimeType: string = "image/png"
    ): Promise<string> {
        console.log(`[Veo] Submitting image-to-video generation task...`);

        let operation = await ai.models.generateVideos({
            model: "veo-2.0-generate-001",
            prompt: prompt,
            image: {
                imageBytes: imageBase64,
                mimeType: mimeType,
            },
            config: {
                personGeneration: "allow_adult",
                aspectRatio: "16:9",
            },
        });

        console.log(`[Veo] Task submitted. Polling for completion...`);

        // Poll until done
        while (!operation.done) {
            console.log("[Veo] Video still generating. Waiting 10 seconds...");
            await new Promise((resolve) => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({
                operation: operation,
            });
        }

        console.log(`[Veo] Video generation complete!`);

        // Download the generated video to a local temp file
        const outputPath = path.join(os.tmpdir(), `veo_output_${randomUUID()}.mp4`);

        const generatedVideo = operation.response?.generatedVideos?.[0];
        if (!generatedVideo?.video) {
            throw new Error("Veo did not return a generated video");
        }

        await ai.files.download({
            file: generatedVideo.video,
            downloadPath: outputPath,
        });

        console.log(`[Veo] Generated video saved to ${outputPath}`);
        return outputPath;
    }

    /**
     * Generates a video from a text prompt only (no reference image).
     */
    async generateFromText(prompt: string): Promise<string> {
        console.log(`[Veo] Submitting text-to-video generation task...`);

        let operation = await ai.models.generateVideos({
            model: "veo-2.0-generate-001",
            prompt: prompt,
            config: {
                personGeneration: "allow_adult",
                aspectRatio: "16:9",
            },
        });

        console.log(`[Veo] Task submitted. Polling for completion...`);

        while (!operation.done) {
            console.log("[Veo] Video still generating. Waiting 10 seconds...");
            await new Promise((resolve) => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({
                operation: operation,
            });
        }

        console.log(`[Veo] Video generation complete!`);

        const outputPath = path.join(os.tmpdir(), `veo_output_${randomUUID()}.mp4`);

        const generatedVideo = operation.response?.generatedVideos?.[0];
        if (!generatedVideo?.video) {
            throw new Error("Veo did not return a generated video");
        }

        await ai.files.download({
            file: generatedVideo.video,
            downloadPath: outputPath,
        });

        console.log(`[Veo] Generated video saved to ${outputPath}`);
        return outputPath;
    }
}
