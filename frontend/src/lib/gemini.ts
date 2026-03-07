import { GoogleGenAI } from "@google/genai";

// Initialize the Google Gen AI SDK. Requires GEMINI_API_KEY environment variable.
const ai = new GoogleGenAI({});

export interface AdSlot {
    insertion_point: string; // MM:SS format - where the AI segment begins
    exit_point: string; // MM:SS format - where the original video resumes (next camera cut after the drinking scene)
    duration: number; // How many seconds to generate (usually 5)
    description: string;
    suggested_products: string[];
}

export interface VideoAnalysisResult {
    file_id: string;
    slots: AdSlot[];
}

/**
 * Uploads a video file to the Gemini API for semantic analysis.
 * Returns the Gemini File object which contains an ID and URI.
 */
export async function uploadVideoForAnalysis(
    filePath: string,
    mimeType: string = "video/mp4",
    displayName?: string
) {
    console.log(`[Gemini] Uploading video to Gemini File API: ${filePath}`);
    const uploadResult = await ai.files.upload({
        file: filePath,
        config: {
            displayName: displayName || "AdSwap Upload",
            mimeType: mimeType,
        },
    });

    console.log(`[Gemini] Upload complete. File ID: ${uploadResult.name}`);
    return uploadResult;
}

/**
 * Polls the Gemini File API until the uploaded video is completely processed
 * and ready to be used in a multimodal prompt.
 */
export async function waitForVideoProcessing(fileName: string) {
    console.log(`[Gemini] Waiting for video processing to complete for ${fileName}...`);
    let file = await ai.files.get({ name: fileName });

    while (file.state === "PROCESSING") {
        console.log("[Gemini] Video still processing. Waiting 5 seconds...");
        await new Promise((resolve) => setTimeout(resolve, 5000));
        file = await ai.files.get({ name: fileName });
    }

    if (file.state === "FAILED") {
        throw new Error(`Gemini video processing failed for ${fileName}`);
    }

    console.log(`[Gemini] Video processing complete. State: ${file.state}`);
    return file;
}

/**
 * Analyzes a processed video with Gemini 2.5 Flash to identify potential AI ad slots.
 * Returns a strictly typed JSON structure containing the timestamps and context.
 */
export async function analyzeVideoForAdSlots(
    fileName: string,
    fileUri: string,
    mimeType: string = "video/mp4"
): Promise<VideoAnalysisResult> {
    console.log(`[Gemini] Analyzing video ${fileName} for product placement slots...`);

    const prompt = `
    Analyze this video and find the single best moment where a person is actively holding, drinking from, or interacting with a beverage can or bottle.
    
    CRITICAL RULES:
    - You MUST find a moment where a PERSON is clearly HOLDING a CAN or BOTTLE in their hand.
    - Pick the exact frame where the can/bottle is most visible and prominent in the person's hand.
    - Do NOT pick scenes with animals, objects on tables, or anything other than a human holding a drink.
    
    You must return TWO timestamps:
    1. "insertion_point" - the exact moment where the person is holding/drinking from the can (this is where we splice in AI footage)
    2. "exit_point" - the timestamp of the NEXT camera cut or scene change AFTER the drinking scene ends (this is where the original video resumes, so the old product never reappears on screen)
    
    Return a valid JSON object strictly matching this schema:
    {
      "slots": [
        {
          "insertion_point": "00:05",
          "exit_point": "00:12",
          "duration": 5,
          "description": "Describe exactly what the person is doing and what they are holding (e.g., 'a woman drinking from a Pepsi can while sitting at a table')",
          "suggested_products": ["Coca-Cola can", "Red Bull can", "Monster Energy can"]
        }
      ]
    }
  `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
            {
                role: "user",
                parts: [
                    {
                        fileData: {
                            fileUri: fileUri,
                            mimeType: mimeType,
                        },
                    },
                    { text: prompt },
                ],
            },
        ],
        config: {
            responseMimeType: "application/json",
            temperature: 0.2, // Low temperature for consistent JSON
        },
    });

    try {
        const text = response.text;
        if (!text) {
            throw new Error("No text returned from Gemini API");
        }
        const result = JSON.parse(text);
        return {
            file_id: fileName,
            slots: result.slots || [],
        };
    } catch (e) {
        console.error("[Gemini] Failed to parse semantic ad slots JSON.", e);
        throw new Error("Failed to parse Gemini response as JSON.");
    }
}
