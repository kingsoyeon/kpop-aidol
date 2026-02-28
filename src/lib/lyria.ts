import { getAccessToken } from './gcpAuth'

const CONCEPT_MOOD: Record<string, string> = {
    summer: 'cheerful, refreshing, carefree summer vibes with bright hooks',
    intense: 'powerful, fierce, high-energy performance with heavy drops',
    ballad: 'emotional, heartfelt, sentimental melody with gentle builds',
    hiphop: 'urban, confident, street-style groove with punchy rhythm',
}

const MARKET_COLOR: Record<string, string> = {
    domestic: 'K-pop style, Korean pop sensibility',
    japan: 'melodic J-pop influenced K-pop crossover',
    global: 'international pop crossover with broad appeal',
}

export async function generateTrack(data: {
    concept: string
    targetMarket: string
    memberCount: number
}): Promise<string> {
    if (process.env.NEXT_PUBLIC_FORCE_MOCK === 'true') {
        return 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
    }

    const projectId = process.env.GCP_PROJECT_ID;
    if (!projectId) throw new Error('GCP_PROJECT_ID is not set in environment.');

    const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/lyria-002:predict`;
    const accessToken = await getAccessToken();

    const lyriaPrompt = [
        `K-pop ${data.concept} instrumental track.`,
        `Mood: ${CONCEPT_MOOD[data.concept] ?? 'upbeat K-pop'}.`,
        `Style: ${MARKET_COLOR[data.targetMarket] ?? 'K-pop style'}.`,
        `${data.memberCount}-member group vocal texture, harmonized lead and backing layers.`,
        `Radio-friendly, 30 seconds.`,
        `Language: English only descriptors. No non-English words.`
    ].join(' ');

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            instances: [{ prompt: lyriaPrompt }],
            parameters: { sampleCount: 1 }
        }),
        signal: AbortSignal.timeout(55000), // Vercel Hobby 60s 제한보다 5초 앞서 abort → fallback으로 깔끔하게 처리
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(`Lyria API 오류 ${response.status}: ${JSON.stringify(err)}`);
    }

    const result = await response.json();
    const audioBase64 = result.predictions[0].bytesBase64Encoded;
    return `data:audio/wav;base64,${audioBase64}`;
}
