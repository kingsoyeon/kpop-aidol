# K-Pop A IDOL 미구현 및 수정 필요 항목 (TODO)

지침서(PRD, Dev Guide, Troubleshooting)와 현재 구현 상태를 비교 분석한 결과, 다음 항목들의 구현 및 수정이 필요합니다.

## ⚠️ 핵심 기능 및 설계 누락 (Missing)
- [ ] **다국어(i18n) 지원**: KO/EN 언어 스위치 및 `copyByLocale` 구조 도입 (모든 하드코딩 텍스트 분리)
- [ ] **Lyria RealTime 구현**: `lib/lyriaRealtime.ts` 및 WebSocket 로직 추가 (Vertex AI 장애 대비 대안)
- [ ] **PWA 환경 설정**: `public/manifest.json` 및 서비스 워커 등 모바일 최적화/설치 설정 추가
- [ ] **UI 사운드 엔진**: Web Audio API 기반 효과음(Click, tick, success 등) 적용
- [ ] **상태 관리 영속성**: `localStorage`를 이용한 실시간 게임 상태 저장 및 새로고침 시 복구 로직

## 🎨 디자인 시스템 및 UX 고도화
- [ ] **CastingPhase 전역 드로어 UI**: 개별 카드 내부 스탯창이 아닌, Phoning 앱 스타일의 전 화면 슬라이드업 드로어 적용
- [ ] **Lyria 호출 안정화**: API 요청 사이 1.5초 쿨다운 및 순차(sequential) 호출 로직 명시적 반영
- [ ] **에러 핸들링 및 Fallback**: 모든 API 장애 시나리오별 구체적인 대체 데이터(하드코딩된 연습생 등) 처리
- [ ] **보컬 제약 안내**: 현재 Lyria-002 모델이 연주곡 전용임을 사용자에게 명확히 알리는 UX 가이드 추가

## 🐛 잠재적 버그 및 성능 최적화
- [ ] **MusicShowPhase 인터랙션**: 채팅 애니메이션과 AI 심사 결과 수신 간의 Race condition 방지 강화
- [ ] **숫자 정렬(tabular-nums) 검증**: HUD 및 결과창의 숫자가 가변폭 없이 고정폭으로 수직 정렬되는지 재확인
- [ ] **애니메이션 최적화**: 채팅/파티클 요소에 `will-change: transform` 속성 적용 및 성능 부하 관리ㄴㅇㄴㅇㄹ
