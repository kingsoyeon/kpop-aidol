import { NextRequest, NextResponse } from 'next/server'
export const dynamic = "force-dynamic";
export const maxDuration = 60;
import { generateIdolImage } from '@/lib/imagen'
import { analyzeCandidate } from '@/lib/gemini'
import { generateUUID } from '@/lib/utils/uuid'

function generateKoreanName(gender: 'male' | 'female'): string {
    const lastNames = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임']
    const mFirstNames = ['민준', '서준', '도윤', '예준', '시우', '하준', '주원', '지호', '지훈', '준우', '건우', '우진']
    const fFirstNames = ['서연', '서윤', '지우', '서현', '하은', '하윤', '민서', '지유', '윤서', '지민', '채원', '수아']

    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const firstNameList = gender === 'male' ? mFirstNames : fFirstNames
    const firstName = firstNameList[Math.floor(Math.random() * firstNameList.length)]
    return lastName + firstName
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const count = body.count || 4

        const candidates = await Promise.all(
            Array.from({ length: count }, async () => {
                const gender = Math.random() > 0.5 ? 'female' : 'male'
                const age = Math.floor(Math.random() * 8) + 16 // 16-23세

                let imageUrl = '';
                try {
                    imageUrl = await generateIdolImage({ gender, age });
                } catch (e) {
                    console.error('[Casting] Image generation failed:', e);
                    imageUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${gender}-${age}-${Math.random()}`; // Fallback to mock image
                }

                const stats = {
                    dance: Math.floor(Math.random() * 40) + 60,
                    vocal: Math.floor(Math.random() * 40) + 60,
                    visual: Math.floor(Math.random() * 40) + 60,
                    potential: Math.floor(Math.random() * 100),
                    charisma: Math.floor(Math.random() * 40) + 60,
                }

                const risk = {
                    scandal: Math.floor(Math.random() * 60),
                    romance: Math.floor(Math.random() * 50),
                    conflict: Math.floor(Math.random() * 40),
                }

                let analysis = '';
                try {
                    analysis = await analyzeCandidate({ gender, age, stats, risk });
                } catch (e) {
                    console.error('[Casting] Candidate analysis failed:', e);
                    analysis = '기획사 평가 준비 중입니다.'; // Fallback
                }

                return {
                    id: generateUUID(),
                    name: generateKoreanName(gender),
                    age,
                    gender,
                    imageUrl,
                    stats,
                    risk,
                    geminiAnalysis: analysis,
                    isActive: true
                }
            })
        )

        return NextResponse.json({ candidates })
    } catch (err: unknown) {
        console.error('[Casting] Critical Error:', err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 })
        }
        return NextResponse.json({ error: 'Unknown Error' }, { status: 500 })
    }
}
