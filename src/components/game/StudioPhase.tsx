import { useState, useEffect, useMemo, useCallback } from 'react'
import { GameState, ConceptType, MarketType, Track } from '@/types/game'
import { Button } from '@/components/ui/button'
import AudioPlayer from '@/components/ui/AudioPlayer'
import { Disc, Mic2, RefreshCw, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import { translate } from '@/lib/i18n'
import { generateUUID } from '@/lib/utils/uuid'

interface Props {
    gameState: GameState
    updateState: (updates: Partial<GameState>) => void
}

const CONCEPTS: { id: ConceptType; icon: string }[] = [
    { id: 'summer', icon: '☀️' },
    { id: 'intense', icon: '🔥' },
    { id: 'ballad', icon: '🌙' },
    { id: 'hiphop', icon: '🎤' },
]

const MARKETS: { id: MarketType; cost: number; icon: string }[] = [
    { id: 'domestic', cost: 0, icon: '🇰🇷' },
    { id: 'japan', cost: 1000000, icon: '🇯🇵' },
    { id: 'global', cost: 2000000, icon: '🌍' },
]

// AI Staff 부서 config
const STAFF_DEPTS = [
    { id: 'ar' as const, emoji: '🎵', color: '#4A9FE0', alertCount: 2 },
    { id: 'marketing' as const, emoji: '📣', color: '#FF6EB4', alertCount: 1 },
    { id: 'finance' as const, emoji: '💰', color: '#10B981', alertCount: 0 },
]

type StaffId = 'ar' | 'marketing' | 'finance'

export default function StudioPhase({ gameState, updateState }: Props) {
    const [concept, setConcept] = useState<ConceptType>('summer')
    const [market, setMarket] = useState<MarketType>('domestic')
    const [isProducing, setIsProducing] = useState(false)
    const [loadingElapsed, setLoadingElapsed] = useState(0)
    const [producedTrack, setProducedTrack] = useState<Track | null>(null)
    const [expandedStaff, setExpandedStaff] = useState<StaffId | null>(null)

    // 멤버 라이브캠 슬라이드쇼 인덱스
    const [slideshowIdx, setSlideshowIdx] = useState(0)

    const t = useCallback((key: string) => translate(key, gameState.locale), [gameState.locale])

    const waveBars = useMemo(() =>
        Array.from({ length: 20 }, () => ({
            height: Math.floor(Math.random() * 100),
            duration: 0.5 + Math.random(),
        }))
        , [])

    // 4단계 로딩 타이머
    useEffect(() => {
        let timer: NodeJS.Timeout
        if (isProducing) {
            timer = setInterval(() => setLoadingElapsed(p => p + 1), 1000)
        } else {
            setLoadingElapsed(0)
        }
        return () => clearInterval(timer)
    }, [isProducing])

    // 멤버 라이브캠 슬라이드쇼 자동 전환 (2초)
    useEffect(() => {
        if (!isProducing) return
        const members = gameState.currentGroup
        if (members.length === 0) return
        const t = setInterval(() => {
            setSlideshowIdx(prev => (prev + 1) % members.length)
        }, 2000)
        return () => clearInterval(t)
    }, [isProducing, gameState.currentGroup])

    const handleProduce = async (isRetry = false) => {
        const marketCost = MARKETS.find(m => m.id === market)?.cost || 0
        const cost = isRetry ? 2500000 : 5000000 + marketCost

        if (gameState.company.money < cost) {
            alert(gameState.locale === 'ko' ? '자금이 부족합니다.' : 'Insufficient funds.')
            return
        }

        updateState({ company: { ...gameState.company, money: gameState.company.money - cost } })
        setIsProducing(true)
        setProducedTrack(null)
        setSlideshowIdx(0)
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
                id: generateUUID(),
                title: data.title,
                concept,
                targetMarket: market,
                lyrics: data.lyrics,
                audioUrl: data.audioUrl,
                members: gameState.currentGroup,
                producedAt: cost / 10000,
            })

            const remainingTime = Math.max(0, 8000 - (Date.now() - startTime))
            if (remainingTime > 0) await new Promise(r => setTimeout(r, remainingTime))
        } catch (err) {
            console.error(err)
            alert(gameState.locale === 'ko' ? '음원 생성 중 오류가 발생했습니다.' : 'Error generating track.')
        } finally {
            setIsProducing(false)
        }
    }

    const handleRelease = () => {
        if (!producedTrack) return
        updateState({ currentTrack: producedTrack, phase: 'musicshow' })
    }

    const getLoadingStage = () => {
        if (loadingElapsed < 2) return t('studio.producingLyrics')
        if (loadingElapsed < 4) return t('studio.producingSound')
        if (loadingElapsed < 6) return t('studio.producingAI')
        return t('studio.producingFinal')
    }

    // ── 로딩 화면 ──────────────────────────────────────
    if (isProducing) {
        const members = gameState.currentGroup
        const currentMember = members[slideshowIdx]

        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-500 gap-4">
                {/* 4단계 프로덕션 카드 */}
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-[0_8px_32px_rgba(74,159,224,0.15)] flex flex-col items-center w-full max-w-[320px] text-center border border-white/60">
                    <Disc className="w-14 h-14 text-[#FF6EB4] animate-spin mb-4" style={{ animationDuration: '3s' }} />
                    <h2 className="text-base font-bold text-slate-800 mb-4 break-keep">{getLoadingStage()}</h2>
                    <div className="flex gap-[3px] items-end h-7 justify-center w-full">
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

                {/* 멤버 라이브캠 슬라이드쇼 */}
                {members.length > 0 && currentMember && (
                    <div className="w-full max-w-[320px] bg-black/80 rounded-xl overflow-hidden border border-white/10 shadow-lg">
                        {/* LIVECAM 배지 */}
                        <div className="flex items-center justify-between px-3 py-1.5 bg-black/60">
                            <span className="flex items-center gap-1.5 text-[0.6rem] font-bold text-red-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                                {t('studio.staff.livecam')}
                            </span>
                            <span className="text-[0.6rem] text-white/50 font-bold">
                                {slideshowIdx + 1} / {members.length}
                            </span>
                        </div>

                        {/* 슬라이드쇼 이미지 */}
                        <div className="relative w-full aspect-square animate-in fade-in duration-500" key={slideshowIdx}>
                            <img
                                src={currentMember.imageUrl}
                                alt={currentMember.name}
                                className="w-full h-full object-cover"
                            />
                            {/* 멤버 이름 오버레이 */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                                <p className="text-white font-bold text-sm">{currentMember.name}</p>
                                <p className="text-white/60 text-[0.65rem]">{t('studio.staff.livecam')}</p>
                            </div>
                        </div>

                        {/* 멤버 도트 인디케이터 */}
                        <div className="flex justify-center gap-1.5 py-2 bg-black/60">
                            {members.map((_, i) => (
                                <span
                                    key={i}
                                    className={`w-1.5 h-1.5 rounded-full transition-colors ${i === slideshowIdx ? 'bg-[#FF6EB4]' : 'bg-white/30'}`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // ── 결과 화면 ──────────────────────────────────────
    if (producedTrack) {
        return (
            <div className="flex flex-col gap-5 animate-in slide-in-from-bottom-8 duration-500 pb-24">
                <div className="text-center mt-4">
                    <h1 className="text-2xl font-bold font-display text-[#4A9FE0] break-keep">{t('studio.resultTitle')}</h1>
                </div>

                <div className="glass-card p-5 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#4A9FE0] to-[#FF6EB4] rounded-full flex items-center justify-center shadow-lg mb-3 text-3xl">
                        {CONCEPTS.find(c => c.id === concept)?.icon}
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-1">{producedTrack.title}</h2>
                    <p className="text-sm text-[#FF6EB4] font-bold mb-4 break-keep">
                        [{t(`studio.${concept}`)} / {t(`studio.${market}`)}]
                    </p>
                    <AudioPlayer src={producedTrack.audioUrl} />
                    <div className="mt-5 w-full text-left bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                        <h3 className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1 break-keep">
                            <Mic2 className="w-3 h-3 flex-shrink-0" /> {t('studio.staff.lyrics')}
                        </h3>
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
                            <RefreshCw className="w-4 h-4 mr-1.5 flex-shrink-0" />
                            {t('studio.produceBtn')} (<span className="stat-number">-250</span>{t('common.moneyUnit')})
                        </Button>
                        <Button
                            className="flex-1 h-14 bg-[#4A9FE0] hover:bg-[#3b82f6] text-white font-bold rounded-xl shadow-[0_4px_14px_rgba(74,159,224,0.4)] neo-btn break-keep px-2"
                            onClick={handleRelease}
                        >
                            {t('studio.nextStageBtn')}
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    // ── 기본 설정 화면 ─────────────────────────────────
    const targetCost = MARKETS.find(m => m.id === market)?.cost || 0
    const totalCost = 5000000 + targetCost

    return (
        <div className="flex flex-col w-full h-full pb-24 animate-in fade-in duration-500 gap-5">
            <div className="mt-4">
                <h1 className="text-2xl font-bold font-display text-[#4A9FE0] break-keep">{t('studio.title')}</h1>
                <p className="text-xs text-slate-500 mt-1 break-keep">{t('studio.subtitle')}</p>
            </div>

            {/* ── AI Staff 브리핑 카드 (Phoning 메시지 스타일) ── */}
            <div className="space-y-2">
                {/* 헤더 */}
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-700 flex items-center gap-1.5 break-keep">
                        <Sparkles className="w-4 h-4 text-[#FF6EB4]" />
                        {t('studio.staff.title')}
                    </h2>
                    <div className="flex items-center gap-2">
                        <span className="text-[0.6rem] text-slate-400 font-bold">{t('studio.staff.analysisEngine')}</span>
                        <span className="text-[0.6rem] bg-[#4A9FE0]/10 text-[#4A9FE0] px-1.5 py-0.5 rounded-full font-bold">{t('studio.staff.analysisTime')}</span>
                    </div>
                </div>

                {/* 부서 카드 리스트 */}
                {STAFF_DEPTS.map(dept => {
                    const isExpanded = expandedStaff === dept.id
                    const nameKey = `studio.staff.${dept.id}` as const
                    const previewKey = `studio.staff.${dept.id}Preview` as const
                    const detailKey = `studio.staff.${dept.id}Detail` as const

                    return (
                        <div
                            key={dept.id}
                            className="glass-card overflow-hidden cursor-pointer transition-all"
                            onClick={() => setExpandedStaff(isExpanded ? null : dept.id)}
                        >
                            {/* 카드 행 (Phoning 메시지 스타일) */}
                            <div className="flex items-center gap-3 p-3.5 active:bg-[#4A9FE0]/5">
                                {/* 아바타 원형 + 온라인 도트 */}
                                <div className="relative flex-shrink-0">
                                    <div
                                        className="w-11 h-11 rounded-full flex items-center justify-center text-xl border-2 border-white shadow-sm"
                                        style={{ backgroundColor: `${dept.color}22` }}
                                    >
                                        {dept.emoji}
                                    </div>
                                    {/* 온라인 도트 */}
                                    <span
                                        className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
                                        style={{ backgroundColor: 'var(--badge-online)' }}
                                    />
                                </div>

                                {/* 부서명 + 미리보기 */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-slate-800 break-keep">{t(nameKey)}</span>
                                        <span className="text-[0.65rem] text-slate-400 font-bold ml-2 whitespace-nowrap">방금 전</span>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate mt-0.5 break-keep">{t(previewKey)}</p>
                                </div>

                                {/* 우상단: 미읽 배지 + 확장 아이콘 */}
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                    {dept.alertCount > 0 && (
                                        <span
                                            className="min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[0.6rem] font-bold text-white"
                                            style={{ backgroundColor: 'var(--badge-unread)', animation: 'badgePop 0.3s ease' }}
                                        >
                                            {dept.alertCount}
                                        </span>
                                    )}
                                    {isExpanded
                                        ? <ChevronUp className="w-4 h-4 text-slate-400" />
                                        : <ChevronDown className="w-4 h-4 text-slate-400" />
                                    }
                                </div>
                            </div>

                            {/* 인라인 확장 — 전체 브리핑 */}
                            {isExpanded && (
                                <div className="px-4 pb-4 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
                                    <p className="text-sm text-slate-700 leading-relaxed mt-3 break-keep italic">
                                        "{t(detailKey)}"
                                    </p>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* ── 장르/컨셉 선택 ── */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-700 break-keep">{t('studio.genreConcept')}</h2>
                    {/* AI 추천 배지 */}
                    <span
                        className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full text-slate-800"
                        style={{ backgroundColor: 'var(--badge-rec)' }}
                    >
                        {t('studio.staff.recBadge')} {t('studio.staff.recConcept')}
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {CONCEPTS.map(c => (
                        <button
                            key={c.id}
                            onClick={() => setConcept(c.id)}
                            className={`glass-card p-3 text-left transition-all flex items-center justify-start gap-2 ${concept === c.id ? 'glass-card--selected scale-[1.02]' : 'hover:bg-white/80'}`}
                        >
                            <span className="text-xl flex-shrink-0">{c.icon}</span>
                            <span className={`text-xs font-bold break-keep leading-tight ${concept === c.id ? 'text-[#FF6EB4]' : 'text-slate-600'}`}>
                                {t(`studio.${c.id}`)}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── 타겟 시장 선택 ── */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-700 break-keep">{t('studio.targetMarket')}</h2>
                    <span
                        className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full text-slate-800"
                        style={{ backgroundColor: 'var(--badge-rec)' }}
                    >
                        {t('studio.staff.recBadge')} {t('studio.staff.recMarket')}
                    </span>
                </div>
                <div className="flex flex-col gap-2">
                    {MARKETS.map(m => (
                        <button
                            key={m.id}
                            onClick={() => setMarket(m.id)}
                            className={`glass-card p-3.5 flex justify-between items-center transition-all ${market === m.id ? 'glass-card--selected scale-[1.02]' : 'hover:bg-white/80'}`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl flex-shrink-0">{m.icon}</span>
                                <span className={`text-sm font-bold break-keep ${market === m.id ? 'text-[#FF6EB4]' : 'text-slate-600'}`}>
                                    {t(`studio.${m.id}`)}
                                </span>
                            </div>
                            <span className="text-xs font-bold text-slate-400 stat-number whitespace-nowrap">
                                {m.cost === 0 ? '' : `+ ${gameState.locale === 'en' ? '₩ ' : ''}${gameState.locale === 'ko' ? (m.cost / 10000).toLocaleString() : m.cost.toLocaleString()}${t('common.moneyUnit')}`}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── 하단 제작 버튼 ── */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 z-40 shadow-[0_-4px_24px_rgba(0,0,0,0.05)]">
                <div className="max-w-sm mx-auto">
                    <Button
                        className="w-full h-14 bg-[#FF6EB4] hover:bg-[#ff4e9f] text-white text-lg font-bold rounded-xl shadow-[0_4px_14px_rgba(255,110,180,0.4)] transition-transform active:scale-95 neo-btn break-keep"
                        onClick={() => handleProduce(false)}
                    >
                        {t('studio.produceBtn')} (<span className="stat-number">
                            {gameState.locale === 'en' ? '₩ ' : ''}
                            {gameState.locale === 'ko' ? (totalCost / 10000).toLocaleString() : totalCost.toLocaleString()}
                        </span>{t('common.moneyUnit')})
                    </Button>
                </div>
            </div>
        </div>
    )
}
