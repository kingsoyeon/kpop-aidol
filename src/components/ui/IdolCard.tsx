import { useState } from 'react'
import { Idol } from '@/types/game'
import { CheckCircle2, AlertTriangle, ChevronUp } from 'lucide-react'

interface Props {
    idol: Idol
    isSelected: boolean
    onToggle: () => void
}

export default function IdolCard({ idol, isSelected, onToggle }: Props) {
    const [showStats, setShowStats] = useState(false)

    // 리스크 총합 계산
    const totalRisk = idol.risk.scandal + idol.risk.romance + idol.risk.conflict
    const isHighRisk = totalRisk > 120

    return (
        <div
            className={`polaroid-card cursor-pointer relative overflow-hidden group ${isSelected ? 'ring-2 ring-[#FF6EB4] shadow-[0_4px_24px_rgba(255,110,180,0.25)]' : ''}`}
            onClick={onToggle}
        >
            {/* 선택 뱃지 */}
            {isSelected && (
                <div className="absolute top-2 right-2 z-20 text-[#FF6EB4] bg-white rounded-full">
                    <CheckCircle2 className="w-6 h-6" fill="currentColor" stroke="white" />
                </div>
            )}

            {/* 이미지 75% */}
            <div className="relative w-full aspect-square" onClick={(e) => {
                // Toggle only selection on image click
            }}>
                {idol.imageUrl ? (
                    <img src={idol.imageUrl} alt={idol.name} className="w-full h-full object-cover rounded-sm" />
                ) : (
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center rounded-sm">
                        <span className="text-slate-400 font-bold">No Image</span>
                    </div>
                )}

                {isHighRisk && (
                    <div className="absolute top-2 left-2 bg-[#EF4444] text-white text-[0.65rem] font-bold px-2 py-1 rounded-sm flex items-center gap-1 shadow-sm">
                        <AlertTriangle className="w-3 h-3" /> RISK
                    </div>
                )}

                {/* 스탯 열기 버튼 (우하단) */}
                {!showStats && (
                    <button
                        className="absolute bottom-2 right-2 bg-black/50 text-white p-1.5 rounded-full backdrop-blur-sm z-20 hover:bg-black/70 transition"
                        onClick={(e) => { e.stopPropagation(); setShowStats(true); }}
                    >
                        <ChevronUp className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* 정보 25% */}
            <div className="mt-3 text-center">
                <h3 className="polaroid-card__name text-slate-800 text-lg">{idol.name}</h3>
                <p className="text-xs text-slate-500 font-medium">{idol.age}세 • {idol.gender === 'male' ? '남' : '여'}</p>

                {/* 한줄 코멘트 */}
                <p className="mt-1 text-[0.7rem] text-slate-600 truncate px-1">
                    {idol.geminiAnalysis}
                </p>
            </div>

            {/* 스탯 슬라이드업 드로어 */}
            <div
                className={`absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-md p-3 transition-transform duration-300 ease-in-out border-t border-slate-100 z-30 ${showStats ? 'translate-y-0' : 'translate-y-full'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-xs text-slate-800">상세 스탯</span>
                    <button onClick={() => setShowStats(false)} className="text-slate-400 p-1 hover:text-slate-700">
                        <ChevronUp className="w-4 h-4 rotate-180" />
                    </button>
                </div>

                <div className="space-y-1.5 text-[0.7rem] font-medium text-slate-600">
                    <div className="flex justify-between items-center">
                        <span>보컬</span>
                        <div className="flex-1 mx-2 h-1.5 bg-slate-100 rounded-full">
                            <div className="h-full bg-[#4A9FE0] rounded-full" style={{ width: `${idol.stats.vocal}%` }} />
                        </div>
                        <span className="stat-number min-w-[20px] text-right">{idol.stats.vocal}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>댄스</span>
                        <div className="flex-1 mx-2 h-1.5 bg-slate-100 rounded-full">
                            <div className="h-full bg-[#4A9FE0] rounded-full" style={{ width: `${idol.stats.dance}%` }} />
                        </div>
                        <span className="stat-number min-w-[20px] text-right">{idol.stats.dance}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>비주얼</span>
                        <div className="flex-1 mx-2 h-1.5 bg-slate-100 rounded-full">
                            <div className="h-full bg-[#4A9FE0] rounded-full" style={{ width: `${idol.stats.visual}%` }} />
                        </div>
                        <span className="stat-number min-w-[20px] text-right">{idol.stats.visual}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2 border-t pt-1">
                        <span>리스크 (구/열/분)</span>
                        <span className="stat-number text-[#EF4444] font-bold">
                            {idol.risk.scandal} / {idol.risk.romance} / {idol.risk.conflict}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
