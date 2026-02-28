import { useState, useEffect } from 'react'
import { GameState, Idol, GAME_CONSTANTS } from '@/types/game'
import { Button } from '@/components/ui/button'
import IdolCard from '@/components/ui/IdolCard'
import { Loader2, AlertCircle } from 'lucide-react'
import { translate } from '@/lib/i18n'

interface Props {
    gameState: GameState
    updateState: (updates: Partial<GameState>) => void
}

/** PRD §4.2: 캐스팅 fallback — Imagen 실패 시 이니셜 아바타로 대체 */
function buildFallbackCandidates(): Idol[] {
    const names = ['김민준', '이서연', '박도윤', '최하은']
    const genders: ('male' | 'female')[] = ['male', 'female', 'male', 'female']
    return names.map((name, i) => ({
        id: `fallback-${i}`,
        name,
        age: 18 + i,
        gender: genders[i],
        imageUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}`,
        stats: { dance: 70, vocal: 70, visual: 70, potential: 50, charisma: 70 },
        risk: { scandal: 20, romance: 15, conflict: 10 },
        geminiAnalysis: '균형 잡힌 기본기를 갖췄습니다.',
        isActive: true,
    }))
}

export default function CastingPhase({ gameState, updateState }: Props) {
    const [candidates, setCandidates] = useState<Idol[]>([])
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        const fetchCandidates = async () => {
            setLoading(true)
            setError(false)
            try {
                const res = await fetch('/api/casting', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ count: 4 }),
                })
                if (!res.ok) throw new Error('Casting API failed')
                const data = await res.json()
                setCandidates(data.candidates)
            } catch (err) {
                console.error('[CastingPhase] 후보 생성 실패, fallback 사용:', err)
                // PRD §7.2 Fallback: 하드코딩된 연습생 카드 4개
                setCandidates(buildFallbackCandidates())
                setError(true)
            } finally {
                setLoading(false)
            }
        }
        fetchCandidates()
    }, [])

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else if (next.size < GAME_CONSTANTS.CAST_MAX) {
                // PRD §4.2: 최대 5명 제한
                next.add(id)
            }
            return next
        })
    }

    const handleConfirm = () => {
        // PRD §4.2: 최소 2명 미달 시 진행 불가
        if (selectedIds.size < GAME_CONSTANTS.CAST_MIN) return

        const selectedIdols = candidates.filter(c => selectedIds.has(c.id))
        // PRD §3.5: 캐스팅 비용 — 멤버당 200만원
        const cost = selectedIdols.length * GAME_CONSTANTS.CASTING_COST_PER_MEMBER

        // 자금 부족 시 버튼이 disabled이므로 여기까지 도달하지 않지만 방어 코드 유지
        if (gameState.company.money < cost) return

        updateState({
            roster: [...gameState.roster, ...selectedIdols],
            currentGroup: selectedIdols,
            company: {
                ...gameState.company,
                money: gameState.company.money - cost,
            },
            phase: 'studio',
        })
    }

    const totalCost = selectedIds.size * GAME_CONSTANTS.CASTING_COST_PER_MEMBER
    const canAfford = gameState.company.money >= totalCost

    return (
        <div className="flex flex-col w-full h-full pb-20 animate-in fade-in duration-500">
            <div className="mb-6 mt-4">
                <h1 className="text-2xl font-bold font-display text-[#4A9FE0] drop-shadow-sm break-keep">
                    {translate('casting.title', gameState.locale)}
                </h1>
                <p className="text-xs text-slate-500 mt-1 break-keep">
                    {translate('casting.subtitle', gameState.locale)} {translate('casting.selectionLimit', gameState.locale, { min: GAME_CONSTANTS.CAST_MIN, max: GAME_CONSTANTS.CAST_MAX })}
                </p>
                {error && (
                    <div className="flex items-center gap-1 mt-2 text-[#F59E0B] text-xs font-bold break-keep">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        {translate('casting.fallbackError', gameState.locale)}
                    </div>
                )}
            </div>

            {/* 로딩 — 스켈레톤 UI */}
            {loading ? (
                <div className="grid grid-cols-2 gap-4 flex-1">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="polaroid-card animate-pulse bg-white/50 h-56 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-[#4A9FE0]/50 animate-spin" />
                        </div>
                    ))}
                </div>
            ) : (
                // 후보 카드 그리드
                <div className="grid grid-cols-2 gap-4 flex-1">
                    {candidates.map((idol, i) => (
                        <div key={idol.id} style={{ animationDelay: `${i * 50}ms` }} className="card-enter">
                            <IdolCard
                                idol={idol}
                                isSelected={selectedIds.has(idol.id)}
                                onToggle={() => toggleSelection(idol.id)}
                                locale={gameState.locale}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* 하단 고정 액션바 (Phoning 탭 바 스타일) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 z-40 shadow-[0_-4px_24px_rgba(0,0,0,0.05)]">
                <div className="max-w-sm mx-auto flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-500 font-bold whitespace-nowrap">
                            {translate('casting.selectedCount', gameState.locale)} <span className="text-[#FF6EB4] stat-number">{selectedIds.size}</span>{translate('casting.personUnit', gameState.locale)}
                        </span>
                        <span className={`text-sm font-bold stat-number ${!canAfford && selectedIds.size > 0 ? 'text-[#EF4444]' : 'text-slate-800'}`}>
                            {gameState.locale === 'en' ? '₩' : ''}{gameState.locale === 'en' ? totalCost.toLocaleString() : (totalCost / 10000).toLocaleString()}{translate('common.moneyUnit', gameState.locale)}
                            {!canAfford && selectedIds.size > 0 ? ' ⚠️' : ''}
                        </span>
                    </div>
                    <Button
                        className="flex-1 bg-[#4A9FE0] hover:bg-[#3b82f6] text-white font-bold h-12 rounded-xl transition-transform active:scale-95 disabled:bg-slate-300 disabled:text-white neo-btn whitespace-nowrap px-2"
                        onClick={handleConfirm}
                        disabled={selectedIds.size < GAME_CONSTANTS.CAST_MIN || loading || !canAfford}
                    >
                        {selectedIds.size < GAME_CONSTANTS.CAST_MIN
                            ? translate('casting.minSelectionReq', gameState.locale, { min: GAME_CONSTANTS.CAST_MIN })
                            : !canAfford
                                ? translate('casting.insufficientFunds', gameState.locale)
                                : translate('casting.castConfirmBtn', gameState.locale)}
                    </Button>
                </div>
            </div>
        </div>
    )
}
