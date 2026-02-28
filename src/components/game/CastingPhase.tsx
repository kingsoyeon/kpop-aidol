import { useState, useEffect } from 'react'
import { GameState, Idol } from '@/types/game'
import { Button } from '@/components/ui/button'
import IdolCard from '@/components/ui/IdolCard'
import { Loader2 } from 'lucide-react'

interface Props {
    gameState: GameState
    updateState: (updates: Partial<GameState>) => void
}

export default function CastingPhase({ gameState, updateState }: Props) {
    const [candidates, setCandidates] = useState<Idol[]>([])
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // API 호출 위치
        const fetchCandidates = async () => {
            try {
                const res = await fetch('/api/casting', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ count: 4 })
                })
                if (!res.ok) throw new Error('Casting failed')
                const data = await res.json()
                setCandidates(data.candidates)
            } catch (error) {
                console.error(error)
                // Fallback or handle error
            } finally {
                setLoading(false)
            }
        }
        fetchCandidates()
    }, [])

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else if (next.size < 5) next.add(id) // 최대 5명
            return next
        })
    }

    const handleConfirm = () => {
        if (selectedIds.size < 2) return // 최소 2명 피드백 (간단히 return)

        const selectedIdols = candidates.filter(c => selectedIds.has(c.id))
        const cost = selectedIdols.length * 2000000

        updateState({
            roster: [...gameState.roster, ...selectedIdols],
            currentGroup: selectedIdols,
            company: {
                ...gameState.company,
                money: gameState.company.money - cost
            },
            phase: 'studio'
        })
    }

    return (
        <div className="flex flex-col w-full h-full pb-20 animate-in fade-in duration-500">
            <div className="mb-6 mt-4">
                <h1 className="text-2xl font-bold font-display text-[#4A9FE0] drop-shadow-sm">
                    새로운 연습생을 발굴하세요
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                    프로필을 신중히 검토하여 최적의 그룹을 구성하세요. (최소 2명 ~ 최대 5명)
                </p>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 gap-4 flex-1">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="polaroid-card animate-pulse bg-white/50 h-56 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-[#4A9FE0]/50 animate-spin" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 flex-1">
                    {candidates.map((idol, i) => (
                        <div key={idol.id} style={{ animationDelay: `${i * 50}ms` }} className="card-enter">
                            <IdolCard
                                idol={idol}
                                isSelected={selectedIds.has(idol.id)}
                                onToggle={() => toggleSelection(idol.id)}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* 하단 고정 액션바 (Phoning 탭 바 스타일) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 z-40 shadow-[0_-4px_24px_rgba(0,0,0,0.05)]">
                <div className="max-w-sm mx-auto flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-500 font-bold">선택 <span className="text-[#FF6EB4] stat-number">{selectedIds.size}</span>명</span>
                        <span className="text-sm text-slate-800 font-bold stat-number">
                            {(selectedIds.size * 200).toLocaleString()}만원
                        </span>
                    </div>
                    <Button
                        className="flex-1 bg-[#4A9FE0] hover:bg-[#3b82f6] text-white font-bold h-12 rounded-xl transition-transform active:scale-95 disabled:bg-slate-300 disabled:text-white neo-btn"
                        onClick={handleConfirm}
                        disabled={selectedIds.size < 2 || loading}
                    >
                        {selectedIds.size < 2 ? '최소 2명 선택' : '캐스팅 확정'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
