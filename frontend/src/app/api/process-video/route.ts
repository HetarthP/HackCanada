import { NextResponse } from 'next/server';
import { analyzeVideoForAdSlots, uploadVideoForAnalysis, waitForVideoProcessing } from '@/lib/gemini';
import { VeoClient } from '@/lib/veo';
import { VideoProcessor } from '@/lib/video-processor';
import path from 'path';
import os from 'os';
import fs from 'fs/promises';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('video') as File | null;
        const brand = formData.get('brand') as string;
        const productName = formData.get('productName') as string;

        if (!file || !brand || !productName) {
            return NextResponse.json({ error: "Missing required fields (video, brand, productName)" }, { status: 400 });
        }

        console.log(`[Pipeline] Starting Video Processing Pipeline for ${file.name}`);

        // Step 1: Save the incoming video locally for FFMPEG
        const originalBytes = await file.arrayBuffer();
        const originalBuffer = Buffer.from(originalBytes);
        const originalFilePath = path.join(os.tmpdir(), `original_${file.name}`);
        await fs.writeFile(originalFilePath, originalBuffer);

        // Step 2: Upload to Gemini & Analyze
        console.log(`[Pipeline] Uploading to Gemini...`);
        const ext = file.name.toLowerCase().split('.').pop();
        const mimeType = ext === 'mov' ? 'video/quicktime' : 'video/mp4';
        const uploadResult = await uploadVideoForAnalysis(originalFilePath, mimeType, file.name);

        if (!uploadResult.name) {
            throw new Error("Failed to retrieve file name from Gemini Upload");
        }

        console.log(`[Pipeline] Waiting for Gemini processing...`);
        const processedFile = await waitForVideoProcessing(uploadResult.name);

        if (!processedFile.uri) {
            throw new Error("Failed to retrieve processed file URI from Gemini");
        }

        console.log(`[Pipeline] Analyzing video for Ad Slots...`);
        const analysis = await analyzeVideoForAdSlots(uploadResult.name, processedFile.uri, mimeType);

        if (!analysis.slots || analysis.slots.length === 0) {
            return NextResponse.json({ error: "No suitable ad slots were detected in this video." }, { status: 422 });
        }

        const slot = analysis.slots[0];
        console.log(`[Pipeline] Selected insertion point: ${slot.insertion_point}`);
        console.log(`[Pipeline] Selected exit point: ${slot.exit_point}`);
        console.log(`[Pipeline] description: ${slot.description}`);

        // Helper to parse HH:MM:SS, MM:SS, or raw seconds
        const parseTimestamp = (str: string): number => {
            const tokens = str.split(':');
            if (tokens.length === 3) {
                return parseInt(tokens[0]) * 3600 + parseInt(tokens[1]) * 60 + parseInt(tokens[2]);
            } else if (tokens.length === 2) {
                return parseInt(tokens[0]) * 60 + parseInt(tokens[1]);
            }
            return parseInt(str) || 0;
        };

        const insertionPointSeconds = parseTimestamp(slot.insertion_point || "0");
        const exitPointSeconds = parseTimestamp(slot.exit_point || slot.insertion_point || "0");

        console.log(`[Pipeline] Insertion: ${insertionPointSeconds}s | Exit: ${exitPointSeconds}s | Skipping ${exitPointSeconds - insertionPointSeconds}s of original`);

        // Step 3: Slice a 3-second lead-up clip ending at the insertion point
        const leadUpSeconds = 3;
        const sliceStart = Math.max(0, insertionPointSeconds - leadUpSeconds);
        const actualLeadUp = insertionPointSeconds - sliceStart;
        console.log(`[Pipeline] Slicing ${actualLeadUp}s lead-up clip (${sliceStart}s to ${insertionPointSeconds}s)...`);
        const slicedFilePath = await VideoProcessor.sliceSegment(
            originalFilePath,
            sliceStart,
            actualLeadUp
        );

        // Step 4: Extract the last frame from the lead-up clip as a PNG image
        console.log(`[Pipeline] Extracting last frame for Veo 2 image-to-video...`);
        const framePath = await VideoProcessor.extractLastFrame(slicedFilePath);
        const frameBuffer = await fs.readFile(framePath);
        const frameBase64 = frameBuffer.toString("base64");

        // Step 5: Generate AI ad segment using Veo 2 (image-to-video)
        console.log(`[Pipeline] Sending to Veo 2 for Ad Generation...`);
        const veo = new VeoClient();
        const prompt = veo.buildPrompt(productName, brand, slot.description || "");

        const adSlotFilePath = await veo.generateFromImage(frameBase64, prompt, "image/png");

        // Step 6: Splice and Stitch
        console.log(`[Pipeline] Splicing: Original[0-${insertionPointSeconds}s] + AI Ad + Original[${exitPointSeconds}s-end]`);
        const finalStitchedPath = await VideoProcessor.stitchVideos(
            originalFilePath,
            adSlotFilePath,
            insertionPointSeconds,
            exitPointSeconds
        );

        // Step 7: Host final video for playback
        console.log(`[Pipeline] Hosting final stitched video...`);
        const finalUrl = await VideoProcessor.uploadToTmpfiles(finalStitchedPath);

        // Cleanup temp files
        await VideoProcessor.cleanupFiles([
            originalFilePath,
            slicedFilePath,
            framePath,
            adSlotFilePath,
        ]);

        console.log(`[Pipeline] Pipeline finished successfully!`);
        return NextResponse.json({
            success: true,
            analysis,
            final_video_url: finalUrl
        });

    } catch (error: any) {
        console.error("[Pipeline] Critical Failure:", error);
        return NextResponse.json(
            { error: error.message || "An unknown error occurred during the pipeline processing." },
            { status: 500 }
        );
    }
}
