# 작업 진행 로그

> 매 세션 끝에 갱신. 아침에 이 파일부터 확인하세요.

---

## 🌙 세션 #21 — Supertonic 반복 듣기용 음성 캐시

### ✅ 이 세션에서 완료된 것

| # | 항목 | 산출물 |
|---|---|---|
| 1 | 같은 글·같은 속도·같은 음성스타일의 합성 WAV를 재사용하는 음성 캐시 추가 | [web/src/lib/supertonic-tts.ts](../web/src/lib/supertonic-tts.ts) |
| 2 | 음성 캐시 최대 96MB/24개 제한, 48MB 초과 단일 파일 제외, 오래된 항목 자동 정리 추가 | [web/src/lib/supertonic-tts.ts](../web/src/lib/supertonic-tts.ts) |
| 3 | 도구함에 음성 캐시 사용량과 수동 삭제 버튼 추가 | [web/src/routes/Toolbelt.tsx](../web/src/routes/Toolbelt.tsx) |
| 4 | 모델 캐시 삭제 시 관련 음성 캐시도 함께 삭제되도록 정리 | [web/src/lib/supertonic-tts.ts](../web/src/lib/supertonic-tts.ts) |

### 설계 메모

- Supertonic 모델이 준비된 뒤 첫 합성은 여전히 시간이 걸릴 수 있지만, 같은 글을 2~3번 반복해서 들을 때는 저장된 WAV를 바로 재생합니다.
- 캐시 키는 `모델 캐시 버전 + 음성 스타일 + 합성 step + 언어 + 속도 + 본문 해시` 기준입니다.
- 저장공간 문제가 생기지 않도록 음성 캐시는 제한을 넘으면 오래된 항목부터 자동 삭제됩니다.

### 🧪 검증

- ✅ `web`: `npm run build` 성공
- ✅ `git diff --check` 성공

## 🌙 세션 #20 — 상급 글 듣기 학습 루프 추가

### ✅ 이 세션에서 완료된 것

| # | 항목 | 산출물 |
|---|---|---|
| 1 | 상급 글 진행 데이터에 본문 듣기/표현 쉐도잉 카운트 추가 | [src/types/schema.ts](../src/types/schema.ts), [web/src/lib/store.ts](../web/src/lib/store.ts) |
| 2 | 상급 글 `읽기` 탭을 `듣기·읽기` 탭으로 확장 | [web/src/routes/AdvancedArticle.tsx](../web/src/routes/AdvancedArticle.tsx) |
| 3 | 상급 본문 전체 듣기, 고급 표현 쉐도잉 듣기 버튼 추가 | [web/src/routes/AdvancedArticle.tsx](../web/src/routes/AdvancedArticle.tsx) |
| 4 | 상급 목록과 메모리맵에 듣기 횟수 표시 추가 | [web/src/routes/Advanced.tsx](../web/src/routes/Advanced.tsx), [web/src/routes/MemoryMap.tsx](../web/src/routes/MemoryMap.tsx) |

### 🧪 검증

- ✅ `web`: `npm run build` 성공
- ✅ `git diff --check` 성공
- ✅ 시각 QA: 모바일 폭에서 `듣기·읽기`, `본문 듣기`, `고급 표현 쉐도잉` 섹션 표시 확인

## 🌙 세션 #19 — Supertonic TTS 실제 캐시/ONNX 어댑터 연결

### ✅ 이 세션에서 완료된 것

| # | 항목 | 산출물 |
|---|---|---|
| 1 | `onnxruntime-web` 의존성 추가 | [web/package.json](../web/package.json), [web/package-lock.json](../web/package-lock.json) |
| 2 | Supertonic 모델 자산 manifest, 지연 다운로드, Cache Storage 저장/삭제/상태 확인 추가 | [web/src/lib/supertonic-tts.ts](../web/src/lib/supertonic-tts.ts) |
| 3 | WebGPU 우선, WASM fallback ONNX 합성 어댑터 추가 | [web/src/lib/supertonic-tts.ts](../web/src/lib/supertonic-tts.ts) |
| 4 | Supertonic 오디오 재생 종료/중지 상태를 기존 TTS 상태 관리와 연결 | [web/src/lib/tts.ts](../web/src/lib/tts.ts) |
| 5 | 도구함 TTS 카드에 모델 캐시 준비/삭제/상태/테스트 UI 추가 | [web/src/routes/Toolbelt.tsx](../web/src/routes/Toolbelt.tsx) |
| 6 | Supertonic/ONNX Runtime 고지 문서 추가 | [docs/third-party-notices.md](third-party-notices.md) |

### 설계 메모

- 모델 파일은 여전히 앱 번들에 넣지 않습니다. 사용자가 직접 `모델 캐시 준비`를 누를 때만 Hugging Face에서 약 398MB 자산을 내려받고, 합성 중 캐시가 비어 있으면 재다운로드하지 않고 시스템 TTS로 fallback합니다.
- ONNX Runtime Web WASM 자산은 배포 산출물에 포함되지만 PWA 사전 캐시 대상은 아닙니다. Supertonic 실행 경로가 호출될 때만 로드를 시도합니다.
- Supertonic 실패, 미지원 브라우저, 미캐시 상태에서는 기존 시스템 TTS로 자동 fallback합니다.

### 🧪 검증

- ✅ `web`: `npm run build` 성공
- ⏳ 실제 398MB 모델 다운로드/합성 QA는 사용자가 원할 때 별도 수행 권장

## 🌙 세션 #18 — Supertonic TTS 안전 도입 레일

### ✅ 이 세션에서 완료된 것

| # | 항목 | 산출물 |
|---|---|---|
| 1 | TTS provider 설정 추가: `system` / `supertonic` | [src/types/schema.ts](../src/types/schema.ts), [web/src/lib/store.ts](../web/src/lib/store.ts) |
| 2 | Supertonic 조건 고지, 런타임 감지, opt-in 동의 버전, 비용 안내 상수 추가 | [web/src/lib/supertonic-tts.ts](../web/src/lib/supertonic-tts.ts) |
| 3 | Supertonic 준비 모드 선택 시에도 실제 모델 어댑터가 없으면 시스템 TTS로 자동 fallback | [web/src/lib/tts.ts](../web/src/lib/tts.ts) |
| 4 | 도구함에 `TTS 음성 엔진` 카드 추가 | [web/src/routes/Toolbelt.tsx](../web/src/routes/Toolbelt.tsx) |
| 5 | Supertonic 비용/조건 검토 문서를 현재 구현 상태로 갱신 | [docs/tts-supertonic-review.md](tts-supertonic-review.md) |

### 설계 메모

- 현재 단계에서는 Supertonic 모델 파일을 앱 번들에 포함하지 않고 다운로드도 시작하지 않습니다.
- 따라서 새 API 과금이나 모델 다운로드 트래픽은 발생하지 않습니다.
- 사용자가 Supertonic 준비 모드를 켜도 실제 합성 어댑터가 연결되기 전까지는 기존 Web Speech API로 재생합니다.
- 다음 단계는 모델 지연 다운로드, Cache Storage/IndexedDB 캐시, ONNX Runtime Web 어댑터, 모바일 성능 QA입니다.

### 🧪 검증

- ✅ `web`: `npm run build` 성공
- ✅ `git diff --check` 성공
- ✅ 브라우저 QA: 도구함에서 TTS 음성 엔진 카드, 404MB 비용 안내, Supertonic 준비 버튼 표시 확인
- ✅ 브라우저 QA: Supertonic 준비 모드 선택 후 조건 확인 완료/시스템 TTS 자동 fallback 고지 표시 확인
- ✅ 브라우저 콘솔 오류 0건

## 🌙 세션 #17 — 저작권자 표기 + Supertonic TTS 검토

### ✅ 이 세션에서 완료된 것

| # | 항목 | 산출물 |
|---|---|---|
| 1 | 앱 정보에 저작권자 `Nul Maru` 표기 추가 | [web/src/routes/Toolbelt.tsx](../web/src/routes/Toolbelt.tsx) |
| 2 | 패키지 메타데이터 author를 `Nul Maru`로 추가 | [web/package.json](../web/package.json), [web/package-lock.json](../web/package-lock.json) |
| 3 | Supertonic TTS의 앱 적용 가능성, 라이선스, 구현 조건 검토 문서화 | [docs/tts-supertonic-review.md](tts-supertonic-review.md) |

### 설계 메모

- 앱 표기는 `© 2026 Nul Maru. All rights reserved.`로 표시합니다.
- Supertonic은 영어/한국어/베트남어/일본어를 모두 지원하므로 학습 앱 방향과 잘 맞지만, 모델이 OpenRAIL-M이고 크기가 커서 기본 번들 탑재가 아니라 선택형 지연 다운로드 방식이 적합합니다.

### 🧪 검증

- ✅ `web`: `npm run build` 성공
- ✅ `git diff --check` 성공

## 🌙 세션 #16 — 앱 표시 버전 갱신

### ✅ 이 세션에서 완료된 것

| # | 항목 | 산출물 |
|---|---|---|
| 1 | 홈/도구함에 표시되는 앱 버전을 현재 영어 Stage 1~3 개발 수준에 맞춰 `v0.8.0`으로 상향 | [web/package.json](../web/package.json), [web/package-lock.json](../web/package-lock.json) |

### 설계 메모

- 현재 앱은 영어 초급/중급/상급 핵심 학습 루프, 낙서장 기반 개인화, 최신 상급 주제 생성, 과정별 축 탐색까지 들어간 상태입니다.
- 베트남어/일본어 확장과 장기 안정화는 남아 있으므로 정식 `1.0.0` 대신 영어 완성 베타에 가까운 `0.8.0`으로 표시합니다.

### 🧪 검증

- ✅ `web`: `npm run build` 성공
- ✅ `git diff --check` 성공

## 🌙 세션 #15 — 다른 축으로 탐색 과정별 분리

### ✅ 이 세션에서 완료된 것

| # | 항목 | 산출물 |
|---|---|---|
| 1 | `일자` 축을 초급 30일 트랙, 중급 학습 순서, 상급 학습 순서로 분리 | [web/src/routes/AxisDay.tsx](../web/src/routes/AxisDay.tsx) |
| 2 | `단계` 축 하단 Unit 목록을 현재 선택 과정에 맞게 변경 | [web/src/routes/AxisStage.tsx](../web/src/routes/AxisStage.tsx) |
| 3 | `장소` 축을 중급 대화/리딩 맥락과 상급 이슈 맥락으로 확장 | [web/src/routes/AxisPlace.tsx](../web/src/routes/AxisPlace.tsx) |
| 4 | `상황` 축을 중급 기능별 미션과 상급 토론·작문·발화 미션으로 확장 | [web/src/routes/AxisSituation.tsx](../web/src/routes/AxisSituation.tsx) |
| 5 | `시간` 축도 중급/상급 추천 루프가 나오도록 함께 보강 | [web/src/routes/AxisTime.tsx](../web/src/routes/AxisTime.tsx) |
| 6 | 낙서장 관심 주제와 생활 패턴을 축 탐색 정렬에 재사용하는 공통 로직 추가 | [web/src/lib/course-axis.ts](../web/src/lib/course-axis.ts) |

### 설계 메모

- 초급은 기존 30강, phrase, place, situation, time 좌표 체계를 그대로 유지합니다.
- 중급은 `DIALOGUE_LESSONS`와 `INTERMEDIATE_READING_LESSONS`를 장소/상황/시간 축으로 다시 묶어 보여줍니다.
- 상급은 기본 상급 글과 최신 생성 글을 합쳐 장소/상황/시간 축으로 재배열합니다.
- 낙서장에 `우주산업`, `기술/AI`, `업무`, `여행`, `시사 토론` 같은 신호가 있으면 관련 축과 콘텐츠에 `맞춤` 표시가 붙고 우선 노출됩니다.

### 🧪 검증

- ✅ `web`: `npm run build` 성공
- ✅ `server/workers`: `npm run typecheck` 성공
- ✅ `git diff --check` 성공
- ✅ 브라우저 QA: 중급 선택 후 일자/장소/상황/시간 축에서 중급 전용 콘텐츠 표시 확인
- ✅ 브라우저 QA: 상급 선택 후 단계/일자/장소/상황/시간 축에서 상급 전용 콘텐츠 표시 확인
- ✅ 브라우저 QA: 상급 장소 축에서 낙서장 우주산업 신호가 기술·우주 랩과 Space 관련 글을 우선 노출하는 것 확인
- ✅ 브라우저 콘솔 오류 0건
- ✅ QA 스크린샷 저장: [42-axis-intermediate-day.png](qa-screens/42-axis-intermediate-day.png), [43-axis-intermediate-place.png](qa-screens/43-axis-intermediate-place.png), [44-axis-intermediate-situation.png](qa-screens/44-axis-intermediate-situation.png), [45-axis-intermediate-time.png](qa-screens/45-axis-intermediate-time.png), [46-axis-advanced-stage.png](qa-screens/46-axis-advanced-stage.png), [47-axis-advanced-day.png](qa-screens/47-axis-advanced-day.png), [48-axis-advanced-place.png](qa-screens/48-axis-advanced-place.png), [49-axis-advanced-situation.png](qa-screens/49-axis-advanced-situation.png), [50-axis-advanced-time.png](qa-screens/50-axis-advanced-time.png)

## 🌙 세션 #14 — 과정별 메모리맵 분리 + 낙서장 기반 동적 지도

### ✅ 이 세션에서 완료된 것

| # | 항목 | 산출물 |
|---|---|---|
| 1 | `메모리맵`을 현재 선택 과정별로 분기 | [web/src/routes/MemoryMap.tsx](../web/src/routes/MemoryMap.tsx) |
| 2 | 초급은 기존 Phrase Memory Map 유지 | [web/src/routes/MemoryMap.tsx](../web/src/routes/MemoryMap.tsx) |
| 3 | 중급은 대화 암송 지도 + 리딩·리스닝 지도 표시 | [web/src/routes/MemoryMap.tsx](../web/src/routes/MemoryMap.tsx) |
| 4 | 상급은 Article & Debate 기억 지도 표시 | [web/src/routes/MemoryMap.tsx](../web/src/routes/MemoryMap.tsx) |
| 5 | 낙서장 관심 주제와 생활 패턴으로 중급/상급 카드 정렬 및 `맞춤` 표시 | [web/src/routes/MemoryMap.tsx](../web/src/routes/MemoryMap.tsx) |
| 6 | 대화 연습/퀴즈, 리딩 듣기·쉐도잉·퀴즈, 상급 작문·발화 이력을 지도에 반영 | [web/src/routes/MemoryMap.tsx](../web/src/routes/MemoryMap.tsx) |

### 설계 메모

- 중급 메모리맵은 `DIALOGUE_LESSONS`, `INTERMEDIATE_READING_LESSONS`, 사용자 진행률, 퀴즈 기록을 사용합니다.
- 상급 메모리맵은 기본 상급 글과 생성된 최신 주제 글을 합쳐 보여주고, 낙서장 기반 맞춤 추천 순서를 유지합니다.
- 낙서장에 `우주산업`, `기술/AI`, `업무`, `여행`, `시사 토론` 같은 신호가 있으면 관련 카드가 위로 올라옵니다.
- 메모리 상태는 과정별로 다르게 계산합니다: 초급은 SRS 기억강도, 중급은 연습/완료/퀴즈 이력, 상급은 읽기/작문피드백/발화/완료 이력입니다.

### 🧪 검증

- ✅ `web`: `npm run build` 성공
- ✅ 브라우저 QA: 상급 선택 후 메모리맵에서 Stage 3 Article & Debate 지도 표시 확인
- ✅ 브라우저 QA: 상급 메모리맵에서 낙서장 우주산업 신호가 우주 관련 글을 상단 맞춤 카드로 올리는 것 확인
- ✅ 브라우저 QA: 중급 선택 후 메모리맵에서 Stage 2 대화/리딩 지도 표시 확인
- ✅ 브라우저 QA: 중급 메모리맵에서 우주산업 신호가 `A Small Satellite With a Big Job`을 맞춤 리딩으로 올리는 것 확인
- ✅ 브라우저 콘솔 오류 0건
- ✅ QA 스크린샷 저장: [40-memory-map-advanced.png](qa-screens/40-memory-map-advanced.png), [41-memory-map-intermediate.png](qa-screens/41-memory-map-intermediate.png)

## 🌙 세션 #13 — 과정별 오늘/1분학습 분리 + 하단 메뉴 순서 수정

### ✅ 이 세션에서 완료된 것

| # | 항목 | 산출물 |
|---|---|---|
| 1 | 상급 선택 상태에서 `오늘`이 초급 Day 추천을 보여주던 문제 수정 | [web/src/routes/Home.tsx](../web/src/routes/Home.tsx) |
| 2 | 중급 `오늘`을 대화 암송/리딩·리스닝 추천으로 분리 | [web/src/routes/Home.tsx](../web/src/routes/Home.tsx) |
| 3 | 상급 `오늘`을 긴 글·토론·작문·발화 평가 추천으로 분리 | [web/src/routes/Home.tsx](../web/src/routes/Home.tsx) |
| 4 | 기본 `1분학습`이 현재 과정에 맞는 문제를 생성하도록 수정 | [web/src/routes/Review.tsx](../web/src/routes/Review.tsx) |
| 5 | 상급 전용 표현 퀴즈 생성기 추가 | [src/data/advanced-quizzes.ts](../src/data/advanced-quizzes.ts) |
| 6 | 하단 메뉴 순서를 `오늘 → 1분학습 → 메모리맵 → 도구`로 변경 | [web/src/components/BottomBar.tsx](../web/src/components/BottomBar.tsx) |
| 7 | 상급 객관식 보기에서 정답이 빠질 수 있던 회전 로직 수정 | [src/data/advanced-quizzes.ts](../src/data/advanced-quizzes.ts) |
| 8 | 배포본에서 이전 PWA 화면이 남지 않도록 서비스워커 즉시 갱신 설정 추가 | [web/vite.config.ts](../web/vite.config.ts), [web/src/main.tsx](../web/src/main.tsx) |

### 설계 메모

- 초급 과정에서는 기존 Day/회로/스토리 중심 홈을 유지합니다.
- 중급 과정에서는 초급 Day를 숨기고, 대화 암송과 뉴스형 리딩·리스닝을 오늘 추천과 1분학습의 기본 콘텐츠로 사용합니다.
- 상급 과정에서는 초급 Day를 숨기고, 낙서장 관심 주제와 상급 글 진행률을 반영해 긴 글·토론·발화 과제를 추천합니다.
- `1분학습`은 명시적인 source가 없더라도 현재 선택 과정에 따라 초급/중급/상급 문제 은행을 선택합니다.

### 🧪 검증

- ✅ `web`: `npm run build` 성공
- ✅ 브라우저 QA: 상급 선택 후 홈에서 초급 Day 대신 상급 글 추천 표시 확인
- ✅ 브라우저 QA: 상급 1분학습에서 상급 표현 문제와 정답 피드백 확인
- ✅ 브라우저 QA: 중급 선택 후 홈에서 중급 대화/리딩 추천 표시 확인
- ✅ 브라우저 QA: 중급 1분학습에서 중급 대화 문제 표시 확인
- ✅ 브라우저 콘솔 오류 0건
- ✅ 배포 QA 중 PWA 캐시가 이전 화면을 유지하는 문제 확인 후 즉시 갱신 설정 보강
- ✅ QA 스크린샷 저장: [37-course-aware-home-advanced.png](qa-screens/37-course-aware-home-advanced.png), [38-course-aware-review-advanced.png](qa-screens/38-course-aware-review-advanced.png), [39-course-aware-review-intermediate.png](qa-screens/39-course-aware-review-intermediate.png)

## 🌙 세션 #12 — 중급 뉴스형 리딩/리스닝 랩 추가 + 영어 앱 마감 QA

### ✅ 이 세션에서 완료된 것

| # | 항목 | 산출물 |
|---|---|---|
| 1 | 중급 콘텐츠 소스 10개 검토 및 앱 내 소스 프로필화 | [src/data/intermediate-readings.seed.ts](../src/data/intermediate-readings.seed.ts) |
| 2 | BBC/VOA/BNE식 학습 구조, 아시아·문화·커뮤니티 주제 반영 | [src/data/intermediate-readings.seed.ts](../src/data/intermediate-readings.seed.ts) |
| 3 | 중급 B1~B1-B2 원본 리딩/리스닝 콘텐츠 10편 추가 | [src/data/intermediate-readings.seed.ts](../src/data/intermediate-readings.seed.ts) |
| 4 | 중급 리딩 퀴즈 자동 생성: 요지 객관식 + 핵심 어휘 빈칸 | [src/data/intermediate-reading-quizzes.ts](../src/data/intermediate-reading-quizzes.ts) |
| 5 | Stage 2 허브를 대화 + 뉴스 리딩 구조로 확장 | [web/src/routes/Intermediate.tsx](../web/src/routes/Intermediate.tsx) |
| 6 | 중급 리딩 목록/상세 화면 추가 | [web/src/routes/IntermediateReadings.tsx](../web/src/routes/IntermediateReadings.tsx), [web/src/routes/IntermediateReading.tsx](../web/src/routes/IntermediateReading.tsx) |
| 7 | 읽기/듣기/쉐도잉/완료 이력을 로컬 IndexedDB 상태에 저장 | [src/types/schema.ts](../src/types/schema.ts), [web/src/lib/store.ts](../web/src/lib/store.ts) |
| 8 | 1분복습에 중급 리딩 전용 문제 세트 연결 | [web/src/routes/Review.tsx](../web/src/routes/Review.tsx) |

### 반영한 중급 소스

- 글로벌 표준/학습형: BBC Learning English 6 Minute English, VOA Learning English, Breaking News English
- 아시아권 소식: SCMP Hong Kong, The Straits Times, Nikkei Asia Lifestyle/Culture
- 유럽·영미 문화/사회: The Guardian Lifestyle/Society, Newsela, Linguapress Intermediate
- 커뮤니티 설명형: Reddit r/ExplainLikeImFive

### 설계 메모

- 모든 중급 본문은 앱 내부에서 새로 작성한 원본 학습 콘텐츠입니다. 외부 기사·스크립트 문장을 복제하지 않았습니다.
- BBC/VOA/BNE는 오디오, 느린 뉴스, 레벨형 퀴즈의 학습 구조만 반영했습니다.
- SCMP, Straits Times, Guardian, Linguapress, Reddit은 주제 방향과 문체 난이도 참고용으로만 사용합니다.
- Newsela는 같은 주제를 수준별로 조절하는 레벨링 아이디어만 반영합니다.
- Nikkei Asia는 RSS 약관상 자동 수집이 아닌 참고 소스로만 유지합니다.

### 🧪 검증

- ✅ `web`: `npm run build` 성공
- ✅ `server/workers`: `npm run typecheck` 성공
- ✅ 브라우저 QA: Stage 2 중급 허브 로드 확인
- ✅ 브라우저 QA: 중급 리딩 목록 10편 표시 확인
- ✅ 브라우저 QA: 리딩 상세에서 소스 링크, 본문, 어휘, 요지 퀴즈, 쉐도잉, 쓰기/말하기 프롬프트 표시 확인
- ✅ 브라우저 QA: 상세 요지 퀴즈 정답 피드백 및 학습완료 저장 확인
- ✅ 브라우저 QA: 1분복습 중급 리딩 세트에서 객관식, 빈칸 입력, 정답/오답 피드백, 다음 문제 이동 확인
- ✅ 브라우저 콘솔 오류 0건
- ✅ QA 스크린샷 저장: [32-intermediate-hub.png](qa-screens/32-intermediate-hub.png), [33-intermediate-readings.png](qa-screens/33-intermediate-readings.png), [34-intermediate-reading-detail.png](qa-screens/34-intermediate-reading-detail.png), [35-intermediate-reading-review.png](qa-screens/35-intermediate-reading-review.png), [36-intermediate-reading-review-feedback.png](qa-screens/36-intermediate-reading-review-feedback.png)

### 다음 작업 후보

| 우선순위 | 작업 |
|---|---|
| P1 | 변경사항 커밋 및 GitHub Pages 배포 |
| P1 | 배포본에서 영어 최종 회귀 QA |
| P2 | 영어 안정화 완료 후 베트남어 코스 스캐폴드 착수 |

## 🌙 세션 #11 — 글로벌/아시아 RSS 소스 확장 + 소스 다양화

### ✅ 이 세션에서 완료된 것

| # | 항목 | 산출물 |
|---|---|---|
| 1 | 요청 소스의 실제 RSS/Atom 응답 확인 | BBC, Guardian, NYT, Reddit, SCMP, Straits Times, The Hindu |
| 2 | Worker 뉴스 소스 목록 확장 | [server/workers/src/index.ts](../server/workers/src/index.ts) |
| 3 | 글로벌 트렌드, 커뮤니티, 아시아, 비즈니스, 국제뉴스 토픽 매핑 추가 | [server/workers/src/index.ts](../server/workers/src/index.ts) |
| 4 | 낙서장에서 글로벌/아시아/비즈니스/시사 토론 관심 신호 감지 추가 | [web/src/lib/journal-insights.ts](../web/src/lib/journal-insights.ts) |
| 5 | 상급 추천 토픽 힌트에 시사 토론과 아시아 관심 흐름 반영 | [web/src/lib/advanced-personalization.ts](../web/src/lib/advanced-personalization.ts) |
| 6 | 참고 소스가 한 피드에 몰리지 않도록 뉴스 아이템 라운드로빈 혼합 적용 | [server/workers/src/index.ts](../server/workers/src/index.ts) |
| 7 | Worker 재배포 완료 | `https://sulsul-llm-proxy.sulsul-plus.workers.dev` |

### 반영한 소스

- 글로벌/유럽/미국: BBC World/Business/Technology/Science & Environment, The Guardian World/Long Read/Business/Technology/Environment, NYT World/Business/Technology
- 커뮤니티 트렌드: Reddit `r/worldnews`, Reddit `r/Futurology`
- 아시아: SCMP Asia/China/World/Tech/Business, The Straits Times Asia/World/Business, The Hindu International/Sci-Tech/Business
- 보류: Nikkei Asia는 RSS 약관상 개인 뉴스리더용·재배포 금지 성격이 명확해 기본 앱 소스에서 제외. Financial Times와 The Economist는 유료/제한 성격이 강해 기본 자동 수집 소스에서는 제외.

### 🧪 검증

- ✅ `server/workers`: `npm run typecheck` 성공
- ✅ `web`: `npm run build` 성공
- ✅ Worker deploy 성공: version `7da9e5aa-a306-41e4-8867-15d550729ed0`
- ✅ 실제 `/advanced-current-topic` 호출 성공: `글로벌 트렌드 + 아시아 + 경제/소비` 입력으로 Anthropic 생성 글 반환 확인
- ✅ 참고 소스 다양화 확인: Guardian Long Read, SCMP China, SCMP Tech, SCMP Business가 섞여 반환됨

### 설계 메모

- Reddit은 언론사 보도 소스가 아니라 커뮤니티 트렌드 신호로만 사용합니다.
- 모든 외부 소스는 원문 복제 없이 제목/짧은 RSS 요약을 트렌드 신호로만 쓰고, 앱에는 원본 학습 글을 생성합니다.
- 새 소스 캐시 키를 `news-src:v2`, 생성 글 캐시 키를 `adv-current:v2`로 올려 기존 편향 캐시와 충돌하지 않게 했습니다.

## 🌙 세션 #10 — 최신 소스 기반 동적 상급 콘텐츠 생성 + 영어 완성 QA

### ✅ 이 세션에서 완료된 것

| # | 항목 | 산출물 |
|---|---|---|
| 1 | Worker에 공식 RSS/뉴스 소스 캐시 파이프라인 추가 | [server/workers/src/index.ts](../server/workers/src/index.ts) |
| 2 | Worker `/advanced-current-topic` 엔드포인트 추가: 관심 주제 + 낙서장 + 최신 소스 → 상급 학습 글 생성 | [server/workers/src/index.ts](../server/workers/src/index.ts) |
| 3 | 앱 LLM 클라이언트에 최신 상급 글 생성 API 연결 | [web/src/lib/llm.ts](../web/src/lib/llm.ts) |
| 4 | 생성된 상급 글을 로컬 저장하고 목록/상세에서 학습 가능하게 연결 | [src/types/schema.ts](../src/types/schema.ts), [web/src/lib/store.ts](../web/src/lib/store.ts) |
| 5 | Stage 3 맞춤 추천 영역에 `최신 주제로 상급 글 만들기` 버튼 추가 | [web/src/routes/Advanced.tsx](../web/src/routes/Advanced.tsx) |
| 6 | 동적 생성 글 상세 화면에 참고한 최신 소스 링크 표시 | [web/src/routes/AdvancedArticle.tsx](../web/src/routes/AdvancedArticle.tsx) |
| 7 | Worker 배포 완료 | `https://sulsul-llm-proxy.sulsul-plus.workers.dev` |

### 🧪 검증

- ✅ `server/workers`: `npm run typecheck` 성공
- ✅ `web`: `npm run build` 성공
- ✅ Worker deploy 성공: version `1928c9c5-2e9a-4826-aa52-ad219f27d721`
- ✅ 실제 `/advanced-current-topic` 호출 성공: Anthropic 응답, 최신 소스 4개, 생성 글 반환 확인
- ✅ 브라우저 QA: 앱에서 최신 상급 글 생성 → 맞춤 추천/전체 목록 저장 반영 확인
- ✅ 브라우저 QA: 생성 글 상세에서 참고한 최신 소스, 읽기/토론/쓰기/말하기 탭 표시 확인
- ✅ 영어 핵심 화면 스모크 QA: 오늘, Stage 선택, 중급 대화, 상급, 낙서장, 1분복습, 도구함 로드 확인
- ✅ 브라우저 콘솔 오류 0건
- ✅ QA 스크린샷 저장: [28-advanced-live-generate-ready.png](qa-screens/28-advanced-live-generate-ready.png), [29-advanced-live-generated.png](qa-screens/29-advanced-live-generated.png), [30-advanced-live-generated-detail.png](qa-screens/30-advanced-live-generated-detail.png), [31-english-smoke-qa-final.png](qa-screens/31-english-smoke-qa-final.png)

### 설계 메모

- 최신 소스는 원문을 앱에 복제하지 않고 제목/짧은 RSS 요약을 트렌드 신호로만 사용합니다.
- LLM은 해당 신호를 바탕으로 저작권 문제 없는 원본 학습 글, 표현, 토론 질문, 작문/발화 프롬프트를 생성합니다.
- 생성 결과는 Worker KV에 12시간 캐시되고, 뉴스 소스 목록은 1시간 캐시됩니다.
- 앱은 생성 글을 사용자 로컬 IndexedDB에 저장하므로 같은 글을 바로 다시 학습할 수 있습니다.

### 다음 작업 후보

| 우선순위 | 작업 |
|---|---|
| P1 | 변경사항 커밋 및 GitHub Pages 배포 |
| P1 | 배포본에서 영어 최종 회귀 QA |
| P2 | 영어 안정화 완료 후 베트남어 코스 스캐폴드 착수 |

## 🌙 세션 #9 — 상급 콘텐츠 9개 확장 + 낙서장 기반 맞춤 추천

### ✅ 이 세션에서 완료된 것

| # | 항목 | 산출물 |
|---|---|---|
| 1 | 상급 콘텐츠 메타 추가: 관심 태그, 최근 이슈 라벨, 출처 성격 메모 | [src/types/schema.ts](../src/types/schema.ts) |
| 2 | 상급 콘텐츠를 3개에서 9개로 확장 | [src/data/advanced.seed.ts](../src/data/advanced.seed.ts) |
| 3 | 우주산업, 기술/AI, 환경, 교육, 경제/소비 등 낙서장 관심 주제 감지 추가 | [web/src/lib/journal-insights.ts](../web/src/lib/journal-insights.ts) |
| 4 | 낙서장 관심 주제와 생활 패턴을 상급 글 추천에 반영하는 개인화 로직 추가 | [web/src/lib/advanced-personalization.ts](../web/src/lib/advanced-personalization.ts) |
| 5 | Stage 3 목록에 낙서장 기반 맞춤 추천 영역 추가 | [web/src/routes/Advanced.tsx](../web/src/routes/Advanced.tsx) |
| 6 | 상급 상세 화면에 최근 이슈 라벨과 학습용 재구성 메모 표시 | [web/src/routes/AdvancedArticle.tsx](../web/src/routes/AdvancedArticle.tsx) |

### 🧪 검증

- ✅ `web`: `npm run build` 성공
- ✅ 브라우저 QA: 낙서장에 `space/rockets/satellites/NASA/space industry` 관심 신호 저장 후 우주산업 맞춤 추천 표시 확인
- ✅ 브라우저 QA: 우주산업 상세 글의 최근 이슈 라벨/메모/본문 표시 확인
- ✅ 브라우저 콘솔 오류 0건
- ✅ QA 스크린샷 저장: [26-advanced-personalized-space.png](qa-screens/26-advanced-personalized-space.png), [27-advanced-space-detail.png](qa-screens/27-advanced-space-detail.png)

### 설계 메모

- 현재 구현은 “검증 가능한 앱 내 개인화 큐레이션”입니다. 사용자의 낙서장/생활 패턴으로 관심 주제를 감지하고, 그 주제에 맞는 최근 이슈형 상급 콘텐츠를 우선 노출합니다.
- 실시간 최신 뉴스 자동 수집은 아직 붙이지 않았습니다. 다음 단계에서 LLM 프록시 또는 별도 뉴스/공식 출처 수집 파이프라인을 붙이면 같은 추천 레이어 위에서 최신 주제를 갱신할 수 있습니다.

### 다음 작업 후보

| 우선순위 | 작업 |
|---|---|
| P1 | 영어 전체 회귀 QA: Stage 1/2/3, Journal 개인화, Review, Toolbelt, 레벨테스트 |
| P1 | 개인화 상급 콘텐츠를 LLM 프록시 생성/캐시와 연결 |
| P2 | 영어 안정화 후 베트남어 코스 스캐폴드 착수 |

## 🌙 세션 #8 — 영어 Stage 3 결과 관리 고도화

### ✅ 이 세션에서 완료된 것

| # | 항목 | 산출물 |
|---|---|---|
| 1 | 상급 작문 피드백 이력 타입 추가 | [src/types/schema.ts](../src/types/schema.ts) |
| 2 | 상급 발화 자기평가 이력 타입 추가 | [src/types/schema.ts](../src/types/schema.ts) |
| 3 | 토론 입장/메모, 작문 피드백, 발화 평가 저장 액션 추가 | [web/src/lib/store.ts](../web/src/lib/store.ts) |
| 4 | 상급 상세 화면에 토론 메모, 작문 피드백 기록, 발화 루브릭 자기평가 기록 UI 추가 | [web/src/routes/AdvancedArticle.tsx](../web/src/routes/AdvancedArticle.tsx) |
| 5 | 상급 목록에 작문/발화 누적 수와 최근 상급 기록 카드 추가 | [web/src/routes/Advanced.tsx](../web/src/routes/Advanced.tsx) |

### 🧪 검증

- ✅ `web`: `npm run build` 성공
- ✅ 브라우저 QA: 상급 쓰기 UI, 말하기 자기평가 저장, 최근 상급 기록 반영 확인
- ✅ 브라우저 콘솔 오류 0건
- ✅ QA 스크린샷 저장: [23-advanced-writing-history-ui.png](qa-screens/23-advanced-writing-history-ui.png), [24-advanced-speaking-history-ui.png](qa-screens/24-advanced-speaking-history-ui.png), [25-advanced-recent-results.png](qa-screens/25-advanced-recent-results.png)
- ⚠️ 작문 피드백 버튼은 로컬 환경에서 LLM 프록시가 활성화되어 있어 실제 AI 호출은 피하고 UI 렌더링까지만 확인

### 다음 작업 후보

| 우선순위 | 작업 |
|---|---|
| P1 | 영어 전체 회귀 QA: Stage 1/2/3, Review, Journal, Toolbelt, 레벨테스트 핵심 흐름 |
| P1 | 상급 콘텐츠 3개 → 9개 이상으로 확장 |
| P2 | 영어 안정화 후 베트남어 코스 스캐폴드 착수 |

## 🌙 세션 #7 — Stage 3 상급 Article/Debate/Speaking 1차 구현

### ✅ 이 세션에서 완료된 것

| # | 항목 | 산출물 |
|---|---|---|
| 1 | 상급 긴 글/토론/작문/말하기 데이터 모델 추가 | [src/types/schema.ts](../src/types/schema.ts) |
| 2 | 상급 샘플 콘텐츠 3개 추가: 업무, 뉴스형 이슈, 사회 | [src/data/advanced.seed.ts](../src/data/advanced.seed.ts) |
| 3 | Stage 3 진입 경로를 `/advanced`로 연결 | [src/data/course-levels.seed.ts](../src/data/course-levels.seed.ts), [web/src/App.tsx](../web/src/App.tsx) |
| 4 | Stage 3 목록 화면 추가: 읽은 글/완료율/카테고리/글 카드 | [web/src/routes/Advanced.tsx](../web/src/routes/Advanced.tsx) |
| 5 | 상급 글 상세 화면 추가: 읽기, 토론, 쓰기 피드백, 말하기 평가 스캐폴드 | [web/src/routes/AdvancedArticle.tsx](../web/src/routes/AdvancedArticle.tsx) |
| 6 | 상급 읽기/작문/말하기 진행 저장 액션 추가 | [web/src/lib/store.ts](../web/src/lib/store.ts) |

### 🧪 검증

- ✅ `web`: `npm run build` 성공
- ✅ 브라우저 시각 QA: Stage 3 목록, 상급 글 상세, 쓰기 탭, 말하기 탭 표시 확인
- ✅ 브라우저 콘솔 오류 0건
- ✅ QA 스크린샷 저장: [19-advanced-list.png](qa-screens/19-advanced-list.png), [20-advanced-article.png](qa-screens/20-advanced-article.png), [22-advanced-speaking.png](qa-screens/22-advanced-speaking.png)

### 다음 작업 후보

| 우선순위 | 작업 |
|---|---|
| P1 | 영어 전체 회귀 QA: Stage 1/2/3, Review, Journal, Toolbelt 핵심 흐름 |
| P1 | Stage 3 작문/발화 결과 히스토리와 피드백 저장 고도화 |
| P2 | 영어 안정화 후 베트남어 코스 스캐폴드 착수 |

## 🌙 세션 #6 — 레벨테스트/승급 결과 히스토리

### ✅ 이 세션에서 완료된 것

| # | 항목 | 산출물 |
|---|---|---|
| 1 | 레벨테스트/승급 미션 결과 히스토리 화면 추가 | [web/src/routes/ExamHistory.tsx](../web/src/routes/ExamHistory.tsx) |
| 2 | Stage 선택 화면에서 결과 기록 진입 버튼 추가 | [web/src/routes/AxisStage.tsx](../web/src/routes/AxisStage.tsx) |
| 3 | 시험 완료 화면에서 기록 보기 버튼 추가 | [web/src/routes/PromotionExam.tsx](../web/src/routes/PromotionExam.tsx) |
| 4 | 앱 라우트 `/exam-history` 연결 | [web/src/App.tsx](../web/src/App.tsx) |

### 🧪 검증

- ✅ `web`: `npm run build` 성공
- ✅ 브라우저 시각 QA: Stage 기록 진입, 레벨 기록 요약, 최근 흐름, 상세 피드백, 전체 기록 표시 확인
- ✅ 브라우저 콘솔 오류 0건

### 다음 작업 후보

| 우선순위 | 작업 |
|---|---|
| P1 | Stage 3 Article/Debate/Speaking Assessment 모델 구현 |
| P1 | Stage 3 상급 화면과 첫 콘텐츠 샘플 추가 |
| P2 | 영어 전체 회귀 QA 후 베트남어 확장 준비 |

---

## 🌙 세션 #5 — 성능 안정화 + Stage 2 역할 녹음 QA

### ✅ 이 세션에서 완료된 것

| # | 항목 | 산출물 |
|---|---|---|
| 1 | 시각 QA 중 발견한 라우트 전환 스크롤 잔상 수정 | [web/src/App.tsx](../web/src/App.tsx) |
| 2 | 레벨테스트 제출 후 결과 화면이 중간 위치에서 열리는 문제 수정 | [web/src/routes/PromotionExam.tsx](../web/src/routes/PromotionExam.tsx) |
| 3 | 라우트 lazy-loading 적용으로 초기 JS 번들 축소 | [web/src/App.tsx](../web/src/App.tsx) |
| 4 | Stage 2 역할 A/B 말하기에서 내 차례 녹음/비교 재생 UI 추가 | [web/src/routes/DialogueLesson.tsx](../web/src/routes/DialogueLesson.tsx), [web/src/components/ShadowingRecorder.tsx](../web/src/components/ShadowingRecorder.tsx) |
| 5 | 핵심 화면 시각 QA 스크린샷 저장 | [docs/qa-screens/](qa-screens/) |
| 6 | Stage 2 대화별 퀴즈 뱅크 추가: 시작 문장, 다음 대사, 빈칸, 역할 응답 | [src/data/dialogue-quizzes.ts](../src/data/dialogue-quizzes.ts) |
| 7 | 대화 퀴즈 전용 화면 추가 | [web/src/routes/DialogueQuiz.tsx](../web/src/routes/DialogueQuiz.tsx) |
| 8 | LLM `/roleplay` 스트리밍 클라이언트와 AI 롤플레잉 화면 추가 | [web/src/lib/llm.ts](../web/src/lib/llm.ts), [web/src/routes/DialogueRoleplay.tsx](../web/src/routes/DialogueRoleplay.tsx) |
| 9 | 대화 퀴즈를 1분복습 `source=dialogues`에 연결 | [web/src/routes/Review.tsx](../web/src/routes/Review.tsx) |

### 🧪 검증

- ✅ `web`: `npm run build` 성공
- ✅ Vite 500KB chunk 경고 해소: 초기 JS 약 `503KB` → `228KB`
- ✅ 브라우저 시각 QA: Stage 선택, 대화 목록, 대화 상세, 한글 힌트, 레벨테스트 결과, 역할 녹음, 대화 퀴즈, AI 롤플레잉 화면 확인
- ✅ 브라우저 콘솔 오류 0건

### 다음 작업 후보

| 우선순위 | 작업 |
|---|---|
| P1 | 승급/레벨테스트 결과 히스토리 화면 추가 |
| P2 | Stage 3 Article/Debate/Speaking Assessment 모델 구현 |

---

## 🌙 세션 #4 — Stage 1/2/3 커리큘럼 확장 검토

### ✅ 이 세션에서 완료된 것

| # | 항목 | 산출물 |
|---|---|---|
| 1 | 현재 코드/콘텐츠 구조 재점검: 30강, Phrase, Story, Scenario, Quiz, Journal, Review, Content Lab | `src/types/schema.ts`, `src/data/*`, `web/src/routes/*` |
| 2 | Google Docs 영어 콘텐츠를 초급/중급/상급 과정에 포함 가능한지 검토 | [stage-curriculum-expansion-spec.md](stage-curriculum-expansion-spec.md) |
| 3 | 기존 `stage-1..5`와 새 Stage 1/2/3 명칭 충돌 해결안 정리 | 기존 Stage는 초급 내부 Unit으로 재해석 권장 |
| 4 | 중급 과정 대화 암송/역할별 말하기/한글 힌트/누적 암송 설계 | `DialogueLesson`, `DialogueTurn` 모델 초안 |
| 5 | 상급 과정 토론/긴 글/뉴스/업무/사회 이슈/발화 평가 설계 | `SpeakingAssessment` 모델 초안 |

### 핵심 결론

| 질문 | 결론 |
|---|---|
| Google Docs 자료를 초급에 넣을 수 있나? | 일부 가능. 초급 본편보다 초급 후반 대화 보강팩에 적합 |
| 중급에 넣을 수 있나? | 매우 적합. Stage 2 핵심 설계 자료로 사용 가능 |
| 상급에 넣을 수 있나? | 일부 브릿지로 가능. 상급 본편은 별도 제작 필요 |
| 원문을 그대로 앱에 넣어도 되나? | 권리 확인 전에는 비추천. 구조와 주제만 참고하고 원문은 직접 집필 권장 |

### 구현 검증

- ✅ `web`: `npm run build` 성공
- ✅ 로컬 Vite 서버 `/` 200 응답 확인
- ⚠️ Chrome Computer Use 상태 조회는 타임아웃으로 시각 QA 미완료

### 다국어 확장 결정

| 항목 | 결정 |
|---|---|
| 개발 순서 | 영어 완료·테스트·개선 → 베트남어 → 일본어 |
| 저장 방식 | 초기 다국어 확장은 IndexedDB 유지. 단 언어별 저장 키 분리 |
| 문서 | [multilingual-expansion-plan.md](multilingual-expansion-plan.md) |
| 코드 기반 | `LanguageId`, `LanguageConfig`, `languages.seed.ts`, `language-storage.ts` 추가 |

### 다음 작업 후보

| 우선순위 | 작업 |
|---|---|
| 완료 | `CourseLevelId` 추가 및 초급/중급/상급 Course Stage 메타 설계 |
| 완료 | 기존 `stage-1..5`를 초급 내부 Unit으로 UI/문서에서 재명명 |
| 완료 | 게임식 레벨 탐험전/승급 미션 라우트와 결과 저장 구현 |
| 완료 | 낙서장 기반 선호 주제/생활 패턴/추천 레벨 인사이트 구현 |
| 완료 | Stage 2 `DialogueLesson` 데이터 모델과 암송 플레이어 1차 구현 |
| P1 | Stage 1 후반 Day 18-30 Phrase/Scenario 보강 |
| P1 | Stage 2 대화 퀴즈/역할 녹음/LLM 롤플레잉 연결 |
| P2 | Stage 3 Article/Debate/Speaking Assessment 모델 구현 |

---

## 🌙 야간 세션 #3 — 로컬 개인화 + LLM 프록시 연결 완료

### ✅ 이 세션에서 완료된 것

| # | 항목 | 산출물 |
|---|---|---|
| 1 | 현재 워크스페이스를 원격 `NULMARU/tt_sul` 전체 저장소 기준으로 재정렬 | repo root |
| 2 | 기능개선 상세 명세 작성 | [docs/feature-improvement-spec.md](feature-improvement-spec.md) |
| 3 | Now 추천 알고리즘 점수화 | [web/src/lib/pocket.ts](../web/src/lib/pocket.ts), [web/src/components/NowCard.tsx](../web/src/components/NowCard.tsx) |
| 4 | TTS 종료 대기 기반 전환 제어 | [web/src/lib/tts.ts](../web/src/lib/tts.ts), Lesson/Story/Review/Quiz/Memory Map |
| 5 | Memory Map 모바일 가독성 개선 | [web/src/routes/MemoryMap.tsx](../web/src/routes/MemoryMap.tsx) |
| 6 | 로컬 학습 패턴 수집 + LearnerProfile + Adaptive UI patch 기초 | [src/types/schema.ts](../src/types/schema.ts), [web/src/lib/adaptive-profile.ts](../web/src/lib/adaptive-profile.ts), [web/src/lib/adaptive-ui.ts](../web/src/lib/adaptive-ui.ts) |
| 7 | Toolbelt 맞춤화 기록/되돌리기 UI | [web/src/routes/Toolbelt.tsx](../web/src/routes/Toolbelt.tsx) |
| 8 | API 없이 동작하는 쉐도잉 녹음/비교 재생 UI | [web/src/components/ShadowingRecorder.tsx](../web/src/components/ShadowingRecorder.tsx), [web/src/lib/recorder.ts](../web/src/lib/recorder.ts) |
| 9 | Cloudflare Worker KV 연결 + Claude secret 저장 + Worker 배포 | [server/workers/wrangler.toml](../server/workers/wrangler.toml) |
| 10 | Worker CORS 수정: `localhost` 개발 포트 허용 | [server/workers/src/index.ts](../server/workers/src/index.ts) |
| 11 | LLM JSON 응답 정규화: 코드펜스/캐시 hit도 앱에서 파싱 가능하게 처리 | [server/workers/src/index.ts](../server/workers/src/index.ts) |
| 12 | Journal LLM 빈칸 퀴즈를 실제 저장하고 Review fallback에 연결 | [web/src/routes/Journal.tsx](../web/src/routes/Journal.tsx), [web/src/routes/Review.tsx](../web/src/routes/Review.tsx) |
| 13 | Worker Wrangler 4.x 업데이트 및 취약점 0건 정리 | [server/workers/package.json](../server/workers/package.json) |

### 🔗 현재 연결 정보

| 항목 | 값 |
|---|---|
| Worker URL | `https://sulsul-llm-proxy.sulsul-plus.workers.dev` |
| Web local env | `web/.env.local`에 `VITE_LLM_PROXY_URL` 설정됨 (git ignore 대상) |
| 로컬 앱 | `http://localhost:5174/` |

### 🧪 검증

- ✅ `web`: `npm run build` 성공
- ✅ `server/workers`: `npm run typecheck` 성공
- ✅ Worker deploy 성공: version `5549c681-3e60-4e7d-9d38-0743948f3577`
- ✅ `/health` from `Origin: http://localhost:5174` → 200 + CORS OK
- ✅ `/test` → 200, Claude sample `"Hello!"`
- ✅ `/grade` → 200, 순수 JSON 응답 확인
- ✅ `/diary-to-quiz` → 200, JSON array 응답 확인

### ⚠️ 보안 메모

- 세션 중 Claude API key가 터미널/채팅에 노출된 적이 있음. 이미 폐기/재발급하지 않았다면 Anthropic Console에서 해당 key를 폐기하고 새 key를 Worker secret으로 다시 넣어야 함.

### 다음 작업 후보

| 우선순위 | 작업 |
|---|---|
| P0 | 앱 `도구함 → LLM 연결`에서 헬스 체크/AI 호출 테스트를 브라우저에서 직접 확인 |
| P1 | Roleplay UI 구현 (`/roleplay` 스트리밍 사용) |
| P1 | Story 난이도 변환 결과를 사용자별 캐시에 더 명확히 표시 |
| P1 | Journal derived quiz를 "다음날 due" 규칙으로 SRS에 정식 등록 |
| P2 | GitHub Pages 배포 환경변수에 `VITE_LLM_PROXY_URL` 등록 후 실제 배포 |

---

## 🌙 야간 세션 #2 — Day 15-30 스토리 + LLM 프록시 준비

### ✅ 이 세션에서 완료된 것

| # | 항목 | 산출물 |
|---|---|---|
| 1 | Day 15–30 스토리 16편 본문 풀 작성 (3난이도 + 이해 퀴즈) | [src/data/stories.seed.ts](../src/data/stories.seed.ts) |
| 2 | Stage 4 패턴 어휘 추가 (going to / used to / if / should have / it's been / just in case) | [src/data/phrases.seed.ts](../src/data/phrases.seed.ts) |
| 3 | Day 18–30 레슨 메타·HOOKS·Stage 매핑 | [src/data/stages.seed.ts](../src/data/stages.seed.ts) |
| 4 | **LLM 프록시 배포 가이드 (30분 step-by-step)** | [docs/deploy-llm-proxy.md](deploy-llm-proxy.md) |
| 5 | GitHub Actions — PWA Pages 자동 배포 (템플릿, 활성화 5분) | [docs/templates/github-workflows/](templates/github-workflows/) |
| 6 | GitHub Actions — Workers 자동 배포 (템플릿) | [docs/templates/github-workflows/](templates/github-workflows/) |
| 7 | Workers 코드 강화 — 입력 검증·`/test` 엔드포인트·명확한 에러 | [server/workers/src/index.ts](../server/workers/src/index.ts) |
| 8 | LLM 클라이언트에 `probeHealth()` / `probeTest()` 헬퍼 | [web/src/lib/llm.ts](../web/src/lib/llm.ts) |
| 9 | Toolbelt에 LLM 진단 UI (헬스 체크 + AI 호출 테스트 버튼 + 결과 박스) | [web/src/routes/Toolbelt.tsx](../web/src/routes/Toolbelt.tsx) |
| 10 | 야간 테마 대비 수정 (이전 세션 이슈) | [web/src/index.css](../web/src/index.css) |
| 11 | 루트 README | [README.md](../README.md) |

### 🧪 검증

- ✅ `web` TypeScript 0 error
- ✅ `web` Vite build 통과 → 424KB JS / 134KB gzip / PWA precache 460KB
- ✅ `server/workers` TypeScript 0 error
- ✅ 모든 30편 스토리 phraseIds 가 실제 PHRASES에 존재
- ✅ 모든 30개 lessonIds 가 STAGES에 매핑됨

---

## 🎯 사용자 다음 단계 — 우선순위

### Step 1 (30분, 강력 추천) — LLM 프록시 배포
**가이드**: [docs/deploy-llm-proxy.md](deploy-llm-proxy.md)

진행 순서:
1. Anthropic 계정 + API 키 발급 ($5 충전) — 5분
2. Cloudflare 계정 만들기 (무료) — 5분
3. `npx wrangler login` — 3분
4. `npx wrangler kv namespace create CACHE/RATE` × 2 + wrangler.toml에 id 붙여넣기 — 5분
5. `npx wrangler secret put ANTHROPIC_API_KEY` — 2분
6. `npm run deploy` — 1분
7. `curl YOUR-URL/health` — 동작 확인
8. `web/.env.local`에 `VITE_LLM_PROXY_URL` 설정 — 2분
9. `npm run dev` → 도구함에서 헬스 체크 + AI 호출 테스트 — 5분

### Step 2 (5분) — GitHub Actions 워크플로 활성화 + Pages 켜기
워크플로 파일은 PAT 권한 이슈로 Claude가 푸시 못함 — 사용자가 수동으로 이동:

```bash
cd /Users/spacenulmaru/Projects/projects/tt_sulsul
mkdir -p .github/workflows
cp docs/templates/github-workflows/deploy-pages.yml .github/workflows/
cp docs/templates/github-workflows/deploy-workers.yml .github/workflows/
git add .github/workflows
git commit -m "Enable auto-deploy workflows"
git push
```

> 또 거부되면 PAT에 `workflow` 스코프 추가: https://github.com/settings/tokens

그 다음:
1. https://github.com/NULMARU/tt_sul/settings/pages
2. **Source**: GitHub Actions → **Save**
3. 다음 푸시 시 자동 배포. URL: `https://nulmaru.github.io/tt_sul/`

### Step 3 (옵션) — Workers 자동 배포
1. https://github.com/NULMARU/tt_sul/settings/secrets/actions
2. `CF_API_TOKEN` 시크릿 추가 ([Cloudflare 대시보드](https://dash.cloudflare.com/profile/api-tokens)에서 발급)
3. `CF_ACCOUNT_ID` 시크릿 추가 (CF 대시보드 우측 사이드바)
4. (옵션) `LLM_PROXY_URL` 환경변수 추가 — Pages 빌드 시 자동 주입
5. (옵션) `WORKER_HEALTH_URL` 변수 — 배포 후 자동 헬스체크

---

## 📊 콘텐츠 현황

| 항목 | 수량 | 비고 |
|---|---|---|
| 표현 (Phrase) | 100+ | Day 1-17 + Stage 4 패턴 |
| 시나리오 (3단계 작문) | 12 | tt 원본 마이그레이션 |
| 강 (Lesson) | 30 | Day 1-30 모두 |
| 스테이지 | 5 | 모두 lessonIds 채워짐 |
| Daily Story | **30편 모두 풀 본문** (3난이도) | 야간 세션 #1+#2 |
| 이해 퀴즈 | 30 × 3 = 90 항목 | 요약/빈칸/추론 |
| 6종 퀴즈 | 자동 생성 (강당 ~8문항) | quiz-generator.ts |

---

## 🚀 실행 명령 요약

```bash
# 개발 서버
cd web && npm run dev                    # http://localhost:5173

# 빌드
cd web && npm run build                  # web/dist/

# Workers 배포 (LLM 프록시 가이드 참고)
cd server/workers && npm run deploy

# Workers 로그 실시간
cd server/workers && npm run tail
```

---

## 🐛 알려진 한계

1. **Day 18-30 phraseIds**는 일부만 매핑 (대화·칼럼은 자유 텍스트라 highlight 없음)
2. **Stage 4 패턴**은 phrase로 추가했지만, 시나리오·6종 퀴즈는 자동 생성에 의존 (Day 22+ 강의 시나리오는 비어있음)
3. **음성 합성**은 브라우저 기본 보이스 (iOS Safari는 첫 탭 후 동작)
4. **쉐도잉(녹음+TTS 비교)**은 데이터 모델만 있고 UI 미구현 — 다음 우선 과제
5. **롤플레잉 UI** 미구현 — Workers `/roleplay` 엔드포인트는 준비됨

---

## ✏️ 다음 세션 후보

| 우선순위 | 작업 |
|---|---|
| P0 | (사용자) LLM 프록시 배포 + GitHub Pages 활성화 |
| P1 | 쉐도잉 모드 UI (sulsul 코드 차용) |
| P1 | 롤플레잉 UI (`/roleplay` 스트리밍 활용) |
| P2 | Day 22-30 시나리오 (3단계 누적 작문) 추가 |
| P2 | Stage 4-5 보스 퀴즈 |
| P3 | Capacitor 래핑 → iOS/Android 네이티브 |
