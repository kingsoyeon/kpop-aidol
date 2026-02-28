import { GameState, GAME_CONSTANTS } from '@/types/game'
import { Button } from '@/components/ui/button'

interface Props {
    gameState: GameState
    updateState: (updates: Partial<GameState>) => void
}

export default function GameOverPhase({ gameState, updateState }: Props) {
    const isBankrupt = gameState.company.money <= 0
    const isDisbanded = gameState.company.reputation <= 0

    let title = '게임 오버'
    let description = '기획사 운영에 실패했습니다.'

    if (isBankrupt) {
        title = '회사 파산'
        description = '자금 고갈로 더 이상 아이돌을 육성할 수 없습니다.'
    } else if (isDisbanded) {
        title = '팬덤 이탈로 해체'
        description = '평판이 바닥에 떨어져 그룹이 해체되었습니다.'
    }

    // 최고 성적 계산
    const rankOrder: Record<string, number> = { '1위': 5, '상위권': 4, '중위권': 3, '하위권': 2, '나락': 1 }
    const bestResult = gameState.history.reduce<string | null>((best, h) => {
        if (!best) return h.result
        return (rankOrder[h.result] ?? 0) > (rankOrder[best] ?? 0) ? h.result : best
    }, null)

    // 총 수익 계산
    const totalEarned = gameState.history.reduce((sum, h) => sum + (h.moneyChange > 0 ? h.moneyChange : 0), 0)

    // PRD §4.7: 다시 시작 — 초기 상태로 완전 리셋
    const handleRestart = () => {
        updateState({
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
            history: [],
            pendingEvent: null,
        })
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-in zoom-in duration-500">
            <div className="bg-black/80 backdrop-blur-md p-8 rounded-2xl w-full text-center border-2 border-[#EF4444] shadow-[0_0_40px_rgba(239,68,68,0.3)]">
                <h1 className="text-5xl font-bold font-['NeoDunggeunmo'] text-[#EF4444] mb-4">💀</h1>
                <h2 className="text-3xl font-bold font-['NeoDunggeunmo'] text-white mb-2">{title}</h2>
                <p className="text-slate-300 mb-8">{description}</p>

                {/* PRD §4.7: 최종 기록 */}
                <div className="bg-white/10 rounded-xl p-4 mb-8 text-left space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">총 컴백 횟수</span>
                        <span className="text-white font-bold stat-number">{gameState.history.length}회</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">최대 팬덤</span>
                        <span className="text-white font-bold stat-number">{gameState.company.fanCount.toLocaleString()}명</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">최고 성적</span>
                        <span className="text-white font-bold">{bestResult ?? '기록 없음'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">총 수익</span>
                        <span className="text-white font-bold stat-number">{(totalEarned / 10_000).toLocaleString()}만원</span>
                    </div>
                </div>

                <Button
                    id="btn-restart"
                    className="w-full h-14 bg-[#FF6EB4] hover:bg-[#ff4e9f] text-white text-lg font-bold rounded-xl shadow-[0_4px_14px_rgba(255,110,180,0.4)]"
                    onClick={handleRestart}
                >
                    다시 시작하기
                </Button>
            </div>
        </div>
    )
}
