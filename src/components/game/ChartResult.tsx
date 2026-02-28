import { useState, useEffect } from 'react'
import { GameState } from '@/types/game'
import { Button } from '@/components/ui/button'

interface Props {
    gameState: GameState
    updateState: (updates: Partial<GameState>) => void
}

const BADGE_MAP: Record<string, { icon: string, color: string, label: string, glow: string, bg: string }> = {
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

    const judgeData = gameState.pendingEvent?.data

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
        // 이벤트 확률 체크 (30% + 리스크)
        let eventChance = 0.3
        const maxRisk = Math.max(...gameState.currentGroup.map(m => m.risk.scandal))
        if (maxRisk > 50) eventChance += 0.15

        const goesToEvent = Math.random() < eventChance

        // 수익 손실 반영
        const resultKey = judgeData?.result || '중위권'
        let incMoney = 0, incRep = 0, incFan = 0

        if (resultKey === '1위') { incMoney = 20000000; incFan = 100000; incRep = 15 }
        else if (resultKey === '상위권') { incMoney = 8000000; incFan = 30000; incRep = 8 }
        else if (resultKey === '중위권') { incMoney = 2000000; incFan = 5000; incRep = 2 }
        else if (resultKey === '하위권') { incMoney = -1000000; incFan = -2000; incRep = -5 }
        else if (resultKey === '나락') { incMoney = -5000000; incFan = -10000; incRep = -15 }

        const newMoney = gameState.company.money + incMoney
        const newReputation = gameState.company.reputation + incRep

        if (newMoney <= 0 || newReputation <= 0) {
            updateState({ phase: 'gameover' })
            return
        }

        updateState({
            company: {
                ...gameState.company,
                money: newMoney,
                reputation: newReputation,
                fanCount: gameState.company.fanCount + incFan
            },
            turn: gameState.turn + 1,
            phase: goesToEvent ? 'event' : 'casting',
            pendingEvent: null
        })
    }

    const resultKey = judgeData?.result || '중위권'
    const rInfo = BADGE_MAP[resultKey] || BADGE_MAP['중위권']

    // 수익/손실 데이터 계산
    let incMoney = 0, incRep = 0, incFan = 0
    if (resultKey === '1위') { incMoney = 20000000; incFan = 100000; incRep = 15 }
    else if (resultKey === '상위권') { incMoney = 8000000; incFan = 30000; incRep = 8 }
    else if (resultKey === '중위권') { incMoney = 2000000; incFan = 5000; incRep = 2 }
    else if (resultKey === '하위권') { incMoney = -1000000; incFan = -2000; incRep = -5 }
    else if (resultKey === '나락') { incMoney = -5000000; incFan = -10000; incRep = -15 }

    if (!showResult) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh]">
                <h2 className="text-[#4A9FE0] font-bold mb-8 font-display">차트 결과 발표</h2>
                <div key={countdown} className="text-8xl font-bold font-display text-[#FF6EB4] p-8" style={{ animation: 'countPulse 1s' }}>
                    {countdown}
                </div>
            </div>
        )
    }

    return (
        <div className={`flex flex-col items-center min-h-[80vh] pt-10 px-4 w-full transition-colors duration-1000 ${animating && resultKey === '나락' ? 'animate-[shakeScreen_0.5s_ease-in-out]' : ''}`}>

            {/* 1위 파티클 */}
            {resultKey === '1위' && Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="heart-float" style={{ animationDelay: `${Math.random() * 500}ms`, left: `${10 + Math.random() * 80}%` }}>🏆</div>
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

                {/* 수익/손실 및 지표 변화 */}
                <div className="grid grid-cols-3 gap-4 mt-4 relative z-10">
                    <div className="glass-card p-3 flex flex-col items-center">
                        <span className="text-[0.65rem] font-bold text-slate-400 mb-1">수익/손실</span>
                        <span className={`text-sm font-bold stat-number ${incMoney >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                            {incMoney >= 0 ? '+' : ''}{(incMoney / 10000).toLocaleString()}만
                        </span>
                    </div>
                    <div className="glass-card p-3 flex flex-col items-center">
                        <span className="text-[0.65rem] font-bold text-slate-400 mb-1">팬덤 변화</span>
                        <span className={`text-sm font-bold stat-number ${incFan >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                            {incFan >= 0 ? '+' : ''}{incFan.toLocaleString()}
                        </span>
                    </div>
                    <div className="glass-card p-3 flex flex-col items-center">
                        <span className="text-[0.65rem] font-bold text-slate-400 mb-1">평판 변화</span>
                        <span className={`text-sm font-bold stat-number ${incRep >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                            {incRep >= 0 ? '+' : ''}{incRep}
                        </span>
                    </div>
                </div>
            </div>

            {/* 컬렉션 배지 스트립 (Weverse 스타일) */}
            <div className="w-full mb-8">
                <h3 className="text-xs font-bold text-slate-500 mb-2">My Collections</h3>
                <div className="badge-strip bg-white/50 p-3 rounded-xl border border-white/60 min-h-[58px]">
                    {gameState.history.map((h, i) => {
                        const inf = BADGE_MAP[h.result] || BADGE_MAP['중위권']
                        return (
                            <div
                                key={i}
                                className="history-badge"
                                title={`#${i + 1}: ${h.title}`}
                                style={{ boxShadow: inf.glow !== 'none' ? `0 0 8px ${inf.glow}` : 'none' }}
                            >
                                {inf.icon}
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 z-40 shadow-[0_-4px_24px_rgba(0,0,0,0.05)]">
                <div className="max-w-sm mx-auto">
                    <Button
                        className="w-full h-14 bg-[#4A9FE0] hover:bg-[#3b82f6] text-white text-lg font-bold rounded-xl shadow-[0_4px_14px_rgba(74,159,224,0.4)] neo-btn"
                        onClick={handleNext}
                    >
                        다음 준비하기
                    </Button>
                </div>
            </div>

        </div>
    )
}
