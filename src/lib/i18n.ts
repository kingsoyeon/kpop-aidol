export type Locale = 'ko' | 'en'

export interface I18nDict {
    [key: string]: string | I18nDict
}

export const copyByLocale: Record<Locale, I18nDict> = {
    ko: {
        common: {
            money: '만',
            krw: '원',
            moneyUnit: '만원',
            cost: '비용',
            confirm: '확인',
            loading: '로딩 중...',
            error: '오류 발생',
            next: '다음',
        },
        intro: {
            title: 'K-POP A-IDOL',
            subtitle: '나만의 AI 아이돌 키우기',
            startBtn: '엔터테인먼트 설립하기',
            companyName: '회사명',
            companyPlaceholder: '예: GRID Entertainment',
        },
        casting: {
            title: '새로운 연습생을 발굴하세요',
            subtitle: '프로필을 신중히 검토하여 최적의 그룹을 구성하세요.',
            selectionLimit: '(최소 {{min}}명 ~ 최대 {{max}}명)',
            fallbackError: 'AI 생성 불가 — 기본 연습생 카드로 대체됩니다.',
            selectedCount: '선택',
            personUnit: '명',
            insufficientFunds: '자금 부족',
            castConfirmBtn: '캐스팅 확정',
            minSelectionReq: '최소 {{min}}명 선택',
            card: {
                riskLabel: '주의',
                dance: '댄스',
                vocal: '보컬',
                visual: '비주얼',
                potential: '잠재력',
                scandal: '구설수',
                romance: '열애설',
                conflict: '분쟁',
                male: '남',
                female: '여',
            }
        },
        studio: {
            title: '데뷔 앨범 프로듀싱',
            subtitle: '컨셉과 타겟 시장을 선택해 곡을 완성하세요',
            genreConcept: '장르/컨셉 선택',
            summer: '청량/서머',
            intense: '강렬/걸크러쉬',
            ballad: '감성/발라드',
            hiphop: '힙합/퍼포먼스',
            targetMarket: '타겟 시장 선택',
            domestic: '국내 중심',
            japan: '일본 공략',
            global: '글로벌 진출',
            produceBtn: '음원 제작',
            producingLyrics: '1. 작사 및 컨셉 기획 중...',
            producingSound: '2. 사운드 메이킹 및 레코딩 중...',
            producingAI: '3. AI 마스터링 진행 중...',
            producingFinal: '마무리 작업 중...',
            resultTitle: '프로듀싱 결과물',
            totalCost: '총 제작 비용',
            nextStageBtn: '방송 출연하기',
            staff: {
                title: '신곡 작업 결과물이 도착했습니다.',
                lyrics: '가사 (일부)',
                listen: '오디오 미리듣기',
            }
        },
        musicshow: {
            title: '음악 방송 출격',
            subtitle: '무대 위에서 가장 빛나는 순간',
            live: {
                viewerCount: '시청자',
                chatPlaceholder: '실시간 채팅을 입력해보세요...',
                performing: 'PERFORMING...',
                stageClear: 'STAGE CLEAR!',
                waiting: '대기중...',
            },
            judge: {
                startBtn: '심사 시작',
                progress: '심사위원들이 평가하고 있습니다...',
                title: '심사위원 점수',
                winProb: 'Win Probability',
                composition: '구성력',
                vocal: '보컬 완성도',
                performance: '퍼포먼스',
                popularity: '대중성',
                buzz: '화제성',
                total: 'TOTAL',
            },
            result: {
                btn: '결과 확인하기',
            },
            track: {
                currentTrack: 'CURRENT TRACK',
            }
        },
        chartResult: {
            title: '차트 결과 발표',
            resultLabel: "이번 주의 기록",
            revenue: '수익/손실',
            fandomChange: '팬덤 변화',
            repChange: '평판 변화',
            nextComebackBtn: '다음 컴백 준비',
            navigatingEvent: '이벤트 발생...',
            badge: {
                first: '이번 주 1위!',
                top: '상위권 진입!',
                mid: '중위권 기록',
                low: '아쉬운 성적...',
                fail: '나락...',
            }
        },
        event: {
            title: '긴급 이벤트 발생',
            relatedMember: '관련 멤버:',
            chooseAction: '대응 방법 선택',
            resultTitle: '대응 결과',
            nextBtn: '다음 컴백 준비',
            loading: '위기 상황 분석 중...',
            repMsg: '평판',
            moneyMsg: '자금',
            fanMsg: '팬덤',
        },
        gameover: {
            title: 'GAME OVER',
            bankruptcy: '파산',
            bankruptcyDesc: '자본금이 고갈되어 더 이상 회사를 운영할 수 없습니다.',
            reputationRuin: '나락',
            reputationRuinDesc: '평판이 바닥에 떨어져 여론을 돌이킬 수 없습니다.',
            restartBtn: '새 게임 시작',
        }
    },
    en: {
        common: {
            money: '',
            krw: '₩',
            moneyUnit: '',
            cost: 'Cost',
            confirm: 'Confirm',
            loading: 'Loading...',
            error: 'Error occurred',
            next: 'Next',
        },
        intro: {
            title: 'K-POP A-IDOL',
            subtitle: 'Raise your own AI Idol',
            startBtn: 'Establish Entertainment',
            companyName: 'Company Name',
            companyPlaceholder: 'e.g., GRID Entertainment',
        },
        casting: {
            title: 'Discover New Trainees',
            subtitle: 'Carefully review profiles to form the optimal group.',
            selectionLimit: '(Min {{min}} ~ Max {{max}})',
            fallbackError: 'AI generation failed — replaced with default trainees.',
            selectedCount: 'Selected',
            personUnit: '',
            insufficientFunds: 'Insufficient Funds',
            castConfirmBtn: 'Confirm Casting',
            minSelectionReq: 'Select at least {{min}}',
            card: {
                riskLabel: 'Risk',
                dance: 'Dance',
                vocal: 'Vocal',
                visual: 'Visual',
                potential: 'Potential',
                scandal: 'Scandal',
                romance: 'Romance',
                conflict: 'Conflict',
                male: 'M',
                female: 'F',
            }
        },
        studio: {
            title: 'Producing Debut Album',
            subtitle: 'Select concept and target market to complete the track',
            genreConcept: 'Select Genre/Concept',
            summer: 'Refreshing/Summer',
            intense: 'Intense/Girl Crush',
            ballad: 'Emotional/Ballad',
            hiphop: 'Hip Hop/Performance',
            targetMarket: 'Select Target Market',
            domestic: 'Domestic Focus',
            japan: 'Japan Target',
            global: 'Global Advance',
            produceBtn: 'Produce Track',
            producingLyrics: '1. Writing lyrics and planning concept...',
            producingSound: '2. Making sound and recording...',
            producingAI: '3. AI mastering in progress...',
            producingFinal: 'Finishing touches...',
            resultTitle: 'Production Result',
            totalCost: 'Total Production Cost',
            nextStageBtn: 'Go to Music Show',
            staff: {
                title: 'New track result has arrived.',
                lyrics: 'Lyrics (excerpt)',
                listen: 'Audio Preview',
            }
        },
        musicshow: {
            title: 'Music Show Appearance',
            subtitle: 'The brightest moment on stage',
            live: {
                viewerCount: 'Viewers',
                chatPlaceholder: 'Enter live chat...',
                performing: 'PERFORMING...',
                stageClear: 'STAGE CLEAR!',
                waiting: 'Waiting...',
            },
            judge: {
                startBtn: 'Start Judging',
                progress: 'Judges are evaluating...',
                title: 'Judge Scores',
                winProb: 'Win Probability',
                composition: 'Composition',
                vocal: 'Vocal Quality',
                performance: 'Performance',
                popularity: 'Popularity',
                buzz: 'Buzz',
                total: 'TOTAL',
            },
            result: {
                btn: 'Check Result',
            },
            track: {
                currentTrack: 'CURRENT TRACK',
            }
        },
        chartResult: {
            title: 'Chart Result Announcement',
            resultLabel: "This Week's Record",
            revenue: 'Revenue/Loss',
            fandomChange: 'Fandom Change',
            repChange: 'Reputation Change',
            nextComebackBtn: 'Prepare Next Comeback',
            navigatingEvent: 'Event occurring...',
            badge: {
                first: 'No.1 This Week!',
                top: 'Top Charts!',
                mid: 'Mid Chart',
                low: 'Disappointing...',
                fail: 'Canceled...',
            }
        },
        event: {
            title: 'Emergency Event Occurred',
            relatedMember: 'Related Member:',
            chooseAction: 'Select Response Action',
            resultTitle: 'Response Result',
            nextBtn: 'Prepare Next Comeback',
            loading: 'Analyzing crisis situation...',
            repMsg: 'Rep',
            moneyMsg: 'Money',
            fanMsg: 'Fandom',
        },
        gameover: {
            title: 'GAME OVER',
            bankruptcy: 'Bankruptcy',
            bankruptcyDesc: 'Capital depleted, unable to run the company anymore.',
            reputationRuin: 'Canceled',
            reputationRuinDesc: 'Reputation hit rock bottom, unable to reverse public opinion.',
            restartBtn: 'Start New Game',
        },
        chat: {
            "언제 시작해 ㅠㅠ": "When does it start TT",
            "빨리 무대 보고싶당!!": "Wanna see the stage soon!!",
            "대기 타는 중!!": "Waiting on standby!!",
            "이번 컨셉 대박일듯": "This concept will be epic",
            "두근두근...": "Pit-a-pat...",
            "빨리 나와라 얍": "Come out quickly plz",
            "완전 기대된다 ㅠㅠ": "So excited TT",
            "오픈콜 대기중": "Waiting for open call",
            "대박이다!!!!!": "Daebak!!!!!",
            "오 노래 좋은데?": "Oh the song is good?",
            "진짜 최고다 ㅠㅠㅠ": "Truly the best TTT",
            "우리 애들 미모 무슨 일...": "What's with our kids' visuals...",
            "하트 뿅뿅 ❤️": "Heart heart ❤️",
            "이번 컨셉 찰떡이네": "This concept fits perfectly",
            "이거 1위 각이다": "This is totally 1st place material",
            "퍼포먼스 미쳤다...": "Performance is crazy...",
            "와 라이브 찢었네": "Wow they tore up the live",
            "빨리 무대 보고싶당": "Wanna see the stage soon",
            "이번 음원 대박날듯!!!": "This track will be a hit!!!",
            "사랑해 💖": "Love you 💖",
            "스밍 돌리자!!!!": "Let's stream!!!!",
            "폼 미쳤다 ㄷㄷ": "Form is crazy",
            "오 마이 갓": "Oh my god",
            "so beautiful, crying 😭": "so beautiful, crying 😭"
        }
    }
}

export function translate(path: string, locale: Locale, params?: Record<string, string | number>): string {
    const keys = path.split('.')
    let current: any = copyByLocale[locale]

    for (const key of keys) {
        if (current[key] === undefined) {
            console.warn(`Translation missing for key: ${path}`)
            return path
        }
        current = current[key]
    }

    let text = current as string

    if (params) {
        for (const [key, value] of Object.entries(params)) {
            text = text.replace(`{{${key}}}`, String(value))
        }
    }

    return text
}
