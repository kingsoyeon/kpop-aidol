import { GoogleGenAI } from '@google/genai';

let studioClient: any = null;

function getStudioClient() {
    if (!studioClient) {
        studioClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy_key' });
    }
    return studioClient;
}

/** Short, direct prompt optimized for Gemini native image models (Flash / Pro). */
function buildFlashPrompt(gender: string, age: number): string {
    return `Photorealistic portrait photo of a ${age}-year-old Korean ${gender} K-pop idol trainee.
This must be a real photograph only — no illustration, no anime, no 3D render, no cartoon.
Studio portrait with soft beauty lighting, subtle rim light, catchlight in eyes, smooth bokeh background.
Subject has flawless glass skin, symmetrical face, trendy K-pop hairstyle, expressive features.
Stylish modern K-pop outfit. Clean seamless neutral studio backdrop. High resolution, sharp focus on face.`;
}

/** Long technical prompt optimized for Vertex AI Imagen 4.0 diffusion model. */
function buildImagenPrompt(gender: string, age: number): string {
    return `Highly detailed photorealistic portrait of a beautiful ${age}-year-old Korean ${gender} K-pop idol trainee.
Style: Professional entertainment agency profile photo (IDOL PROFILE photoshoot).
Lighting: Soft studio beauty lighting, subtle rim light, high-key lighting, catchlight in eyes.
Appearance: Flawless glass skin with subtle natural texture, symmetrical features, trendy K-pop hairstyle, expressive youthful facial features.
Fashion: Stylish modern K-pop outfit (chic techwear, elegant tailoring, or minimalist streetwear).
Camera Settings: 85mm portrait lens, f/1.8, sharp focus on eyes, smooth creamy bokeh background, high resolution, 8k, cinematic photography.
Background: Clean, seamless solid studio backdrop (pastel or soft neutral color).
Constraint: MUST be a real human photo. NO illustration, NO drawing, NO 3D render, NO cartoon, NO anime style.`;
}

/** Extracts base64 image data from a generateContent() response (Strategy 1 & 2). */
function extractBase64FromContent(response: any): string | null {
    const parts = response.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p: any) => p.inlineData?.data);
    return imagePart?.inlineData?.data ?? null;
}

/**
 * Generates a photorealistic K-pop idol image.
 *
 * Strategy order:
 *   1. gemini-3.1-flash-image-preview  — generateContent(), GEMINI_API_KEY, fastest
 *   2. gemini-3-pro-image-preview      — generateContent(), GEMINI_API_KEY, medium
 *   3. imagen-4.0-generate-001         — Vertex AI REST, ADC, best quality
 *   Fallback: throws → DiceBear handled in casting route
 */
export async function generateIdolImage(data: { gender: string; age: number }): Promise<string> {
    if (process.env.NEXT_PUBLIC_FORCE_MOCK === 'true') {
        return `https://api.dicebear.com/9.x/avataaars/svg?seed=${data.gender}-${data.age}-${Math.random()}`;
    }

    const flashPrompt = buildFlashPrompt(data.gender, data.age);
    const imagenPrompt = buildImagenPrompt(data.gender, data.age);
    const client = getStudioClient();

    // Strategy 1: Google AI Studio - Imagen 3.0
    try {
        console.log(`[Imagen] Strategy 1: imagen-3.0-generate-002 (${data.gender}, ${data.age})...`);
        const response = await client.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: imagenPrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1'
            },
        });
        const base64 = response.generatedImages?.[0]?.image?.imageBytes;
        if (base64) {
            console.log('[Imagen] Strategy 1 success.');
            return `data:image/jpeg;base64,${base64}`;
        }
        console.warn('[Imagen] Strategy 1: no image in response, trying next.');
    } catch (err: any) {
        console.error('[Imagen] Strategy 1 failed:', err?.message || err);
    }

    // Strategy 2: Gemini native image model (확인된 이미지 생성 지원 모델)
    try {
        console.log(`[Imagen] Strategy 2: gemini-3.1-flash-image-preview (${data.gender}, ${data.age})...`);
        const response = await client.models.generateContent({
            model: 'gemini-3.1-flash-image-preview',
            contents: flashPrompt,
            config: { responseModalities: ['IMAGE', 'TEXT'] },
        });
        const base64 = extractBase64FromContent(response);
        if (base64) {
            console.log('[Imagen] Strategy 2 success.');
            return `data:image/jpeg;base64,${base64}`;
        }
        console.warn('[Imagen] Strategy 2: no image in response, trying next.');
    } catch (err: any) {
        console.error('[Imagen] Strategy 2 failed:', err?.message || err);
    }

    // Strategy 3: Vertex AI Imagen 4.0 (best quality, slowest)
    try {
        console.log(`[Imagen] Strategy 3: Vertex AI imagen-4.0-generate-001 (${data.gender}, ${data.age})...`);
        const { getAccessToken } = await import('./gcpAuth');
        const projectId = process.env.GCP_PROJECT_ID || 'k-pop-a-idol';
        const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/imagen-4.0-generate-001:predict`;
        const accessToken = await getAccessToken();

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                instances: [{ prompt: imagenPrompt }],
                parameters: { sampleCount: 1, aspectRatio: '1:1' },
            }),
        });

        if (response.ok) {
            const result = await response.json();
            const base64 = result.predictions?.[0]?.bytesBase64Encoded;
            if (base64) {
                console.log('[Imagen] Strategy 3 success.');
                return `data:image/jpeg;base64,${base64}`;
            }
        } else {
            const errData = await response.json().catch(() => ({}));
            console.error('[Imagen] Strategy 3 Vertex error:', response.status, JSON.stringify(errData));
        }
    } catch (err: any) {
        console.error('[Imagen] Strategy 3 failed:', err?.message || err);
    }

    // All strategies exhausted — let casting route apply DiceBear fallback
    throw new Error('All image generation strategies failed.');
}
