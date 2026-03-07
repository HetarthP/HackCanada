export class WaveSpeedClient {
    private apiKey: string;
    private baseUrl = "https://api.wavespeed.ai/api/v3";

    constructor() {
        if (!process.env.WAVESPEED_API_KEY) {
            throw new Error("WAVESPEED_API_KEY environment variable is not set.");
        }
        this.apiKey = process.env.WAVESPEED_API_KEY;
    }

    /**
     * Builds a prompt for the Wan 2.5 video-extend model.
     * Simple, highly visual prompts work best with strict constraints on camera movement.
     */
    buildPrompt(
        productName: string,
        brand: string,
        surfaceContext: string
    ) {
        // Exact copy of Halftime's ad_generation_template.txt
        return `The video continues smoothly. A ${productName} appears naturally in the scene. Ideally someone interacts with or holds the ${brand} product, but at minimum it blends seamlessly into the environment. Keep the original visual style.`;
    }

    /**
     * Submits a video URL for ad-generation / object replacement.
     */
    async generateAdSegment(
        videoUrl: string,
        prompt: string,
        duration: number = 5,
        resolution: string = "720p"
    ) {
        console.log(`[WaveSpeed] Submitting video generation task for URL: ${videoUrl}`);

        const url = `${this.baseUrl}/alibaba/wan-2.5/video-extend`;

        const validDuration = Math.max(3, Math.min(10, Math.round(duration)));

        const payload = {
            duration: validDuration,
            enable_prompt_expansion: false,
            negative_prompt: "",
            prompt,
            resolution,
            seed: -1,
            video: videoUrl
        };

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.apiKey}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`WaveSpeed API Error (${response.status}): ${err}`);
        }

        const data = await response.json();
        const requestId = data.data.id;
        console.log(`[WaveSpeed] Task submitted successfully. Request ID: ${requestId}`);

        return requestId;
    }

    /**
     * Polls the API until the video generation is completed or failed.
     */
    async pollForResult(requestId: string): Promise<string> {
        console.log(`[WaveSpeed] Polling for results for Request ID: ${requestId}`);

        const pollUrl = `${this.baseUrl}/predictions/${requestId}/result`;
        const headers = {
            "Authorization": `Bearer ${this.apiKey}`
        };

        // Poll indefinitely (usually takes 1-3 minutes for Wan 2.5)
        while (true) {
            const response = await fetch(pollUrl, { headers });

            if (!response.ok) {
                const err = await response.text();
                throw new Error(`WaveSpeed Polling Error: ${err}`);
            }

            const data = await response.json();
            const status = data.data.status;

            if (status === "completed") {
                const outputUrl = data.data.outputs[0];
                console.log(`[WaveSpeed] Task completed! Output URL: ${outputUrl}`);
                return outputUrl;
            } else if (status === "failed") {
                throw new Error(`WaveSpeed Task Failed: ${data.data.error}`);
            }

            // Wait 2 seconds before polling again
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}
