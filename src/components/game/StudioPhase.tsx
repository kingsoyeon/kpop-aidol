import { useState, useEffect, useMemo } from 'react'
import { GameState, ConceptType, MarketType, Track } from '@/types/game'
import { Button } from '@/components/ui/button'
import AudioPlayer from '@/components/ui/AudioPlayer'
import { Loader2, Disc, Mic2, RefreshCw } from 'lucide-react'
import { translate } from '@/lib/i18n'

interface Props {
    gameState: GameState
    updateState: (updates: Partial<GameState>) => void
}

const CONCEPTS: { id: ConceptType; label: string; icon: string }[] = [
    { id: 'summer', label: '여름 청량', icon: '☀️' },
    { id: 'intense', label: '강렬 퍼포먼스', icon: '🔥' },
    { id: 'ballad', label: '발라드', icon: '🌙' },
    { id: 'hiphop', label: '힙합', icon: '🎤' },
]

const MARKETS: { id: MarketType; label: string; cost: number; icon: string }[] = [
    { id: 'domestic', label: '국내', cost: 0, icon: '🇰🇷' },
    { id: 'japan', label: '일본', cost: 1000000, icon: '🇯🇵' },
    { id: 'global', label: '글로벌', cost: 2000000, icon: '🌍' },
]

export default function StudioPhase({ gameState, updateState }: Props) {
    const [concept, setConcept] = useState<ConceptType>('summer')
    const [market, setMarket] = useState<MarketType>('domestic')

    const [isProducing, setIsProducing] = useState(false)
    const [loadingElapsed, setLoadingElapsed] = useState(0)

    const [producedTrack, setProducedTrack] = useState<Track | null>(null)

    // 웨이브 바 높이/속도를 마운트 시 1회만 계산 (리렌더 시 깜빡임 방지)
    // MEMORY.md §Known Issues: "Sound wave bars in StudioPhase might flicker due to Math.random()"
    const waveBars = useMemo(() =>
        Array.from({ length: 20 }, () => ({
            height: Math.floor(Math.random() * 100),
            duration: 0.5 + Math.random(),
        }))
        , [])

    // 4단계 로딩 콘솔 타이머
    useEffect(() => {
        let timer: NodeJS.Timeout
        if (isProducing) {
            timer = setInterval(() => {
                setLoadingElapsed(p => p + 1)
            }, 1000)
        } else {
            setLoadingElapsed(0)
        }
        return () => clearInterval(timer)
    }, [isProducing])

    const handleProduce = async (isRetry = false) => {
        const marketCost = MARKETS.find(m => m.id === market)?.cost || 0
        const cost = isRetry ? 2500000 : 5000000 + marketCost

        if (gameState.company.money < cost) {
            alert('자금이 부족합니다.')
            return
        }

        updateState({
            company: {
                ...gameState.company,
                money: gameState.company.money - cost
            }
        })

        setIsProducing(true)
        setProducedTrack(null)
        const startTime = Date.now()

        try {
            const res = await fetch('/api/produce', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    concept,
                    targetMarket: market,
                    members: gameState.currentGroup,
                    groupName: `${gameState.company.name} Group`
                })
            })

            if (!res.ok) throw new Error('API Error')

            const data = await res.json()

            setProducedTrack({
                id: crypto.randomUUID(),
                title: data.title,
                concept,
                targetMarket: market,
                lyrics: data.lyrics,
                audioUrl: data.audioUrl,
                members: gameState.currentGroup,
                producedAt: cost / 10000, // 만원 단위
            })

            // 최소 8초간 로딩을 보여주기 위한 딜레이 (사용자 경험 보장)
            const remainingTime = Math.max(0, 8000 - (Date.now() - startTime))
            if (remainingTime > 0) {
                await new Promise(r => setTimeout(r, remainingTime))
            }
        } catch (err) {
            console.error(err)
            alert("음원 생성 중 오류가 발생했습니다.")
        } finally {
            setIsProducing(false)
        }
    }

    const handleRelease = () => {
        if (!producedTrack) return
        updateState({
            currentTrack: producedTrack,
            phase: 'musicshow'
        })
    }

    const getLoadingStage = () => {
        if (loadingElapsed < 2) return translate('studio.producingLyrics', gameState.locale)
        if (loadingElapsed < 4) return translate('studio.producingSound', gameState.locale)
        if (loadingElapsed < 6) return translate('studio.producingAI', gameState.locale)
        return translate('studio.producingFinal', gameState.locale)
    }

    if (isProducing) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-500">
                <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-[0_8px_32px_rgba(74,159,224,0.15)] flex flex-col items-center w-full max-w-[320px] text-center border border-white/60">
                    <Disc className="w-16 h-16 text-[#FF6EB4] animate-spin mb-6" style={{ animationDuration: '3s' }} />
                    <h2 className="text-xl font-bold text-slate-800 mb-6">{getLoadingStage()}</h2>

                    <div className="flex gap-[3px] items-end h-8 justify-center w-full">
                        {waveBars.map((bar, i) => (
                            <div
                                key={i}
                                className="w-1.5 bg-[#4A9FE0] rounded-t-sm"
                                style={{
                                    height: `${bar.height}%`,
                                    animation: `bounceSlight ${bar.duration}s infinite alternate ease-in-out`
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (producedTrack) {
        return (
            <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-8 duration-500 pb-24">
                <div className="text-center mt-4">
                    <h1 className="text-2xl font-bold font-display text-[#4A9FE0] break-keep">{translate('studio.resultTitle', gameState.locale)}</h1>
                </div>

                <div className="glass-card p-5 flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-[#4A9FE0] to-[#FF6EB4] rounded-full flex items-center justify-center shadow-lg mb-4 text-3xl">
                        {CONCEPTS.find(c => c.id === concept)?.icon}
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-1">{producedTrack.title}</h2>
                    <p className="text-sm text-[#FF6EB4] font-bold mb-6">[{translate(`studio.${concept}`, gameState.locale)} / {translate(`studio.${market}`, gameState.locale)}]</p>

                    <AudioPlayer src={producedTrack.audioUrl} />

                    <div className="mt-6 w-full text-left bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                        <h3 className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1 break-keep"><Mic2 className="w-3 h-3 flex-shrink-0" /> {translate('studio.staff.lyrics', gameState.locale)}</h3>
                        <p className="text-sm text-slate-700 italic font-medium break-keep leading-relaxed whitespace-pre-wrap">{producedTrack.lyrics.hook}</p>
                    </div>
                </div>

                <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 z-40 shadow-[0_-4px_24px_rgba(0,0,0,0.05)]">
                    <div className="max-w-sm mx-auto flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1 h-14 rounded-xl border-[#4A9FE0]/30 text-[#4A9FE0] font-bold neo-btn break-keep"
                            onClick={() => handleProduce(true)}
                        >
                            <RefreshCw className="w-4 h-4 mr-1.5 flex-shrink-0" /> {translate('studio.produceBtn', gameState.locale)} (<span className="stat-number">-250</span>{translate('common.moneyUnit', gameState.locale)})
                        </Button>
                        <Button
                            className="flex-1 h-14 bg-[#4A9FE0] hover:bg-[#3b82f6] text-white font-bold rounded-xl shadow-[0_4px_14px_rgba(74,159,224,0.4)] neo-btn break-keep px-2"
                            onClick={handleRelease}
                        >
                            {translate('studio.nextStageBtn', gameState.locale)}
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    // 기본 설정 화면
    const targetCost = MARKETS.find(m => m.id === market)?.cost || 0
    const totalCost = 5000000 + targetCost

    return (
        <div className="flex flex-col w-full h-full pb-24 animate-in fade-in duration-500 gap-6">
            <div className="mt-4">
                <h1 className="text-2xl font-bold font-display text-[#4A9FE0] break-keep">{translate('studio.title', gameState.locale)}</h1>
                <p className="text-xs text-slate-500 mt-1 break-keep">{translate('studio.subtitle', gameState.locale)}</p>
            </div>

            <div className="space-y-3">
                <h2 className="text-sm font-bold text-slate-700 break-keep">{translate('studio.genreConcept', gameState.locale)}</h2>
                <div className="grid grid-cols-2 gap-3">
                    {CONCEPTS.map(c => (
                        <button
                            key={c.id}
                            onClick={() => setConcept(c.id)}
                            className={`glass-card p-3 text-left transition-all flex items-center justify-start gap-2 ${concept === c.id ? 'glass-card--selected scale-[1.02]' : 'hover:bg-white/80'}`}
                        >
                            <span className="text-xl flex-shrink-0">{c.icon}</span>
                            <span className={`text-xs font-bold break-keep leading-tight ${concept === c.id ? 'text-[#FF6EB4]' : 'text-slate-600'}`}>{translate(`studio.${c.id}`, gameState.locale)}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <h2 className="text-sm font-bold text-slate-700 break-keep">{translate('studio.targetMarket', gameState.locale)}</h2>
                <div className="flex flex-col gap-2">
                    {MARKETS.map(m => (
                        <button
                            key={m.id}
                            onClick={() => setMarket(m.id)}
                            className={`glass-card p-4 flex justify-between items-center transition-all ${market === m.id ? 'glass-card--selected scale-[1.02]' : 'hover:bg-white/80'}`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl flex-shrink-0">{m.icon}</span>
                                <span className={`text-sm font-bold break-keep ${market === m.id ? 'text-[#FF6EB4]' : 'text-slate-600'}`}>{translate(`studio.${m.id}`, gameState.locale)}</span>
                            </div>
                            <span className="text-xs font-bold text-slate-400 stat-number whitespace-nowrap">
                                {m.cost === 0 ? '' : `+ ${gameState.locale === 'en' ? '₩ ' : ''}${gameState.locale === 'ko' ? (m.cost / 10000).toLocaleString() : m.cost.toLocaleString()}${translate('common.moneyUnit', gameState.locale)}`}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* 하단 버튼 */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 z-40 shadow-[0_-4px_24px_rgba(0,0,0,0.05)]">
                <div className="max-w-sm mx-auto">
                    <Button
                        className="w-full h-14 bg-[#FF6EB4] hover:bg-[#ff4e9f] text-white text-lg font-bold rounded-xl shadow-[0_4px_14px_rgba(255,110,180,0.4)] transition-transform active:scale-95 neo-btn break-keep"
                        onClick={() => handleProduce(false)}
                    >
                        {translate('studio.produceBtn', gameState.locale)} (<span className="stat-number">{gameState.locale === 'en' ? '₩ ' : ''}{gameState.locale === 'ko' ? (totalCost / 10000).toLocaleString() : totalCost.toLocaleString()}</span>{translate('common.moneyUnit', gameState.locale)})
                    </Button>
                </div>
            </div>
        </div>
    )
}

