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
    // [MOCK] 진짜 Lyria API 대신 짧은 무음/샘플 성격의 base64 WAV를 반환합니다.
    // 실제 연동 시 아래 endpoint와 fetch 로직을 활성화해야 합니다.
    return 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
}
