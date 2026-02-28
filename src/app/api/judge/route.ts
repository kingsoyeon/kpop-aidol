import { NextRequest, NextResponse } from 'next/server'
export const dynamic = "force-dynamic";
import { generateJudgeJSON } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    const { track, members, company, turn } = await req.json()

    const avgVocal = members.reduce((sum: number, m: any) => sum + m.stats.vocal, 0) / members.length;
    const avgDance = members.reduce((sum: number, m: any) => sum + m.stats.dance, 0) / members.length;
    const avgVisual = members.reduce((sum: number, m: any) => sum + m.stats.visual, 0) / members.length;
    const avgCharisma = members.reduce((sum: number, m: any) => sum + m.stats.charisma, 0) / members.length;

    const prompt = `
너는 한국 음악 방송의 전문 심사위원이야. 아래 정보를 바탕으로 냉정하게 평가해줘.

[그룹 정보]
보컬 평균: ${Math.round(avgVocal)}/100
댄스 평균: ${Math.round(avgDance)}/100
비주얼 평균: ${Math.round(avgVisual)}/100
카리스마 평균: ${Math.round(avgCharisma)}/100
멤버 수: ${members.length}명

[음원 정보]
컨셉: ${track.concept}
타겟 시장: ${track.targetMarket}
회사 평판: ${company.reputation}/100
현재 팬덤: ${company.fanCount}명

[시장 상황]
현재 컴백 횟수: ${turn}번째

아래 JSON 형식으로만 응답해. 다른 텍스트 없이:
{
  "scores": {
    "composition": 구성력 점수 0-100,
    "vocal": 보컬 완성도 점수 0-100,
    "performance": 퍼포먼스 점수 0-100,
    "popularity": 대중성 점수 0-100,
    "buzz": 화제성 점수 0-100
  },
  "totalScore": 총점 0-100,
  "chartProbability": 1위 확률 0-100,
  "comment": "심사 코멘트 2-3문장. 냉정하고 구체적으로. 칭찬과 비판 모두 포함.",
  "result": "1위" 또는 "상위권" 또는 "중위권" 또는 "하위권" 또는 "나락"
}

result 기준:
- totalScore 85이상: "1위"
- 70-84: "상위권"
- 55-69: "중위권"
- 40-54: "하위권"
- 40미만: "나락"
    `.trim();

    let resultData;
    try {
      const jsonString = await generateJudgeJSON(prompt);
      // Gemini may sometimes return markdown code blocks, let's strip them.
      const cleanJson = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      resultData = JSON.parse(cleanJson);
    } catch (judgeErr) {
      console.error('[judge] Gemini Generation Failed:', judgeErr);
      // Fallback data
      resultData = {
        scores: { composition: 70, vocal: 70, performance: 70, popularity: 70, buzz: 70 },
        totalScore: 70,
        chartProbability: 50,
        comment: "AI 서버 이슈로 인한 기본 평가 결과입니다. 전반적으로 무난한 성적입니다.",
        result: "중위권"
      };
    }

    return NextResponse.json(resultData)
  } catch (err: unknown) {
    console.error("[judge] Error:", err);
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'Unknown API Error' }, { status: 500 })
  }
}
