import { useState } from 'react'
import { Idol } from '@/types/game'
import { CheckCircle2, AlertTriangle, ChevronUp } from 'lucide-react'

import { translate, Locale } from '@/lib/i18n'

interface Props {
    idol: Idol
    isSelected: boolean
    onToggle: () => void
    locale: Locale
}

export default function IdolCard({ idol, isSelected, onToggle, locale }: Props) {
    // 리스크 총합 계산
    const totalRisk = idol.risk.scandal + idol.risk.romance + idol.risk.conflict
    const isHighRisk = totalRisk > 120

    return (
        <div
            className={`polaroid-card cursor-pointer relative overflow-hidden group flex flex-col ${isSelected ? 'ring-2 ring-[#FF6EB4] shadow-[0_4px_24px_rgba(255,110,180,0.25)]' : ''}`}
            onClick={onToggle}
        >
            {/* 선택 뱃지 */}
            {isSelected && (
                <div className="absolute top-2 right-2 z-20 text-[#FF6EB4] bg-white rounded-full">
                    <CheckCircle2 className="w-6 h-6" fill="currentColor" stroke="white" />
                </div>
            )}

            {/* 이미지 영역 */}
            <div className="relative w-full aspect-square flex-shrink-0">
                {idol.imageUrl ? (
                    <img src={idol.imageUrl} alt={idol.name} className="polaroid-card__image rounded-sm" />
                ) : (
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center rounded-sm">
                        <span className="text-slate-400 font-bold">No Image</span>
                    </div>
                )}

                {isHighRisk && (
                    <div className="absolute top-1.5 left-1.5 bg-[#EF4444] text-white text-[0.6rem] font-bold px-1.5 py-0.5 rounded-sm flex items-center gap-1 shadow-sm break-keep">
                        <AlertTriangle className="w-3 h-3" /> {translate('casting.card.riskLabel', locale)}
                    </div>
                )}
            </div>

            {/* 정보 및 스탯 영역 */}
            <div className="p-2 pb-0 flex flex-col flex-1">
                <div className="flex justify-between items-center mb-1.5 border-b border-slate-100 pb-1">
                    <h3 className="polaroid-card__name !mt-0 !text-left">{locale === 'en' && idol.enName ? idol.enName : idol.name}</h3>
                    <span className="text-[0.6rem] text-slate-400 font-bold">{locale === 'en' ? `${idol.age} yrs` : `${idol.age}세`} • {idol.gender === 'male' ? translate('casting.card.male', locale) : translate('casting.card.female', locale)}</span>
                </div>

                {/* 스탯 바 (2x2 그리드) */}
                <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[0.55rem] font-bold text-slate-600 mb-2 bg-slate-50/70 p-1.5 rounded-md border border-slate-100">
                    <div className="flex items-center justify-between">
                        <span className="shrink-0 whitespace-nowrap mr-1 text-[0.52rem] truncate">{translate('casting.card.dance', locale)}</span>
                        <div className="flex-1 h-1 bg-white rounded-full overflow-hidden border border-slate-100/50">
                            <div className="h-full bg-[#FF6EB4]/80 rounded-full" style={{ width: `${idol.stats.dance}%` }} />
                        </div>
                        <span className="stat-number w-[14px] text-right shrink-0 ml-1 leading-none">{idol.stats.dance}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="shrink-0 whitespace-nowrap mr-1 text-[0.52rem] truncate">{translate('casting.card.vocal', locale)}</span>
                        <div className="flex-1 h-1 bg-white rounded-full overflow-hidden border border-slate-100/50">
                            <div className="h-full bg-[#4A9FE0]/80 rounded-full" style={{ width: `${idol.stats.vocal}%` }} />
                        </div>
                        <span className="stat-number w-[14px] text-right shrink-0 ml-1 leading-none">{idol.stats.vocal}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="shrink-0 whitespace-nowrap mr-1 text-[0.52rem] truncate">{translate('casting.card.visual', locale)}</span>
                        <div className="flex-1 h-1 bg-white rounded-full overflow-hidden border border-slate-100/50">
                            <div className="h-full bg-[#C084FC]/80 rounded-full" style={{ width: `${idol.stats.visual}%` }} />
                        </div>
                        <span className="stat-number w-[14px] text-right shrink-0 ml-1 leading-none">{idol.stats.visual}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="shrink-0 whitespace-nowrap mr-1 text-[0.52rem] truncate">{translate('casting.card.potential', locale)}</span>
                        <div className="flex-1 h-1 bg-slate-100 rounded-full relative overflow-hidden border border-slate-100/50">
                            <span className="absolute inset-0 flex items-center justify-center text-[0.35rem] text-slate-300">???</span>
                        </div>
                        <span className="stat-number w-[14px] text-right shrink-0 ml-1 leading-none">?</span>
                    </div>
                </div>

                {/* 리스크 및 코멘트 */}
                <div className="mt-auto space-y-1">
                    <div className="flex flex-col gap-0.5 px-0.5 mb-1">
                        <span className="text-[0.55rem] font-bold text-slate-400 break-keep">
                            {translate('casting.card.scandal', locale)} / {translate('casting.card.romance', locale)} / {translate('casting.card.conflict', locale)}
                        </span>
                        <span className="stat-number text-[#EF4444] font-bold text-[0.6rem] leading-none">
                            {idol.risk.scandal} / {idol.risk.romance} / {idol.risk.conflict}
                        </span>
                    </div>
                    <p className="text-[0.58rem] text-slate-500 font-medium italic border-t border-slate-50 pt-1 px-0.5 leading-[1.2] break-keep">
                        "{locale === 'en' ? idol.enGeminiAnalysis || idol.geminiAnalysis : idol.geminiAnalysis}"
                    </p>
                </div>
            </div>
        </div>
    )
}
