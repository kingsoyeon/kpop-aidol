import { NextRequest, NextResponse } from 'next/server'
import { generateText } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    // [MOCK] 진짜 심사위원 AI(Gemini) 대신 조건부 랜덤 데이터를 생성합니다.
    // 나중에 진짜 API 연동 시 prompt 생성 및 generateText(prompt) 로직을 활성화하세요.
    const resultTypes = ["1위", "상위권", "중위권", "하위권", "나락"];
    const randomResult = resultTypes[Math.floor(Math.random() * resultTypes.length)];

    // 결과에 따른 점수대 설정
    const baseScore = randomResult === "1위" ? 90 : randomResult === "상위권" ? 75 : randomResult === "중위권" ? 60 : randomResult === "하위권" ? 45 : 30;

    const mockData = {
      scores: {
        composition: baseScore + Math.floor(Math.random() * 10),
        vocal: baseScore + Math.floor(Math.random() * 10),
        performance: baseScore + Math.floor(Math.random() * 10),
        popularity: baseScore + Math.floor(Math.random() * 10),
        buzz: baseScore + Math.floor(Math.random() * 10)
      },
      totalScore: baseScore + 5,
      chartProbability: baseScore,
      comment: "전반적으로 훌륭한 퍼포먼스였습니다. 특히 컨셉 소화력이 인상적이네요. 다만 보컬의 디테일은 조금 더 다듬을 필요가 있습니다. (Mock 평가)",
      result: randomResult
    };

    return NextResponse.json(mockData)
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'Unknown API Error' }, { status: 500 })
  }
}
