import { useState, useEffect, useMemo } from 'react'
import { GameState, JudgeResult, GAME_CONSTANTS } from '@/types/game'
import { Button } from '@/components/ui/button'
import { translate } from '@/lib/i18n'

interface Props {
    gameState: GameState
    updateState: (updates: Partial<GameState>) => void
}

const BADGE_MAP: Record<string, { icon: string; color: string; label: string; glow: string; bg: string }> = {
    '1위': { icon: '🏆', color: '#FFD93D', label: '이번 주 1위!', glow: 'rgba(255,215,0,0.4)', bg: 'bg-[#FFD93D]/10' },
    '상위권': { icon: '🌟', color: '#10B981', label: '상위권 진입!', glow: 'rgba(16,185,129,0.3)', bg: 'bg-[#10B981]/10' },
    '중위권': { icon: '📀', color: '#64748B', label: '중위권 기록', glow: 'none', bg: 'bg-slate-100' },
    '하위권': { icon: '📉', color: '#F59E0B', label: '아쉬운 성적...', glow: 'none', bg: 'bg-[#F59E0B]/10' },
    '나락': { icon: '💀', color: '#EF4444', label: '나락...', glow: 'rgba(239,68,68,0.3)', bg: 'bg-[#EF4444]/15' },
}

export default function ChartResult({ gameState, updateState }: Props) {
    const [countdown, setCountdown] = useState(3)
    const [showResult, setShowResult] = useState(false)
    const [animating, setAnimating] = useState(false)

    // 파티클 위치/딜레이를 마운트 시 1회만 계산 (리렌더 시 깜빡임 방지)
    const particleProps = useMemo(() =>
        Array.from({ length: 15 }, () => ({
            delay: Math.random() * 500,
            left: 10 + Math.random() * 80,
        }))
        , [])

    // pendingEvent에서 judgeResult 추출
    const judgeData: JudgeResult | null =
        gameState.pendingEvent?.type === 'judgeResult' ? gameState.pendingEvent.data : null

    // 카운트다운 타이머
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
            return () => clearTimeout(timer)
        } else if (countdown === 0 && !showResult) {
            setShowResult(true)
            setAnimating(true)
            setTimeout(() => setAnimating(false), 2000)
        }
    }, [countdown, showResult])

    const handleNext = () => {
        const resultKey = judgeData?.result ?? '중위권'
        // PRD §3.5 경제 시스템 — GAME_CONSTANTS.RESULT_EFFECTS 사용 (매직 넘버 금지)
        const effect = GAME_CONSTANTS.RESULT_EFFECTS[resultKey]

        const newMoney = gameState.company.money + effect.money
        const newReputation = Math.max(0, gameState.company.reputation + effect.reputation)
        const newFanCount = Math.max(0, gameState.company.fanCount + effect.fanCount)

        // PRD §3.1: 게임 오버 조건 — money <= 0 또는 reputation <= 0
        if (newMoney <= 0 || newReputation <= 0) {
            updateState({
                company: {
                    ...gameState.company,
                    money: newMoney,
                    reputation: newReputation,
                    fanCount: newFanCount,
                },
                turn: gameState.turn + 1,
                phase: 'gameover',
                pendingEvent: null,
            })
            return
        }

        // PRD §4.5: 이벤트 발생 확률 — 30% 기본 + 리스크 멤버 보정
        let eventChance = GAME_CONSTANTS.EVENT_BASE_CHANCE // 0.30
        for (const member of gameState.currentGroup) {
            if (member.risk.scandal > 50) eventChance += GAME_CONSTANTS.EVENT_SCANDAL_BONUS  // +0.15
            if (member.risk.romance > 60) eventChance += GAME_CONSTANTS.EVENT_ROMANCE_BONUS  // +0.10
            if (member.risk.conflict > 40) eventChance += GAME_CONSTANTS.EVENT_CONFLICT_BONUS // +0.10
        }
        const goesToEvent = Math.random() < Math.min(eventChance, 0.80) // 최대 80% 캡

        updateState({
            company: {
                ...gameState.company,
                money: newMoney,
                reputation: newReputation,
                fanCount: newFanCount,
            },
            turn: gameState.turn + 1,
            phase: goesToEvent ? 'event' : 'casting',
            pendingEvent: null,
        })
    }

    const resultKey = judgeData?.result ?? '중위권'
    const rInfo = BADGE_MAP[resultKey] ?? BADGE_MAP['중위권']
    // PRD §3.5에서 정의된 효과 수치 (표시용)
    const effect = GAME_CONSTANTS.RESULT_EFFECTS[resultKey]

    // 수익/손실 데이터 계산 (표지판 제거 - UI PRD 4.5에서 처리)

    if (!showResult) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh]">
                <h2 className="text-[#4A9FE0] font-bold mb-8 font-display break-keep">{translate('chartResult.title', gameState.locale)}</h2>
                <div key={countdown} className="text-8xl font-bold font-display text-[#FF6EB4] p-8" style={{ animation: 'countPulse 1s' }}>
                    {countdown || '!'}
                </div>
            </div>
        )
    }

    return (
        <div
            className={`flex flex-col items-center min-h-[80vh] pt-10 px-4 w-full pb-28 ${animating && resultKey === '나락' ? 'animate-[shakeScreen_0.5s_ease-in-out]' : ''
                }`}
        >
            {/* 1위 파티클 (15개) — 위치/딜레이 useMemo로 안정화 */}
            {resultKey === '1위' && particleProps.map((p, i) => (
                <div
                    key={i}
                    className="heart-float"
                    style={{ animationDelay: `${p.delay}ms`, left: `${p.left}%` }}
                >
                    🏆
                </div>
            ))}

            <div className={`text-center mb-10 w-full animate-in zoom-in duration-700 p-8 rounded-3xl ${rInfo.bg} border-2 border-white/50 shadow-sm relative overflow-hidden`}>
                {/* 배경 장식 (나락일 때만 살짝 흔들림 힌트) */}
                {resultKey === '나락' && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>}

                <div
                    className="w-32 h-32 mx-auto rounded-full bg-white flex items-center justify-center text-6xl mb-4 relative z-10"
                    style={{ boxShadow: rInfo.glow !== 'none' ? `0 0 40px ${rInfo.glow}` : '0 10px 30px rgba(0,0,0,0.1)' }}
                >
                    {rInfo.icon}
                </div>
                <h1 className="text-4xl font-bold font-display mt-4 mb-2 relative z-10" style={{ color: rInfo.color }}>
                    {resultKey}
                </h1>
                <p className="text-slate-600 font-bold mb-8 relative z-10">{rInfo.label}</p>
            </div>

            {/* 수익/손실 표시 — PRD §4.5 */}
            <div className="w-full glass-card p-4 mb-6 space-y-2">
                <h3 className="text-xs font-bold text-slate-500 mb-3 break-keep">{translate('chartResult.resultLabel', gameState.locale)}</h3>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 font-bold break-keep">💰 {translate('chartResult.revenue', gameState.locale)}</span>
                    <span className={`stat-number font-bold ${effect.money >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                        {effect.money >= 0 ? '+' : ''}{gameState.locale === 'en' ? '₩' : ''}{(effect.money / 10000).toLocaleString()}{translate('common.moneyUnit', gameState.locale)}
                    </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 font-bold break-keep">⭐ {translate('chartResult.repChange', gameState.locale)}</span>
                    <span className={`stat-number font-bold ${effect.reputation >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                        {effect.reputation >= 0 ? '+' : ''}{effect.reputation}{translate('musicshow.judge.total', gameState.locale) === 'TOTAL' ? '' : '점'}
                    </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 font-bold break-keep">👥 {translate('chartResult.fandomChange', gameState.locale)}</span>
                    <span className={`stat-number font-bold ${effect.fanCount >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                        {effect.fanCount >= 0 ? '+' : ''}{effect.fanCount.toLocaleString()}{translate('casting.personUnit', gameState.locale)}
                    </span>
                </div>
                {judgeData?.comment && (
                    <div className="pt-2 border-t border-slate-100">
                        <p className="text-xs text-slate-600 italic">"{judgeData.comment}"</p>
                    </div>
                )}
            </div>

            {/* 컬렉션 배지 스트립 (Weverse 스타일) */}
            <div className="w-full mb-8">
                <h3 className="text-xs font-bold text-slate-500 mb-2">My Collections</h3>
                <div className="badge-strip bg-white/50 p-3 rounded-xl border border-white/60 min-h-[58px]">
                    {gameState.history.map((h, i) => {
                        const inf = BADGE_MAP[h.result] ?? BADGE_MAP['중위권']
                        return (
                            <div
                                key={i}
                                className="history-badge"
                                title={`#${i + 1} 컴백: ${h.title}`}
                                style={{ boxShadow: inf.glow !== 'none' ? `0 0 8px ${inf.glow}` : 'none' }}
                            >
                                {inf.icon}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* 하단 버튼 */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 z-40 shadow-[0_-4px_24px_rgba(0,0,0,0.05)]">
                <div className="max-w-sm mx-auto">
                    <Button
                        id="btn-next-comeback"
                        className="w-full h-14 bg-[#4A9FE0] hover:bg-[#3b82f6] text-white text-lg font-bold rounded-xl shadow-[0_4px_14px_rgba(74,159,224,0.4)] neo-btn"
                        onClick={handleNext}
                    >
                        {translate('chartResult.nextComebackBtn', gameState.locale)}
                    </Button>
                </div>
            </div>
        </div>
    )
}
