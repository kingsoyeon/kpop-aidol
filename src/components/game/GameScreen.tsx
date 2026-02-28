'use client'
import { useState } from 'react'
import IntroPhase from './IntroPhase'
import CastingPhase from './CastingPhase'
import StudioPhase from './StudioPhase'
import MusicShowPhase from './MusicShowPhase'
import ChartResult from './ChartResult'
import EventCard from './EventCard'
import GameOverPhase from './GameOverPhase'
import { GameState, GAME_CONSTANTS } from '@/types/game'

const initialState: GameState = {
    company: {
        name: '',
        money: GAME_CONSTANTS.INITIAL_MONEY,
        reputation: GAME_CONSTANTS.INITIAL_REPUTATION,
        fanCount: GAME_CONSTANTS.INITIAL_FAN_COUNT,
    },
    roster: [],
    currentGroup: [],
    currentTrack: null,
    phase: 'intro',
    turn: 1,
    locale: 'ko',
    history: [],
    pendingEvent: null,
}

export default function GameScreen() {
    const [gameState, setGameState] = useState<GameState>(initialState)

    // 단방향 상태 업데이트 — 자식 컴포넌트는 이 함수만 사용
    const updateState = (updates: Partial<GameState>) =>
        setGameState(prev => ({ ...prev, ...updates }))

    return (
        <div className="min-h-screen bg-transparent text-slate-900 pb-24 relative overflow-hidden">
            {/* Y2K 데코 오브젝트 레이어 */}
            <div className="deco-item" style={{ top: '8%', left: '5%', fontSize: '1.4rem', opacity: 0.6, '--r': '15deg', '--delay': '0s' } as React.CSSProperties}>⭐</div>
            <div className="deco-item" style={{ top: '15%', right: '8%', fontSize: '1.2rem', opacity: 0.5, '--r': '-10deg', '--delay': '1s' } as React.CSSProperties}>💙</div>
            <div className="deco-item" style={{ top: '35%', left: '3%', fontSize: '1rem', opacity: 0.7, '--r': '0deg', '--delay': '2s' } as React.CSSProperties}>✨</div>
            <div className="deco-item" style={{ top: '60%', right: '5%', fontSize: '1.6rem', opacity: 0.4, '--r': '5deg', '--delay': '0.5s' } as React.CSSProperties}>💗</div>
            <div className="deco-item" style={{ top: '80%', left: '7%', fontSize: '1.1rem', opacity: 0.5, '--r': '-5deg', '--delay': '1.5s' } as React.CSSProperties}>💖</div>
            <div className="deco-item" style={{ top: '90%', right: '10%', fontSize: '1.3rem', opacity: 0.6, '--r': '20deg', '--delay': '2.5s' } as React.CSSProperties}>🌟</div>

            {/* 상단 HUD — intro/gameover 페이즈에서는 로케일 토글만 표시 */}
            <div className={`sticky top-0 w-full px-3 py-2 z-50 flex items-center gap-2 ${gameState.phase === 'intro' || gameState.phase === 'gameover' ? 'justify-end' : 'justify-between bg-white/40 backdrop-blur-[16px] border-b border-white/50'}`}>
                {gameState.phase !== 'intro' && gameState.phase !== 'gameover' && (
                    <div className="flex items-center gap-2 mr-auto min-w-0 overflow-hidden">
                        <span className="stat-number text-slate-800 font-bold text-[0.78rem] whitespace-nowrap">💰 {gameState.locale === 'en' ? '₩' : ''}{gameState.locale === 'ko' ? Math.floor(gameState.company.money / 10000).toLocaleString() + '만' : gameState.company.money.toLocaleString()}</span>
                        <span className="stat-number text-slate-800 font-bold text-[0.78rem] whitespace-nowrap">⭐ {gameState.company.reputation}{gameState.locale === 'ko' ? '점' : ''}</span>
                        <span className="stat-number text-slate-800 font-bold text-[0.78rem] whitespace-nowrap">👥 {gameState.company.fanCount.toLocaleString()}{gameState.locale === 'ko' ? '명' : ''}</span>
                    </div>
                )}

                {/* 언어 토글 + 리셋 버튼 그룹 */}
                <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto">
                    {gameState.phase !== 'intro' && gameState.phase !== 'gameover' && (
                        <button
                            onClick={() => updateState({
                                company: { name: '', money: GAME_CONSTANTS.INITIAL_MONEY, reputation: GAME_CONSTANTS.INITIAL_REPUTATION, fanCount: GAME_CONSTANTS.INITIAL_FAN_COUNT },
                                roster: [], currentGroup: [], currentTrack: null,
                                phase: 'intro', turn: 1, history: [], pendingEvent: null,
                                locale: gameState.locale,
                            })}
                            className="bg-white/60 border border-slate-200 text-slate-500 px-2.5 py-1 rounded-full text-[0.7rem] font-bold shadow-sm hover:bg-white transition-colors"
                        >
                            🔄
                        </button>
                    )}
                    <button
                        onClick={() => updateState({ locale: gameState.locale === 'ko' ? 'en' : 'ko' })}
                        className="bg-white/60 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-full text-[0.7rem] font-bold shadow-sm hover:bg-white transition-colors"
                    >
                        {gameState.locale === 'ko' ? 'KO' : 'EN'}
                    </button>
                </div>
            </div>

            {/* 게임 페이즈 렌더링 */}
            <div className="pt-6 max-w-sm mx-auto px-4 relative z-10 w-full">
                {gameState.phase === 'intro' && (
                    <IntroPhase gameState={gameState} updateState={updateState} />
                )}
                {gameState.phase === 'casting' && (
                    <CastingPhase gameState={gameState} updateState={updateState} />
                )}
                {gameState.phase === 'studio' && (
                    <StudioPhase gameState={gameState} updateState={updateState} />
                )}
                {gameState.phase === 'musicshow' && (
                    <MusicShowPhase gameState={gameState} updateState={updateState} />
                )}
                {gameState.phase === 'result' && (
                    <ChartResult gameState={gameState} updateState={updateState} />
                )}
                {gameState.phase === 'event' && (
                    <EventCard gameState={gameState} updateState={updateState} />
                )}
                {gameState.phase === 'gameover' && (
                    <GameOverPhase gameState={gameState} updateState={updateState} />
                )}
            </div>
        </div>
    )
}
