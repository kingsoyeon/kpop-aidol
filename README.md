# 🎙️ K-Pop A IDOL  
> **당신만의 AI K-Pop 아이돌 기획사 시뮬레이션**  

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)

---

## ✨ 프로젝트 소개 (Introduction)

**K-Pop A IDOL**은 구글의 최첨단 AI 기술(Gemini, Imagen 4, Lyria)을 활용하여 플레이어가 직접 K-Pop 기획사의 대표가 되어 아이돌을 육성하고 성공적인 데뷔를 이끄는 **AI 기반 시뮬레이션 게임**입니다.

트렌디한 **Y2K 감성**의 인터페이스와 실시간 AI 분석을 통해 매번 새로운 게임 경험을 제공합니다.

### 🌐 [실시간 게임 플레이 (Live Demo)](https://kpop-aidol.vercel.app)

---

## 🚀 주요 기능 (Key Features)

### 1. 💎 캐스팅 단계 (Casting Phase)
- **AI 연습생 스카우트**: Imagen 4로 생성된 독특한 비주얼의 연습생들을 캐스팅합니다.
- **Gemini 정밀 분석**: 연습생의 잠재력, 능력치(보컬, 댄스, 비주얼) 뿐만 아니라 구설수, 열애설 등 리스크 요소까지 AI가 정밀하게 분석합니다.

### 2. 💿 스튜디오 제작 (Studio Phase)
- **음원 기획**: 곡 제목, 컨셉(Summer, Intense, Ballad, Hiphop), 타겟 시장(국내, 일본, 글로벌)을 설정합니다.
- **AI 가사 및 음원**: Gemini를 통해 감각적인 가사를 생성하고, Lyria를 통해 컨셉에 맞는 음악적 요소를 반영합니다.

### 3. 📺 뮤직 쇼 & 차트 (Music Show & Chart)
- **컴백 무대**: 실시간 대중 반응을 시뮬레이션하여 음악 방송 점수를 산출합니다.
- **AI 심사평**: Gemini가 곡의 구성, 보컬, 퍼포먼스 등을 종합적으로 심사하여 차트 순위(1위 ~ 나락)를 결정합니다.

### 4. 📉 경영 및 이벤트 (Management)
- **경제 시스템**: 초기 자본을 활용하여 캐스팅과 제작에 투자하고, 성과에 따른 수익과 팬을 확보합니다.
- **랜덤 이벤트**: 아이돌 활동 중 발생하는 다양한 사건 사고(스캔들, 분쟁 등)에 대응하여 기획사의 명성을 유지해야 합니다.

---

## 🛠️ 기술 스택 (Tech Stack)

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Library**: React 19
- **Styling**: Tailwind CSS 4, Lucide React (Icons)
- **UI Components**: Radix UI, Shadcn UI

### AI Integration (Google AI SDK)
- **Gemini 1.5 Pro/Flash**: 시나리오 분석, 심사평 생성, 가사 작성
- **Imagen 4**: 아이돌 프로필 이미지 생성
- **Lyria**: 스타일 기반 오디오 요소 (RealTime 예정)

---

## 📦 설치 및 실행 방법 (Getting Started)

### 사전 준비 (Prerequisites)
- [Node.js](https://nodejs.org/) (v18 이상 권장)
- [Google AI Studio API Key](https://aistudio.google.com/app/apikey)

### 단계별 실행
1. 저장소 클론 (Clone the Repo)
   ```bash
   git clone https://github.com/your-username/kpop-aidol.git
   cd kpop-aidol
   ```

2. 의존성 설치 (Install Dependencies)
   ```bash
   npm install
   ```

3. 환경 변수 설정 (Environment Variables)
   `.env.local` 파일을 생성하고 API 키를 추가합니다.
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
   ```

4. 개발 서버 실행 (Run Development Server)
   ```bash
   npm run dev
   ```

---

## 📂 프로젝트 구조 (Project Structure)

```text
src/
├── app/              # Next.js App Router (Page, Layout)
├── components/       
│   └── game/        # 게임 페이즈별 핵심 컴포넌트 (Casting, Studio, etc.)
├── hooks/            # 커스텀 훅
├── lib/              # AI API 클라이언트 및 외부 라이브러리 설정
├── types/            # TypeScript 인터페이스 및 게임 데이터 정의
└── styles/           # 전역 스타일 및 애니메이션
```

---

## 🗺️ 로드맵 (Roadmap)

- [ ] **다국어(i18n) 지원**: KO/EN 언어 스위치 및 로케일 시스템 고도화
- [ ] **Lyria RealTime 구현**: 더욱 생동감 넘치는 오디오 경험 제공
- [ ] **PWA 지원**: 모바일 앱과 같은 사용자 경험 및 설치 제공
- [ ] **사운드 엔진**: Web Audio API 기반의 타격감 있는 효과음 적용
- [ ] **영속성 추가**: `localStorage`를 통한 실시간 상태 저장 및 복구

---

## 📄 라이선스 (License)
이 프로젝트는 MIT License를 따릅니다.

---
Created with K-Pop A IDOL by **K-Pop A IDOL Team**
