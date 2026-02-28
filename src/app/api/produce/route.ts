import { NextRequest, NextResponse } from 'next/server'
export const dynamic = "force-dynamic";
import { generateText } from '@/lib/gemini'
import { generateTrack } from '@/lib/lyria'

function extractHook(lyrics: string): string {
    const chorusMatch = lyrics.match(/\[Chorus\]([\s\S]*?)(\[|$)/i)
    return chorusMatch ? chorusMatch[1].trim().split('\n').slice(0, 2).join('\n') : lyrics.split('\n')[0]
}

export async function POST(req: NextRequest) {
    try {
        const { concept, targetMarket, members, groupName } = await req.json()

        // [MOCK] 진짜 Gemini Lyrics API 호출 대신 고정된 가사를 사용합니다.
        // 나중에 진짜 API 연동 시 아래 lyricsText 생성 로직을 활성화하세요.
        const mockLyrics = `[Verse 1]
꿈을 향해 달려가 우린 멈출 수 없어
너와 나 함께라면 어디든 갈 수 있어
반짝이는 저 별처럼 우린 빛날 테니까
지금 이 순간을 영원히 기억해줘

[Chorus]
Yeah we're gonna fly higher (Higher!)
뜨겁게 타오르는 불꽃처럼 (Burning!)
심장이 터질 듯한 이 기분
포기하지 마 다시 한 번 외쳐봐

[Verse 2]
힘들었던 기억들은 모두 잊어버려
새로운 내일이 우릴 기다리니까
두 손을 꼭 잡고서 함께 걸어가자
우리의 노래가 온 세상에 울려 퍼지게

[Bridge]
어둠 속에서도 빛을 잃지 마
우린 할 수 있어 믿음을 가져봐
다시 시작해 우리만의 Stage

[Chorus]
Yeah we're gonna fly higher (Higher!)
뜨겁게 타오르는 불꽃처럼 (Burning!)
심장이 터질 듯한 이 기분
포기하지 마 다시 한 번 외쳐봐`;

        const hook = "Yeah we're gonna fly higher (Higher!)";

        // [MOCK] 진짜 Lyria Audio 생성 대신 샘플 음원을 사용합니다. (lib/lyria.ts가 이미 mock 처리됨)
        const audioUrl = await generateTrack({
            concept,
            targetMarket,
            memberCount: members.length
        })

        return NextResponse.json({
            title: `${groupName} - ${concept.charAt(0).toUpperCase() + concept.slice(1)} Pop`,
            lyrics: {
                full: mockLyrics,
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
