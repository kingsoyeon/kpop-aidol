import { NextRequest, NextResponse } from 'next/server'
export const dynamic = "force-dynamic";
import { generateEventJSON } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    const { members, company, turn } = await req.json()

    // 이벤트의 대상이 될 멤버를 랜덤하게 하나 선정
    const riskyMember = members[Math.floor(Math.random() * members.length)];

    const prompt = `
K-pop 기획사 경영 게임의 위기 이벤트를 생성해줘.

[상황]
위험 멤버: ${riskyMember.name} (구설수 ${riskyMember.risk.scandal}%, 열애설 ${riskyMember.risk.romance}%)
회사 평판: ${company.reputation}/100
현재 팬덤: ${company.fanCount}명
자금: ${company.money}원

아래 JSON 형식으로만 응답해. 다른 텍스트 없이:
{
  "title": "이벤트 제목 (10자 이내)",
  "description": "상황 설명 (2문장, 구체적이고 현실적으로)",
  "memberName": "${riskyMember.name}",
  "choices": [
    {
      "text": "선택지 1 텍스트 (빠른 대응)",
      "effect": { "reputation": -10, "money": 0, "fanCount": -5000 },
      "resultMessage": "선택 결과 한 문장"
    },
    {
      "text": "선택지 2 텍스트 (소극적 대응)",
      "effect": { "reputation": -30, "money": 0, "fanCount": -20000 },
      "resultMessage": "선택 결과 한 문장"
    },
    {
      "text": "선택지 3 텍스트 (비용 들지만 확실한 해결)",
      "effect": { "reputation": -5, "money": -3000000, "fanCount": -1000 },
      "resultMessage": "선택 결과 한 문장"
    }
  ]
}
    `.trim();

    let resultData;
    try {
      const jsonString = await generateEventJSON(prompt);
      // Strip markdown codeblocks
      const cleanJson = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      resultData = JSON.parse(cleanJson);
    } catch (eventErr) {
      console.error('[event] Gemini Generation Failed:', eventErr);
      // Fallback data
      resultData = {
        title: "SNS 운영 미숙",
        description: `${riskyMember.name}이(가) 공식 계정에 개인적인 사진을 잘못 올려 팬들 사이에서 소소한 논란이 발생했습니다. (AI 서버 연결 실패로 인한 기본 이벤트)`,
        memberName: riskyMember.name,
        choices: [
          {
            text: "즉시 삭제 후 가벼운 사과",
            effect: { reputation: -5, money: 0, fanCount: -1000 },
            resultMessage: "빠른 대처로 큰 문제 없이 지나갔습니다."
          },
          {
            text: "무대응으로 일관",
            effect: { reputation: -15, money: 0, fanCount: -3000 },
            resultMessage: "팬들의 불만이 조금 쌓였습니다."
          },
          {
            text: "담당 매니저 교체 건의",
            effect: { reputation: 0, money: -500000, fanCount: 0 },
            resultMessage: "책임을 묻는 과정에서 약간의 비용이 발생했습니다."
          }
        ]
      };
    }

    return NextResponse.json(resultData)
  } catch (err: unknown) {
    console.error("[event] Error:", err);
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'Unknown API Error' }, { status: 500 })
  }
}
