'use client'
import { useState } from 'react'
import IntroPhase from './IntroPhase'
import CastingPhase from './CastingPhase'
import StudioPhase from './StudioPhase'
import MusicShowPhase from './MusicShowPhase'
import ChartResult from './ChartResult'
import EventCard from './EventCard'
import GameOverPhase from './GameOverPhase'
import { GameState } from '@/types/game'

const initialState: GameState = {
    company: { name: '', money: 10000000, reputation: 50, fanCount: 0 },
    roster: [],
    currentGroup: [],
    currentTrack: null,
    phase: 'intro',
    turn: 1,
    history: [],
    pendingEvent: null,
}

export default function GameScreen() {
    const [gameState, setGameState] = useState<GameState>(initialState)

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

            {/* 상단 HUD */}
            {gameState.phase !== 'intro' && gameState.phase !== 'gameover' && (
                <div className="sticky top-0 w-full bg-white/40 backdrop-blur-[16px] border-b border-white/50 p-4 z-50">
                    <div className="flex justify-between items-center max-w-sm mx-auto text-[0.9375rem]">
                        <span className="stat-number text-slate-800 font-bold">💰 {gameState.company.money.toLocaleString()}원</span>
                        <span className="stat-number text-slate-800 font-bold">⭐ <span className="stat-number">{gameState.company.reputation}</span>점</span>
                        <span className="stat-number text-slate-800 font-bold">👥 {gameState.company.fanCount.toLocaleString()}명</span>
                    </div>
                </div>
            )}

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
