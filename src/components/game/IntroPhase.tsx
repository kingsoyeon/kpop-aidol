import { useState } from 'react'
import { GameState } from '@/types/game'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { translate } from '@/lib/i18n'

interface Props {
    gameState: GameState
    updateState: (updates: Partial<GameState>) => void
}

export default function IntroPhase({ gameState, updateState }: Props) {
    const [companyName, setCompanyName] = useState('')

    const handleStart = () => {
        updateState({
            company: {
                ...gameState.company,
                name: companyName.trim() || 'NOVA Entertainment'
            },
            phase: 'casting'
        })
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-sm mx-auto animate-in fade-in zoom-in duration-500">
            <div className="text-center mb-10 w-full drop-shadow-md">
                <h1 className="text-[2.5rem] font-bold font-['NeoDunggeunmo'] text-[#FF6EB4] leading-none mb-2 tracking-tight whitespace-nowrap">
                    {translate('intro.title', gameState.locale)}
                </h1>
                <p className="text-[#4A9FE0] font-bold text-lg break-keep">{translate('intro.subtitle', gameState.locale)}</p>
            </div>

            <Card className="w-full glass-card border-white/50 bg-white/60">
                <CardContent className="p-6 flex flex-col gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#1E293B]">{translate('intro.companyName', gameState.locale)}</label>
                        <Input
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder={translate('intro.companyPlaceholder', gameState.locale)}
                            className="bg-white/80 border-[#4A9FE0]/30 focus-visible:ring-[#FF6EB4] h-12 text-base placeholder:text-slate-400"
                            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                        />
                    </div>

                    <Button
                        onClick={handleStart}
                        className="w-full h-14 bg-[#4A9FE0] hover:bg-[#3b82f6] text-white text-lg font-bold rounded-xl shadow-[0_4px_14px_rgba(74,159,224,0.4)] transition-transform active:scale-95 neo-btn"
                    >
                        {translate('intro.startBtn', gameState.locale)}
                    </Button>
                </CardContent>
            </Card>

            <p className="mt-8 text-xs text-slate-500 font-medium text-center">
                Powered by Gemini 3.1 Pro & Lyria-002
            </p>
        </div>
    )
}
