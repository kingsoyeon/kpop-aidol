export interface Idol {
    id: string
    name: string
    age: number
    gender: 'male' | 'female'
    imageUrl: string          // Imagen 4 생성 이미지
    stats: {
        dance: number           // 0-100
        vocal: number
        visual: number
        potential: number
        charisma: number
    }
    risk: {
        scandal: number         // 구설수 확률 0-100
        romance: number         // 열애설 확률 0-100
        conflict: number        // 분쟁 확률 0-100
    }
    geminiAnalysis: string    // Gemini 분석 코멘트
    isActive: boolean
}

export type ConceptType = 'summer' | 'intense' | 'ballad' | 'hiphop'
export type MarketType = 'domestic' | 'japan' | 'global'

export interface Track {
    id: string
    title: string
    concept: ConceptType
    targetMarket: MarketType
    lyrics: {
        full: string
        hook: string
    }
    audioUrl: string
    members: Idol[]
    producedAt: number
}

export type GamePhase = 'intro' | 'casting' | 'studio' | 'musicshow' | 'result' | 'event' | 'gameover'

export type ChartRank = '1위' | '상위권' | '중위권' | '하위권' | '나락'

export interface TurnResult {
    title: string
    result: ChartRank
    moneyChange: number   // PRD 3.5: 결과별 수익/손실 기록
    fanChange: number
    turn: number
}

/** /api/judge 응답 구조 (MusicShowPhase → ChartResult 전달용) */
export interface JudgeResult {
    scores: {
        composition: number
        vocal: number
        performance: number
        popularity: number
        buzz: number
    }
    totalScore: number
    chartProbability: number
    comment: string
    result: ChartRank
}

/** pendingEvent 타입 유니온 */
export type PendingEvent =
    | { type: 'judgeResult'; data: JudgeResult }
    | null

export interface GameState {
    company: {
        name: string
        money: number
        reputation: number
        fanCount: number
    }
    roster: Idol[]
    currentGroup: Idol[]
    currentTrack: Track | null
    phase: GamePhase
    turn: number
    locale: 'ko' | 'en'
    history: TurnResult[]
    pendingEvent: PendingEvent
}

// ── PRD 3.5 경제 시스템 상수 ──────────────────────────────────────
// 출처: KPopAidol_PRD.md §3.5 경제 시스템
export const GAME_CONSTANTS = {
    INITIAL_MONEY: 10_000_000,       // 초기 자금 1000만원
    INITIAL_REPUTATION: 50,
    INITIAL_FAN_COUNT: 0,

    CASTING_COST_PER_MEMBER: 2_000_000,  // 캐스팅 멤버당 200만원
    PRODUCE_BASE_COST: 5_000_000,         // 음원 제작 기본 500만원
    PRODUCE_RETRY_COST: 2_500_000,        // 재제작 250만원
    MARKET_JAPAN_EXTRA: 1_000_000,        // 일본 타겟 +100만원
    MARKET_GLOBAL_EXTRA: 2_000_000,       // 글로벌 타겟 +200만원

    // 결과별 수익/손실
    RESULT_EFFECTS: {
        '1위': { money: 20_000_000, fanCount: 100_000, reputation: 15 },
        '상위권': { money: 8_000_000, fanCount: 30_000, reputation: 8 },
        '중위권': { money: 2_000_000, fanCount: 5_000, reputation: 2 },
        '하위권': { money: -1_000_000, fanCount: -2_000, reputation: -5 },
        '나락': { money: -5_000_000, fanCount: -10_000, reputation: -15 },
    } as Record<ChartRank, { money: number; fanCount: number; reputation: number }>,

    // 이벤트 발생 확률 (PRD §4.5 ~ §4.6)
    EVENT_BASE_CHANCE: 0.30,
    EVENT_SCANDAL_BONUS: 0.15,   // scandal > 50 시
    EVENT_ROMANCE_BONUS: 0.10,   // romance > 60 시
    EVENT_CONFLICT_BONUS: 0.10,  // conflict > 40 시

    // 캐스팅 제약
    CAST_MIN: 2,
    CAST_MAX: 5,
} as const
