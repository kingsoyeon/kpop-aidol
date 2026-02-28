import { useState, useEffect, useCallback } from 'react'
import { GameState } from '@/types/game'
import { Button } from '@/components/ui/button'

interface Props {
    gameState: GameState
    updateState: (updates: Partial<GameState>) => void
}

interface ChatMessage {
    id: string
    username: string    /* 팬 닉네임 */
    text: string        /* 채팅 내용 (한/영 혼용) */
    isHighlight?: boolean /* 슈퍼챗 강조 */
}

interface HeartData {
    id: string
    delay: number
    right: number
    emoji: string
}

const PRE_CHAT_POOL = [
    "언제 시작해 ㅠㅠ", "빨리 무대 보고싶당!!", "대기 타는 중!!", "이번 컨셉 대박일듯",
    "두근두근...", "빨리 나와라 얍", "완전 기대된다 ㅠㅠ", "오픈콜 대기중"
]
const LIVE_CHAT_POOL = [
    "대박이다!!!!!", "오 노래 좋은데?", "진짜 최고다 ㅠㅠㅠ", "우리 애들 미모 무슨 일...",
    "하트 뿅뿅 ❤️", "이번 컨셉 찰떡이네", "이거 1위 각이다", "퍼포먼스 미쳤다...",
    "와 라이브 찢었네", "빨리 무대 보고싶당", "이번 음원 대박날듯!!!", "사랑해 💖",
    "스밍 돌리자!!!!", "폼 미쳤다 ㄷㄷ", "오 마이 갓", "so beautiful, crying 😭"
]
const USERNAMES = ['tokki', 'kpop_fan1', 'stan_nova', 'luv_idol', 'jieun_99', 'happy_fan', 'music_lover', 'souloosong']

const MAX_CHAT = 6

export default function MusicShowPhase({ gameState, updateState }: Props) {
    const [chats, setChats] = useState<ChatMessage[]>([])
    const [viewerCount, setViewerCount] = useState(140239)
    const [chatCount, setChatCount] = useState(5014)
    const [isJudging, setIsJudging] = useState(false)
    const [judgeData, setJudgeData] = useState<any>(null)
    const [hearts, setHearts] = useState<HeartData[]>([])

    // 1. 팬 채팅 애니메이션용 useEffect
    useEffect(() => {
        const chatInterval = setInterval(() => {
            const isSuperChat = Math.random() < 0.1
            const pool = (isJudging || judgeData) ? LIVE_CHAT_POOL : PRE_CHAT_POOL
            const text = pool[Math.floor(Math.random() * pool.length)]
            const username = USERNAMES[Math.floor(Math.random() * USERNAMES.length)]

            const newChat: ChatMessage = {
                id: crypto.randomUUID(),
                username,
                text,
                isHighlight: isSuperChat
            }

            setChats(prev => {
                const next = [...prev, newChat]
                return next.length > MAX_CHAT ? next.slice(-MAX_CHAT) : next
            })

            setViewerCount(p => p + Math.floor(Math.random() * 100))
            setChatCount(p => p + 1)

            // 평소에는 회색 하트가 무작위로 1~2개씩 시간차를 두고 자연스럽게 떠오름
            if (Math.random() < 0.8) {
                const heartCount = Math.random() < 0.5 ? 1 : 2
                spawnHearts(heartCount, 400, '🤍')
            }
        }, 800)

        return () => clearInterval(chatInterval)
    }, [isJudging, !!judgeData])

    const spawnHearts = useCallback((count: number, delayInterval: number = 0, emoji: string = '❤️') => {
        const newHearts = Array.from({ length: count }).map((_, i) => ({
            id: crypto.randomUUID(),
            delay: i * delayInterval,
            right: 16 + Math.random() * 24,
            emoji
        }))
        setHearts(prev => [...prev, ...newHearts])

        // 2초 후 제거 (애니메이션 종료 시점 예상)
        setTimeout(() => {
            setHearts(prev => prev.filter(h => !newHearts.find(nh => nh.id === h.id)))
        }, 2000 + count * delayInterval)
    }, [])

    // 2. 심사 API 호출 (User action triggered)
    const startJudge = async () => {
        if (isJudging) return
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

            // 1위 시 하트 파티클 10~15개 대량 발사 (50ms 간격)
            if (data.result === '1위') {
                spawnHearts(Math.floor(Math.random() * 6) + 10, 50)
            }
        } catch (err) {
            console.error(err)
            const fallbackData = {
                scores: { composition: 70, vocal: 70, performance: 70, popularity: 70, buzz: 70 },
                totalScore: 70, chartProbability: 50, comment: '음... 평가를 보류하겠습니다.', result: '중위권'
            }
            setJudgeData(fallbackData)
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
            pendingEvent: { type: 'judgeResult', data: judgeData }
        })
    }

    const scores = judgeData?.scores || { composition: 0, vocal: 0, performance: 0, popularity: 0, buzz: 0 }

    return (
        <div className="flex flex-col w-full h-full pb-24 animate-in fade-in duration-500">
            {/* 2.3.C. LIVE 대시보드 */}
            <div className="live-dashboard flex items-center justify-between bg-black/5 rounded-lg p-2 mb-4 mt-2">
                <span className="live-badge">
                    <span className="live-dot animate-pulse" />
                    LIVE
                </span>
                <div className="flex gap-4">
                    <span className="viewer-count">👁 {viewerCount.toLocaleString()}</span>
                    <span className="chat-count">💬 {chatCount.toLocaleString()}</span>
                </div>
            </div>

            <div className="mb-4 animate-[countPulse_2s_infinite]">
                <h1 className="text-2xl font-bold font-display text-[#4A9FE0] flex items-center gap-2">
                    <span className="live-dot bg-[#FF3B30] w-2 h-2" />
                    음악 방송 출격
                </h1>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                    무대 위에서 가장 빛나는 순간
                </p>
            </div>

            {/* 트랙 및 그룹 정보 */}
            <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                <div className="flex-shrink-0 glass-card p-3 min-w-[140px]">
                    <p className="text-[0.65rem] font-bold text-slate-400 mb-1">CURRENT TRACK</p>
                    <h2 className="text-sm font-bold text-slate-800 truncate">{gameState.currentTrack?.title}</h2>
                    <div className="flex gap-1 mt-1">
                        <span className="text-[0.6rem] bg-[#4A9FE0]/10 text-[#4A9FE0] px-1.5 py-0.5 rounded-full font-bold">
                            #{gameState.currentTrack?.concept}
                        </span>
                        <span className="text-[0.6rem] bg-[#FF6EB4]/10 text-[#FF6EB4] px-1.5 py-0.5 rounded-full font-bold">
                            #{gameState.currentTrack?.targetMarket}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {gameState.currentGroup.map((member, i) => (
                        <div key={member.name} className="flex flex-col items-center gap-1 animate-in slide-in-from-left" style={{ animationDelay: `${i * 100}ms` }}>
                            <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-slate-200">
                                <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-[0.6rem] font-bold text-slate-500">{member.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 무대 영역 (세로 확장 & 하단 채팅 입력탭/하트 탭 추가) */}
            <div className="relative w-full aspect-[3/4] sm:aspect-[4/5] min-h-[420px] bg-gradient-to-br from-slate-800 to-black rounded-xl overflow-hidden shadow-lg border-2 border-slate-700/50 mb-6 flex flex-col">

                {/* 메인 뷰어 */}
                <div
                    className="flex-1 relative flex items-center justify-center cursor-pointer overflow-hidden"
                    onClick={() => spawnHearts(Math.floor(Math.random() * 3) + 3, 0, '❤️')} // 무대영역 탭 시 핑크 하트
                >
                    {/* 심사 중 조명 효과 오버레이 */}
                    {isJudging && (
                        <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent animate-pulse pointer-events-none z-0" style={{ animationDuration: '1.5s' }} />
                    )}

                    {isJudging ? (
                        <div className="text-[#FF6EB4] font-bold text-xl animate-pulse tracking-widest font-display">
                            PERFORMING...
                        </div>
                    ) : judgeData ? (
                        <div className="text-[#4ECDC4] font-bold text-xl animate-in zoom-in font-display">
                            STAGE CLEAR!
                        </div>
                    ) : (
                        <div className="text-white/50 font-bold font-display">대기중...</div>
                    )}

                    {/* 2.3.D. 채팅 오버레이 */}
                    <div className="chat-container !bottom-2">
                        {chats.map(chat => (
                            <div key={chat.id} className={`chat-bubble ${chat.isHighlight ? 'chat-bubble--highlight' : ''}`}>
                                <span className="chat-bubble__username">{chat.username}</span>
                                <span className="text-slate-800">{chat.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* 2.3.E. 하트 파티클 */}
                    {hearts.map(heart => (
                        <div
                            key={heart.id}
                            className="heart-float"
                            style={{
                                animationDelay: `${heart.delay}ms`,
                                right: `${heart.right}px`
                            }}
                        >
                            {heart.emoji}
                        </div>
                    ))}
                </div>

                {/* 하단 입력 탭 & 하트 탭 버튼 */}
                <div className="h-14 bg-black/40 border-t border-white/10 flex items-center px-4 gap-3 shrink-0 relative z-20">
                    <div className="flex-1 bg-white/10 rounded-full h-9 flex items-center px-4 border border-white/5">
                        <span className="text-white/40 text-[0.7rem] font-bold font-sans">실시간 채팅을 입력해보세요...</span>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            spawnHearts(1, 0, '❤️')
                        }}
                        className="w-10 h-10 rounded-full bg-[#FF6EB4] flex items-center justify-center shadow-[0_0_12px_rgba(255,110,180,0.5)] active:scale-90 transition-transform flex-shrink-0 border border-white/20"
                    >
                        <span className="text-lg leading-none translate-y-[1px]">❤️</span>
                    </button>
                </div>
            </div>

            {/* 심사 시작 컨테이너 */}
            <div className="glass-card p-5 mb-4 relative overflow-hidden min-h-[220px]">
                {!judgeData && !isJudging && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                        <Button
                            onClick={startJudge}
                            className="bg-[#FF6EB4] hover:bg-[#ff4e9f] text-white font-bold px-8 shadow-lg neo-btn"
                        >
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
                    <div className="flex justify-between items-end">
                        <h3 className="font-bold text-slate-700">심사위원 점수</h3>
                        {judgeData && (
                            <div className="text-right">
                                <p className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-tighter">Win Probability</p>
                                <p className="text-xl font-bold text-[#FF6EB4] stat-number leading-none">{judgeData.chartProbability}%</p>
                            </div>
                        )}
                    </div>
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

                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-start gap-4">
                        <p className="text-sm text-slate-700 italic font-medium flex-1">"{judgeData?.comment || '...'}"</p>
                        {judgeData && (
                            <div className="text-center px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                                <p className="text-[0.6rem] font-bold text-slate-400">TOTAL</p>
                                <p className="text-lg font-bold text-[#4A9FE0] stat-number leading-none">{judgeData.totalScore}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 하단 버튼 */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 z-40 shadow-[0_-4px_24px_rgba(0,0,0,0.05)]">
                <div className="max-w-sm mx-auto">
                    <Button
                        className="w-full h-14 bg-[#4A9FE0] hover:bg-[#3b82f6] text-white text-lg font-bold rounded-xl shadow-[0_4px_14px_rgba(74,159,224,0.4)] disabled:bg-slate-300 disabled:text-white transition-all duration-300 neo-btn"
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

