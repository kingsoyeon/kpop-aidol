import { NextRequest, NextResponse } from 'next/server'
import { generateText } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    const { members } = await req.json()
    const riskyMember = members[0]; // 단순화된 로직

    // [MOCK] 진짜 Gemini 이벤트 생성 대신 고정된 시나리오 중 하나를 반환합니다.
    // 나중에 진짜 API 연동 시 prompt 생성 및 generateText(prompt) 로직을 활성화하세요.
    const mockEvents = [
      {
        title: "SNS 말실수",
        description: `${riskyMember.name}이(가) 어젯밤 SNS 라이브 중 부적절한 단어를 사용하여 팬들 사이에서 논란이 되고 있습니다.`,
        memberName: riskyMember.name,
        choices: [
          { text: "즉각 사과문 발표", effect: { reputation: -5, money: 0, fanCount: -2000 }, resultMessage: "빠른 대처로 논란이 소폭 가라앉았습니다. (Mock)" },
          { text: "무대응으로 일관", effect: { reputation: -20, money: 0, fanCount: -10000 }, resultMessage: "팬들의 실망감이 커져 평판이 크게 하락했습니다. (Mock)" },
          { text: "자필 편지 개시", effect: { reputation: 2, money: -500000, fanCount: 1000 }, resultMessage: "진정성 있는 모습에 일부 팬들이 마음을 돌렸습니다. (Mock)" }
        ]
      },
      {
        title: "열애설 포착",
        description: `${riskyMember.name}이(가) 다른 타사 아이돌과 카페에서 함께 있는 사진이 커뮤니티에 퍼졌습니다.`,
        memberName: riskyMember.name,
        choices: [
          { text: "친한 동료 사이라고 선을 긋는다", effect: { reputation: -10, money: 0, fanCount: -5000 }, resultMessage: "믿는 팬들도 있지만 의심하는 여론이 남았습니다. (Mock)" },
          { text: "쿨하게 인정한다", effect: { reputation: -5, money: 0, fanCount: -15000 }, resultMessage: "일부 코어 팬덤이 이탈했지만 대중의 지지를 얻었습니다. (Mock)" },
          { text: "증거 수집 및 고소 공지", effect: { reputation: -15, money: -2000000, fanCount: -2000 }, resultMessage: "강경 대응에 팬들이 당황했지만 논란 확산은 막았습니다. (Mock)" }
        ]
      }
    ];

    const randomEvent = mockEvents[Math.floor(Math.random() * mockEvents.length)];
    return NextResponse.json(randomEvent)
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'Unknown API Error' }, { status: 500 })
  }
}
