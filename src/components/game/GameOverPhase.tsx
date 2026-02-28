import { GameState } from '@/types/game'
import { Button } from '@/components/ui/button'

interface Props {
    gameState: GameState
    updateState: (updates: Partial<GameState>) => void
}

export default function GameOverPhase({ gameState, updateState }: Props) {
    const isBankrupt = gameState.company.money <= 0
    const isDisbanded = gameState.company.reputation <= 0

    let title = "게임 오버"
    let description = "기획사 운영에 실패했습니다."

    if (isBankrupt) {
        title = "회사 파산"
        description = "자금 고갈로 더 이상 아이돌을 육성할 수 없습니다."
    } else if (isDisbanded) {
        title = "팬덤 이탈로 해체"
        description = "평판이 바닥에 떨어져 그룹이 해체되었습니다."
    }

    const handleRestart = () => {
        updateState({
            company: { name: '', money: 10000000, reputation: 50, fanCount: 0 },
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

                <div className="bg-white/10 rounded-xl p-4 mb-8 text-left space-y-2">
                    <p className="text-slate-400 text-sm">최종 컴백 횟수 <span className="float-right text-white font-bold stat-number">{gameState.turn}회</span></p>
                    <p className="text-slate-400 text-sm">최대 팬덤 <span className="float-right text-white font-bold stat-number">{Math.max(...gameState.history.map((_, i) => gameState.company.fanCount), gameState.company.fanCount).toLocaleString()}명</span></p>
                </div>

                <Button
                    className="w-full h-14 bg-[#FF6EB4] hover:bg-[#ff4e9f] text-white text-lg font-bold rounded-xl shadow-[0_4px_14px_rgba(255,110,180,0.4)]"
                    onClick={handleRestart}
                >
                    다시 시작하기
                </Button>
            </div>
        </div>
    )
}
