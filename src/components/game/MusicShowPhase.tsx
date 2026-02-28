import { useState, useEffect } from 'react'
import { GameState } from '@/types/game'
import { Button } from '@/components/ui/button'
import { generateUUID } from '@/lib/utils/uuid'

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

const CHAT_POOL = [
    "대박이다!!!!!", "오 노래 좋은데?", "진짜 최고다 ㅠㅠㅠ", "우리 애들 미모 무슨 일...",
    "하트 뿅뿅 ❤️", "이번 컨셉 찰떡이네", "이거 1위 각이다", "퍼포먼스 미쳤다...",
    "와 라이브 찢었네", "빨리 무대 보고싶당", "이번 음원 대박날듯!!!", "사랑해 💖",
    "스밍 돌리자!!!!", "폼 미쳤다 ㄷㄷ", "오 마이 갓", "so beautiful, crying 😭"
]
const USERNAMES = ['tokki', 'kpop_fan1', 'stan_nova', 'luv_idol', 'jieun_99', 'happy_fan', 'music_lover', 'souloosong']

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
    const [viewerCount, setViewerCount] = useState(140239)
    const [chatCount, setChatCount] = useState(5014)
    const [isJudging, setIsJudging] = useState(false)
    const [judgeData, setJudgeData] = useState<any>(null)
    const [showHearts, setShowHearts] = useState(false)

    // 1. 팬 채팅 애니메이션용 useEffect (분리 필수)
    useEffect(() => {
        if (!isJudging && !judgeData) return

        const chatInterval = setInterval(() => {
            const isSuperChat = Math.random() < 0.1
            const text = CHAT_POOL[Math.floor(Math.random() * CHAT_POOL.length)]
            const username = USERNAMES[Math.floor(Math.random() * USERNAMES.length)]

            const newChat: ChatMessage = {
                id: generateUUID(),
                username,
                text,
                isHighlight: isSuperChat
            }

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

        return () => clearInterval(chatInterval)
    }, [isJudging, judgeData])

    // 2. 심사 API 호출 (User action triggered)
    const startJudge = async () => {
        setIsJudging(true)
        try {
            const res = await fetch('/api/judge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    track: gameState.currentTrack,
                    members: gameState.currentGroup,
                    company: gameState.company,
                    turn: gameState.turn
                })
            })
            const data = await res.json()
            setJudgeData(data)
        } catch (err) {
            console.error(err)
            setJudgeData({
                scores: { composition: 70, vocal: 70, performance: 70, popularity: 70, buzz: 70 },
                totalScore: 70, chartProbability: 50, comment: '음... 평가를 보류하겠습니다.', result: '중위권'
            })
        } finally {
            setIsJudging(false)
        }
    }

    const handleResult = () => {
        if (!judgeData) return
        updateState({
            history: [...gameState.history, {
                title: gameState.currentTrack?.title || 'Unknown',
                result: judgeData.result
            }],
            phase: 'result',
            // 임시로 judgeData를 pendingEvent에 객체로 담아서 resultPhase로 전달 (or resultPhase에서 처리 가능하게)
            pendingEvent: { type: 'judgeResult', data: judgeData }
        })
    }

    const scores = judgeData?.scores || { composition: 0, vocal: 0, performance: 0, popularity: 0, buzz: 0 }

    return (
        <div className="flex flex-col w-full h-full pb-24 animate-in fade-in duration-500">
            {/* 라이브 대시보드 */}
            <div className="live-dashboard flex items-center justify-between bg-black/5 rounded-lg p-2 mb-4 mt-2">
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

            {/* 무대 영상 영역 (현재 그룹 표시) */}
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
                {showHearts && (
                    <HeartParticle />
                )}
            </div>

            {/* 심사 시작 컨테이너 */}
            <div className="glass-card p-5 mb-4 relative overflow-hidden min-h-[220px]">
                {!judgeData && !isJudging && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                        <Button onClick={startJudge} className="bg-[#FF6EB4] hover:bg-[#ff4e9f] text-white font-bold px-8 shadow-lg">
                            심사 시작
                        </Button>
                    </div>
                )}

                {isJudging && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-10 text-center gap-2">
                        <div className="w-8 h-8 rounded-full border-4 border-[#4A9FE0]/30 border-t-[#4A9FE0] animate-spin"></div>
                        <p className="text-sm font-bold text-[#4A9FE0] animate-pulse">심사위원들이 평가하고 있습니다...</p>
                    </div>
                )}

                <div className="space-y-4 relative z-0">
                    <h3 className="font-bold text-slate-700">심사위원 점수</h3>
                    <div className="space-y-3 text-[0.75rem] font-bold text-slate-600">
                        {[
                            { k: 'composition', l: '구성력', c: '#4ECDC4' },
                            { k: 'vocal', l: '보컬 완성도', c: '#FF6EB4' },
                            { k: 'performance', l: '퍼포먼스', c: '#F59E0B' },
                            { k: 'popularity', l: '대중성', c: '#4A9FE0' },
                            { k: 'buzz', l: '화제성', c: '#C084FC' }
                        ].map((item, i) => (
                            <div key={item.k} className="flex justify-between items-center">
                                <span className="w-16">{item.l}</span>
                                <div className="flex-1 mx-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full transition-all duration-1000 ease-out rounded-full"
                                        style={{ width: `${scores[item.k]}%`, backgroundColor: item.c, transitionDelay: `${i * 150}ms` }}
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
