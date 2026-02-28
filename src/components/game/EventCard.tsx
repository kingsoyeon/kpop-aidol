import { useState, useEffect } from 'react'
import { GameState, GAME_CONSTANTS } from '@/types/game'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Loader2 } from 'lucide-react'

interface Props {
    gameState: GameState
    updateState: (updates: Partial<GameState>) => void
}

interface Choice {
    text: string
    effect: { reputation: number; money: number; fanCount: number }
    resultMessage: string
}

interface EventData {
    title: string
    description: string
    memberName: string
    choices: Choice[]
}

/** PRD §7.2: 이벤트 fallback — 사전 정의된 이벤트 배열에서 랜덤 선택 */
function buildFallbackEvent(memberName: string): EventData {
    const events: EventData[] = [
        {
            title: '스케줄 펑크',
            description: `${memberName}이(가) 컨디션 난조로 첫 방송 스케줄을 펑크냈습니다. 팬들의 우려가 커지고 있습니다.`,
            memberName,
            choices: [
                { text: '즉각 휴식 처방', effect: { reputation: -5, money: 0, fanCount: -1_000 }, resultMessage: '팬들이 아쉽지만 건강을 응원합니다.' },
                { text: '무리해서라도 참석', effect: { reputation: -20, money: 500_000, fanCount: -5_000 }, resultMessage: '방송은 했지만 비판 여론이 거셉니다.' },
                { text: '팬 소통 라이브 개최', effect: { reputation: 5, money: -500_000, fanCount: 2_000 }, resultMessage: '진정성 있는 소통으로 팬덤이 굳건해졌습니다.' },
            ],
        },
        {
            title: 'SNS 말실수',
            description: `${memberName}이(가) 인스타그램 라이브 중 부적절한 발언을 해 논란이 확산되고 있습니다.`,
            memberName,
            choices: [
                { text: '즉각 사과문 발표', effect: { reputation: -5, money: 0, fanCount: -2_000 }, resultMessage: '빠른 대처로 논란이 소폭 가라앉았습니다.' },
                { text: '무대응으로 일관', effect: { reputation: -20, money: 0, fanCount: -10_000 }, resultMessage: '팬들의 실망감이 커져 평판이 크게 하락했습니다.' },
                { text: '자필 편지 게시', effect: { reputation: 2, money: -500_000, fanCount: 1_000 }, resultMessage: '진정성에 일부 팬들이 마음을 돌렸습니다.' },
            ],
        },
    ]
    return events[Math.floor(Math.random() * events.length)]
}

export default function EventCard({ gameState, updateState }: Props) {
    const [eventData, setEventData] = useState<EventData | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null)

    useEffect(() => {
        const fetchEvent = async () => {
            setLoading(true)
            try {
                const res = await fetch('/api/event', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        members: gameState.currentGroup,
                        company: gameState.company,
                        turn: gameState.turn,
                    }),
                })
                if (!res.ok) throw new Error('Event API failed')
                const data: EventData = await res.json()
                setEventData(data)
            } catch (err) {
                console.error('[EventCard] 이벤트 API 실패, fallback 사용:', err)
                const memberName = gameState.currentGroup[0]?.name ?? '멤버'
                setEventData(buildFallbackEvent(memberName))
            } finally {
                setLoading(false)
            }
        }
        fetchEvent()
    }, [])

    const handleChoice = (choice: Choice) => {
        setSelectedChoice(choice)
    }

    const handleNext = () => {
        if (!selectedChoice) return

        const newMoney = gameState.company.money + selectedChoice.effect.money
        const newReputation = Math.max(0, gameState.company.reputation + selectedChoice.effect.reputation)
        const newFanCount = Math.max(0, gameState.company.fanCount + selectedChoice.effect.fanCount)

        // 이벤트 선택 후 게임오버 조건 체크 (PRD §3.1)
        if (newMoney <= 0 || newReputation <= 0) {
            updateState({
                company: {
                    ...gameState.company,
                    money: newMoney,
                    reputation: newReputation,
                    fanCount: newFanCount,
                },
                phase: 'gameover',
                pendingEvent: null,
            })
            return
        }

        updateState({
            company: {
                ...gameState.company,
                money: newMoney,
                reputation: newReputation,
                fanCount: newFanCount,
            },
            phase: 'casting',
            pendingEvent: null,
        })
    }

    // 로딩 상태
    if (loading || !eventData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-[#EF4444]/50 animate-spin" />
                <p className="mt-4 text-[#EF4444] font-bold animate-pulse">위기 상황 분석 중...</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col w-full h-full pb-24 animate-in fade-in duration-500 gap-6 pt-4">
            {/* Weverse 팬레터 스타일 위기 카드 */}
            <div className="bg-[#FFFDF8] p-6 rounded-2xl shadow-[0_8px_32px_rgba(239,68,68,0.15)] border border-[#EF4444]/20 relative overflow-hidden">
                {/* 종이 질감 노이즈 */}
                <div
                    className="absolute inset-0 opacity-5 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '16px 16px' }}
                />

                <div className="flex items-center gap-2 text-[#EF4444] mb-4">
                    <AlertTriangle className="w-6 h-6" />
                    <h2 className="text-xl font-bold font-['NeoDunggeunmo']">긴급 이벤트 발생</h2>
                </div>

                <h3 className="text-2xl font-bold text-slate-800 mb-2 leading-tight break-keep">
                    {eventData.title}
                </h3>
                <p className="text-slate-600 font-medium leading-relaxed break-keep">
                    {eventData.description}
                </p>
                <div className="mt-4 inline-block bg-[#EF4444]/10 text-[#EF4444] px-3 py-1 rounded-full text-xs font-bold">
                    관련 멤버: {eventData.memberName}
                </div>
            </div>

            {/* 선택지 혹은 결과 표시 */}
            {!selectedChoice ? (
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-500 px-1">대응 방법 선택</h3>
                    {eventData.choices.map((choice, idx) => (
                        <button
                            key={idx}
                            id={`btn-event-choice-${idx}`}
                            className="w-full text-left glass-card p-4 hover:border-[#FF6EB4] transition-colors active:scale-[0.98]"
                            onClick={() => handleChoice(choice)}
                        >
                            <div className="font-bold text-slate-700 mb-2">{choice.text}</div>
                            <div className="flex flex-wrap gap-2">
                                {choice.effect.reputation !== 0 && (
                                    <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-sm ${choice.effect.reputation > 0 ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>
                                        평판 {choice.effect.reputation > 0 ? '+' : ''}{choice.effect.reputation}
                                    </span>
                                )}
                                {choice.effect.money !== 0 && (
                                    <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-sm ${choice.effect.money > 0 ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>
                                        자금 {choice.effect.money > 0 ? '+' : ''}{(Math.abs(choice.effect.money) / 10_000).toLocaleString()}만
                                    </span>
                                )}
                                {choice.effect.fanCount !== 0 && (
                                    <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-sm ${choice.effect.fanCount > 0 ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>
                                        팬덤 {choice.effect.fanCount > 0 ? '+' : ''}{choice.effect.fanCount.toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                // 선택 결과 카드
                <div className="glass-card p-6 animate-in slide-in-from-bottom-4 text-center">
                    <h3 className="font-bold text-slate-800 mb-2">대응 결과</h3>
                    <p className="text-[#4A9FE0] font-bold mb-6">{selectedChoice.resultMessage}</p>
                    <Button
                        id="btn-event-continue"
                        className="w-full h-12 bg-[#4A9FE0] hover:bg-[#3b82f6] text-white font-bold rounded-xl shadow-[0_4px_14px_rgba(74,159,224,0.4)]"
                        onClick={handleNext}
                    >
                        다음 컴백 준비
                    </Button>
                </div>
            )}
        </div>
    )
}
