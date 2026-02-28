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

export type TurnResult = {
    title: string
    result: '1위' | '상위권' | '중위권' | '하위권' | '나락'
}

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
    history: TurnResult[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pendingEvent: any | null
}
