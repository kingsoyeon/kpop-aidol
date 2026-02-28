import { useState, useEffect } from 'react'
import { GameState } from '@/types/game'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Loader2 } from 'lucide-react'

interface Props {
    gameState: GameState
    updateState: (updates: Partial<GameState>) => void
}

export default function EventCard({ gameState, updateState }: Props) {
    const [eventData, setEventData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [selectedChoice, setSelectedChoice] = useState<any>(null)

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await fetch('/api/event', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        members: gameState.currentGroup,
                        company: gameState.company,
                        turn: gameState.turn
                    })
                })
                const data = await res.json()
                setEventData(data)
            } catch (err) {
                setEventData({
                    title: '스케줄 펑크',
                    description: '리더가 감기몸살로 첫 방송 스케줄을 펑크냈습니다.',
                    memberName: gameState.currentGroup[0]?.name || '멤버',
                    choices: [
                        { text: '휴식을 취하게 한다', effect: { reputation: -5, money: 0, fanCount: -1000 }, resultMessage: '팬들이 아쉽지만 건강을 응원합니다.' },
                        { text: '무리해서라도 참석시킨다', effect: { reputation: -20, money: 500000, fanCount: -5000 }, resultMessage: '방송은 했지만 비판 여론이 거셉니다.' },
                        { text: '팬들에게 소통 라이브를 켠다', effect: { reputation: 5, money: -500000, fanCount: 2000 }, resultMessage: '진정성 있는 소통으로 팬덤이 굳건해졌습니다.' }
                    ]
                })
            } finally {
                setLoading(false)
            }
        }
        fetchEvent()
    }, [])

    const handleChoice = (choice: any) => {
        setSelectedChoice(choice)
    }

    const handleNext = () => {
        if (!selectedChoice) return

        updateState({
            company: {
                ...gameState.company,
                money: gameState.company.money + selectedChoice.effect.money,
                reputation: gameState.company.reputation + selectedChoice.effect.reputation,
                fanCount: gameState.company.fanCount + selectedChoice.effect.fanCount
            },
            phase: 'casting' // 다시 처음 턴으로
        })
    }

    if (loading || !eventData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-[#EF4444]/50 animate-spin" />
                <p className="mt-4 text-[#EF4444] font-bold animate-pulse">위기 상황 발생...</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col w-full h-full pb-24 animate-in fade-in duration-500 gap-6 pt-4">
            {/* 종이 질감 배경 카드 (Weverse 팬레터 스타일) */}
            <div className="bg-[#FFFDF8] p-6 rounded-2xl shadow-[0_8px_32px_rgba(239,68,68,0.15)] border border-[#EF4444]/20 relative overflow-hidden">
                {/* 데코 잡음/패턴 (간단히 CSS로) */}
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>

                <div className="flex items-center gap-2 text-[#EF4444] mb-4">
                    <AlertTriangle className="w-6 h-6" />
                    <h2 className="text-xl font-bold font-['NeoDunggeunmo']">긴급 이벤트 발생</h2>
                </div>

                <h3 className="text-2xl font-bold text-slate-800 mb-2 leading-tight break-keep">{eventData.title}</h3>
                <p className="text-slate-600 font-medium leading-relaxed break-keep">
                    {eventData.description}
                </p>

                <div className="mt-4 inline-block bg-[#EF4444]/10 text-[#EF4444] px-3 py-1 rounded-full text-xs font-bold">
                    관련 멤버: {eventData.memberName}
                </div>
            </div>

            {!selectedChoice ? (
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-500 px-1">대응 방법 선택</h3>
                    {eventData.choices.map((choice: any, idx: number) => (
                        <button
                            key={idx}
                            className="w-full text-left glass-card p-4 hover:border-[#FF6EB4] transition-colors active:scale-[0.98]"
                            onClick={() => handleChoice(choice)}
                        >
                            <div className="font-bold text-slate-700 mb-1">{choice.text}</div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {choice.effect.reputation !== 0 && (
                                    <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-sm ${choice.effect.reputation > 0 ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>
                                        평판 {choice.effect.reputation > 0 ? '+' : ''}{choice.effect.reputation}
                                    </span>
                                )}
                                {choice.effect.money !== 0 && (
                                    <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-sm ${choice.effect.money > 0 ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>
                                        자금 {choice.effect.money > 0 ? '+' : ''}{(Math.abs(choice.effect.money) / 10000)}만
                                    </span>
                                )}
                                {choice.effect.fanCount !== 0 && (
                                    <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-sm ${choice.effect.fanCount > 0 ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>
                                        팬덤 {choice.effect.fanCount > 0 ? '+' : ''}{choice.effect.fanCount}
                                    </span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="glass-card p-6 animate-in slide-in-from-bottom-4 text-center">
                    <h3 className="font-bold text-slate-800 mb-2">결과</h3>
                    <p className="text-[#4A9FE0] font-bold mb-6">{selectedChoice.resultMessage}</p>

                    <Button
                        className="w-full h-12 bg-[#4A9FE0] hover:bg-[#3b82f6] text-white font-bold rounded-xl shadow-[0_4px_14px_rgba(74,159,224,0.4)]"
                        onClick={handleNext}
                    >
                        다음 턴으로 넘어가기
                    </Button>
                </div>
            )}
        </div>
    )
}
