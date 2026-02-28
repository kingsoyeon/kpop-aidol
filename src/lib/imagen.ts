import { GoogleGenAI } from '@google/genai';

export async function generateIdolImage(data: { gender: string; age: number }): Promise<string> {
    const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy_key' });
    // [MOCK] 진짜 Imagen API 대신 DiceBear 아바타를 사용하여 아이돌 이미지를 생성합니다.
    // 나중에 진짜 Imagen API 연동 시 이 함수 내부의 mock 처리를 걷어내고 아래 try-catch 문을 활성화하세요.
    return `https://api.dicebear.com/9.x/avataaars/svg?seed=${data.gender}-${data.age}-${Math.random()}`;
}
