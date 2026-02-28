import { NextRequest, NextResponse } from 'next/server'
export const dynamic = "force-dynamic";
export const maxDuration = 60; // Vercel Hobby 플랜 최대값
import { generateText } from '@/lib/gemini'
import { generateTrack } from '@/lib/lyria'

function extractHook(lyrics: string): string {
    const chorusMatch = lyrics.match(/\[Chorus\]([\s\S]*?)(\[|$)/i)
    return chorusMatch ? chorusMatch[1].trim().split('\n').slice(0, 2).join('\n') : lyrics.split('\n')[0]
}

export async function POST(req: NextRequest) {
    try {
        const { concept, targetMarket, members, groupName } = await req.json()

        let fullLyrics = '';
        let hook = '';

        if (process.env.NEXT_PUBLIC_FORCE_MOCK === 'true') {
            fullLyrics = `[Verse 1]\n꿈을 향해 달려가 우린 멈출 수 없어\n...\n[Chorus]\nYeah we're gonna fly higher (Higher!)\n...`;
            hook = "Yeah we're gonna fly higher (Higher!)";
        } else {
            const prompt = `
K-pop 그룹 ${groupName}의 신곡 가사를 한국어로 작성해줘.

컨셉: ${concept}
타겟: ${targetMarket}
멤버 수: ${members.length}명

요구사항:
- [Verse 1], [Chorus], [Verse 2], [Bridge], [Chorus] 구조 필수
- 후크(Chorus)는 반복하기 쉽고 기억에 남는 라인
- 각 섹션은 4-6줄
- 자연스러운 한국어, 영어 단어 약간 믹스 가능
- 백킹보컬 에코는 괄호로 표시: "Let's go (go)"

가사만 출력, 설명 없이.
            `.trim();

            try {
                fullLyrics = await generateText(prompt);
                hook = extractHook(fullLyrics);
            } catch (textErr) {
                console.error('[produce] Lyrics Generation Failed:', textErr);
                fullLyrics = `[Verse 1]\nAI 서버 이슈로 기본 가사 제공\n...\n[Chorus]\nFallback Hook!\n...`;
                hook = "Fallback Hook!";
            }
        }

        let audioUrl = '';
        let isFallback = false;

        try {
            audioUrl = await generateTrack({
                concept,
                targetMarket,
                memberCount: members.length
            });
        } catch (audioErr) {
            console.error('[produce] Lyria Generation Failed:', audioErr);
            isFallback = true;
            audioUrl = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='; // Silent fallback
        }

        const baseTitle = `${groupName} - ${concept.charAt(0).toUpperCase() + concept.slice(1)} Pop`;
        const finalTitle = isFallback ? `${baseTitle} (Silent Fallback)` : baseTitle;

        return NextResponse.json({
            title: finalTitle,
            lyrics: {
                full: fullLyrics,
                hook: hook
            },
            audioUrl
        })
    } catch (err: unknown) {
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 })
        }
        return NextResponse.json({ error: 'Unknown API Error' }, { status: 500 })
    }
}
