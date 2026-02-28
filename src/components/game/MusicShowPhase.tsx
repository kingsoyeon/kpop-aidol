import { useState, useEffect, useRef } from 'react'
import { GameState, JudgeResult, GAME_CONSTANTS, ChartRank } from '@/types/game'
import { Button } from '@/components/ui/button'

interface Props {
    gameState: GameState
    updateState: (updates: Partial<GameState>) => void
}

interface ChatMessage {
    id: string
    username: string
    text: string
    isHighlight?: boolean
}

// PRD §4.4: 팬 채팅 풀 (Weverse LIVE 감성)
const CHAT_POOL = [
    '대박이다!!!!!', '오 노래 좋은데?', '진짜 최고다 ㅠㅠㅠ', '우리 애들 미모 무슨 일...',
    '하트 뿅뿅 ❤️', '이번 컨셉 찰떡이네', '이거 1위 각이다', '퍼포먼스 미쳤다...',
    '와 라이브 찢었네', '빨리 무대 보고싶당', '이번 음원 대박날듯!!!', '사랑해 💖',
    '스밍 돌리자!!!!', '폼 미쳤다 ㄷㄷ', '오 마이 갓', 'so beautiful, crying 😭',
]
const USERNAMES = ['tokki', 'kpop_fan1', 'stan_nova', 'luv_idol', 'jieun_99', 'happy_fan', 'music_lover', 'souloosong']

/** PRD §7.2: 심사 fallback — 50~80 랜덤 점수 */
function buildFallbackJudge(): JudgeResult {
    const base = Math.floor(Math.random() * 30) + 50
    const ranks: ChartRank[] = ['상위권', '중위권', '하위권']
    return {
        scores: {
            composition: base + Math.floor(Math.random() * 10),
            vocal: base + Math.floor(Math.random() * 10),
            performance: base + Math.floor(Math.random() * 10),
            popularity: base + Math.floor(Math.random() * 10),
            buzz: base + Math.floor(Math.random() * 10),
        },
        totalScore: base,
        chartProbability: base,
        comment: '평가 시스템 점검 중입니다. 랜덤 결과가 적용됩니다.',
        result: ranks[Math.floor(Math.random() * ranks.length)],
    }
}

const HeartParticle = ({ delay = 0 }: { delay?: number }) => (
    <div
        className="heart-float"
        style={{ animationDelay: `${delay}ms`, right: `${16 + Math.random() * 24}px` }}
    >
        ❤️
    </div>
)

export default function MusicShowPhase({ gameState, updateState }: Props) {
    const [chats, setChats] = useState<ChatMessage[]>([])
    const [viewerCount, setViewerCount] = useState(140_239)
    const [chatCount, setChatCount] = useState(5_014)
    const [isJudging, setIsJudging] = useState(false)
    const [judgeData, setJudgeData] = useState<JudgeResult | null>(null)
    const [showHearts, setShowHearts] = useState(false)
    // 채팅 애니메이션 활성화 플래그 — judgeData를 dependency에 넣으면 interval이 중복 등록되므로 boolean으로 분리
    const [chatActive, setChatActive] = useState(false)

    // PRD §4.4 Race Condition 방지: 채팅 인터벌은 별도 ref로 관리
    const chatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    // 1. 팀 채팅 애니메이션 — chatActive=true 시만 동작, 심사 API와 완전 분리
    useEffect(() => {
        if (!chatActive) return

        chatIntervalRef.current = setInterval(() => {
            const isSuperChat = Math.random() < 0.1
            const newChat: ChatMessage = {
                id: crypto.randomUUID(),
                username: USERNAMES[Math.floor(Math.random() * USERNAMES.length)],
                text: CHAT_POOL[Math.floor(Math.random() * CHAT_POOL.length)],
                isHighlight: isSuperChat,
            }
            // 채팅 최대 6개 유지 (PRD §UI 가이드라인)
            setChats(prev => {
                const next = [...prev, newChat]
                return next.length > 6 ? next.slice(-6) : next
            })
            setViewerCount(p => p + Math.floor(Math.random() * 100))
            setChatCount(p => p + 1)

            if (Math.random() < 0.3) {
                setShowHearts(true)
                setTimeout(() => setShowHearts(false), 200)
            }
        }, 800)

        return () => {
            if (chatIntervalRef.current) clearInterval(chatIntervalRef.current)
        }
    }, [chatActive])

    // 2. 심사 API 호출 — 유저 액션으로만 트리거 (Race Condition 방지)
    const startJudge = async () => {
        setIsJudging(true)
        setChatActive(true) // 심사 시작과 동시에 채팅 활성화
        try {
            const res = await fetch('/api/judge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    track: gameState.currentTrack,
                    members: gameState.currentGroup,
                    company: {
                        reputation: gameState.company.reputation,
                        fanCount: gameState.company.fanCount,
                    },
                    turn: gameState.turn,
                }),
            })
            if (!res.ok) throw new Error('Judge API failed')
            const data: JudgeResult = await res.json()
            setJudgeData(data)
        } catch (err) {
            console.error('[MusicShowPhase] 심사 API 실패, fallback 사용:', err)
            // PRD §7.2: 심사 fallback — 50~80 랜덤 점수
            setJudgeData(buildFallbackJudge())
        } finally {
            setIsJudging(false) // chatActive는 judgeData가 세팅된 후에도 유지—심사 완료 후도 채팅 지속
        }
    }

    // 3. 결과 페이즈로 전환 — judgeData를 pendingEvent에 담아서 전달
    const handleResult = () => {
        if (!judgeData) return
        updateState({
            history: [...gameState.history, {
                title: gameState.currentTrack?.title || 'Unknown',
                result: judgeData.result,
                moneyChange: GAME_CONSTANTS.RESULT_EFFECTS[judgeData.result].money,
                fanChange: GAME_CONSTANTS.RESULT_EFFECTS[judgeData.result].fanCount,
                turn: gameState.turn,
            }],
            phase: 'result',
            pendingEvent: { type: 'judgeResult', data: judgeData },
        })
    }

    const scores = judgeData?.scores ?? { composition: 0, vocal: 0, performance: 0, popularity: 0, buzz: 0 }

    return (
        <div className="flex flex-col w-full h-full pb-24 animate-in fade-in duration-500">
            {/* 라이브 대시보드 (Weverse/VLIVE 직접 참조) */}
            <div className="flex items-center justify-between bg-black/5 rounded-lg p-2 mb-4 mt-2">
                <span className="live-badge">
                    <span className="live-dot animate-pulse" />
                    LIVE
                </span>
                <div className="flex gap-4">
                    <span className="viewer-count text-[#FF3B30]">👁 {viewerCount.toLocaleString()}</span>
                    <span className="chat-count text-[#4A9FE0]">💬 {chatCount.toLocaleString()}</span>
                </div>
            </div>

            <div className="mb-4">
                <h1 className="text-2xl font-bold font-['NeoDunggeunmo'] text-[#4A9FE0]">음악 방송 출격</h1>
                <p className="text-xs text-slate-500 mt-1">
                    [{gameState.currentTrack?.title || '현재 음원'}] 무대 시작!
                </p>
            </div>

            {/* 무대 영상 영역 */}
            <div className="relative w-full aspect-video bg-gradient-to-br from-slate-800 to-black rounded-xl overflow-hidden shadow-lg border-2 border-slate-700/50 mb-6 flex items-center justify-center">
                {isJudging ? (
                    <div className="text-[#FF6EB4] font-bold text-xl animate-pulse tracking-widest">
                        PERFORMING...
                    </div>
                ) : judgeData ? (
                    <div className="text-[#4ECDC4] font-bold text-xl animate-in zoom-in">
                        STAGE CLEAR!
                    </div>
                ) : (
                    <div className="text-white/50 font-bold">대기중...</div>
                )}

                {/* 채팅 오버레이 */}
                <div className="chat-container">
                    {chats.map(chat => (
                        <div key={chat.id} className={`chat-bubble ${chat.isHighlight ? 'chat-bubble--highlight' : ''}`}>
                            <span className="chat-bubble__username">{chat.username}</span>
                            <span className="text-slate-800">{chat.text}</span>
                        </div>
                    ))}
                </div>

                {/* 하트 파티클 */}
                {showHearts && <HeartParticle />}
            </div>

            {/* 심사 패널 */}
            <div className="glass-card p-5 mb-4 relative overflow-hidden min-h-[220px]">
                {/* 심사 시작 오버레이 */}
                {!judgeData && !isJudging && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                        <Button
                            id="btn-start-judge"
                            onClick={startJudge}
                            className="bg-[#FF6EB4] hover:bg-[#ff4e9f] text-white font-bold px-8 shadow-lg"
                        >
                            심사 시작
                        </Button>
                    </div>
                )}

                {/* 심사 중 스피너 */}
                {isJudging && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-10 text-center gap-2">
                        <div className="w-8 h-8 rounded-full border-4 border-[#4A9FE0]/30 border-t-[#4A9FE0] animate-spin" />
                        <p className="text-sm font-bold text-[#4A9FE0] animate-pulse">심사위원들이 평가하고 있습니다...</p>
                    </div>
                )}

                <div className="space-y-4 relative z-0">
                    <h3 className="font-bold text-slate-700">심사위원 점수</h3>
                    <div className="space-y-3 text-[0.75rem] font-bold text-slate-600">
                        {([
                            { k: 'composition' as const, l: '구성력', c: '#4ECDC4' },
                            { k: 'vocal' as const, l: '보컬 완성도', c: '#FF6EB4' },
                            { k: 'performance' as const, l: '퍼포먼스', c: '#F59E0B' },
                            { k: 'popularity' as const, l: '대중성', c: '#4A9FE0' },
                            { k: 'buzz' as const, l: '화제성', c: '#C084FC' },
                        ] as const).map((item, i) => (
                            <div key={item.k} className="flex justify-between items-center">
                                <span className="w-16">{item.l}</span>
                                <div className="flex-1 mx-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full transition-all duration-1000 ease-out rounded-full"
                                        style={{
                                            width: `${scores[item.k]}%`,
                                            backgroundColor: item.c,
                                            transitionDelay: `${i * 150}ms`,
                                        }}
                                    />
                                </div>
                                <span className="stat-number min-w-[20px] text-right">{scores[item.k]}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100">
                        <p className="text-sm text-slate-700 italic font-medium">"{judgeData?.comment || '...'}"</p>
                    </div>
                </div>
            </div>

            {/* 하단 버튼 */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 z-40 shadow-[0_-4px_24px_rgba(0,0,0,0.05)]">
                <div className="max-w-sm mx-auto">
                    <Button
                        id="btn-show-result"
                        className="w-full h-14 bg-[#4A9FE0] hover:bg-[#3b82f6] text-white text-lg font-bold rounded-xl shadow-[0_4px_14px_rgba(74,159,224,0.4)] disabled:bg-slate-300 disabled:text-white transition-all duration-300"
                        onClick={handleResult}
                        disabled={!judgeData || isJudging}
                    >
                        결과 확인하기
                    </Button>
                </div>
            </div>
        </div>
    )
}
