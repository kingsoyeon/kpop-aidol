import { GoogleGenAI } from '@google/genai';

let client: any = null;

function getClient() {
    if (!client) {
        client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy_key' });
    }
    return client;
}

export async function generateText(prompt: string): Promise<string> {
    if (process.env.NEXT_PUBLIC_FORCE_MOCK === 'true') return `[Mock] ${prompt.substring(0, 20)}...`;

    const geminiClient = getClient();
    const response = await geminiClient.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
    });
    return response.text || '';
}

export async function analyzeCandidate(data: { gender: string, age: number, stats: any, risk: any }): Promise<string> {
    // [MOCK] 진짜 Gemini API 대신 고정된 리스트에서 랜덤 추출하여 응답합니다.
    // 나중에 진짜 API를 연결하려면 이 함수 내부를 generateText(prompt) 호출로 되돌리세요.
    const mockComments = [
        "비주얼 압도적이나 보컬 보완 필수",
        "춤선이 깔끔하고 카리스마가 돋보임",
        "성실한 연습 벌레 스타일, 성장 가능성 높음",
        "이미 완성된 보컬, 즉시 데뷔 가능 수준",
        "잠재력은 높으나 구설수 관리가 필요해보임",
        "팀의 에너지를 책임질 비타민 같은 존재"
    ];
    return mockComments[Math.floor(Math.random() * mockComments.length)];
}
