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
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text || '';
}

export async function analyzeCandidate(data: { gender: string, age: number, stats: any, risk: any }): Promise<string> {
    const prompt = `
K-pop 기획사 사장 관점에서 이 연습생을 평가해줘.
성별: ${data.gender === 'male' ? '남자' : '여자'}, 나이: ${data.age}세
댄스: ${data.stats.dance}/100, 보컬: ${data.stats.vocal}/100, 비주얼: ${data.stats.visual}/100
구설수 리스크: ${data.risk.scandal}%

핵심 장단점을 한 문장으로 (20-30자 이내, 한국어).
예시: "비주얼 압도적이나 보컬 보완 필수"
    `.trim();

    return await generateText(prompt);
}

export async function generateJudgeJSON(prompt: string): Promise<string> {
    if (process.env.NEXT_PUBLIC_FORCE_MOCK === 'true') {
        const resultTypes = ["1위", "상위권", "중위권", "하위권", "나락"];
        const randomResult = resultTypes[Math.floor(Math.random() * resultTypes.length)];
        const baseScore = randomResult === "1위" ? 90 : randomResult === "상위권" ? 75 : randomResult === "중위권" ? 60 : randomResult === "하위권" ? 45 : 30;

        return JSON.stringify({
            scores: {
                composition: baseScore + Math.floor(Math.random() * 10),
                vocal: baseScore + Math.floor(Math.random() * 10),
                performance: baseScore + Math.floor(Math.random() * 10),
                popularity: baseScore + Math.floor(Math.random() * 10),
                buzz: baseScore + Math.floor(Math.random() * 10)
            },
            totalScore: baseScore + 5,
            chartProbability: baseScore,
            comment: "Mock 데이터: 전반적으로 훌륭한 퍼포먼스였습니다.",
            result: randomResult
        });
    }

    const geminiClient = getClient();
    const response = await geminiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json'
        }
    });
    return response.text || '{}';
}

export async function generateEventJSON(prompt: string): Promise<string> {
    if (process.env.NEXT_PUBLIC_FORCE_MOCK === 'true') {
        return JSON.stringify({
            title: "Mock 이벤트",
            description: "이것은 MOCK 이벤트입니다.",
            memberName: "알 수 없음",
            choices: [
                { text: "선택지 1", effect: { reputation: -5, money: 0, fanCount: -2000 }, resultMessage: "결과 1" },
                { text: "선택지 2", effect: { reputation: -20, money: 0, fanCount: -10000 }, resultMessage: "결과 2" },
                { text: "선택지 3", effect: { reputation: 2, money: -500000, fanCount: 1000 }, resultMessage: "결과 3" }
            ]
        });
    }

    const geminiClient = getClient();
    const response = await geminiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json'
        }
    });
    return response.text || '{}';
}
