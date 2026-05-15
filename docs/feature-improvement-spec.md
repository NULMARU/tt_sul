# Sulsul+ 기능개선 상세 개발 명세

작성일: 2026-05-15  
기준 저장소: `NULMARU/tt_sul` `main`  
목표: 현재 구현과 전체 비전 사이의 빈 기능을 정리하고, 첫 화면 추천, TTS 전환, Memory Map 가독성, 자기개선, 콘텐츠 강화까지 다음 개발 사이클의 기준으로 확정한다.

---

## 1. 현재 구현 기준선

### 1.1 구현되어 있는 범위

- PWA 웹앱 골격: `web/` Vite + React + TypeScript + Tailwind.
- 주요 라우트: Home, 5축 탐색, Lesson 5-step, Story, Review, Memory Map, Journal, Toolbelt.
- 데이터: 30개 Lesson, 30개 Daily Story, Phrase/Scenario/Stage 시드, 6종 퀴즈 자동 생성기.
- 로컬 상태: Zustand + IndexedDB persist, SRS, 퀴즈 시도, 스토리 진행, 일기, 설정, 통계 저장.
- LLM 프록시 코드: Cloudflare Workers `/grade`, `/roleplay`, `/diary-to-quiz`, `/story-difficulty`, `/health`, `/test`.
- LLM 클라이언트: `web/src/lib/llm.ts`에서 프록시 호출, Toolbelt 진단 UI 제공.

### 1.2 미구현 또는 부분 구현 범위

| 영역 | 현재 상태 | 필요한 보완 |
|---|---|---|
| LLM 배포 | Workers 코드와 배포 문서는 있음 | 실제 배포 URL과 `VITE_LLM_PROXY_URL` 설정 전에는 앱 기능이 비활성 |
| Roleplay | Workers `/roleplay` 준비됨 | 웹 UI, 스트리밍 소비, 대화 이력 저장 없음 |
| Diary to Quiz | 일기 저장 시 derived id만 기록 | 생성된 퀴즈 본문 저장, 다음날 복습 큐 연결 없음 |
| Story Difficulty | LLM 변환 호출 가능 | 생성 결과 캐시/사용자 선택 히스토리와 학습 난이도 반영 약함 |
| Shadowing | 타입과 통계 필드만 있음 | 녹음 UI, TTS 비교 재생, 녹음 통계 업데이트 없음 |
| Now 추천 | 현재 시간대와 미완료 강의만 단순 비교 | 시간대 불일치 페널티, 사용자 설정, SRS, 학습 패턴 반영 없음 |
| TTS 전환 제어 | `speak()`는 Promise를 반환하지만 대부분 await하지 않음 | TTS 종료 전 화면 전환/단계 전환 방지 필요 |
| Memory Map | 4열 정사각형, `text-[10px]` | 모바일에서 글자가 작고 카드 정보량이 부족함 |
| 자기개선 | 통계 수집은 있음 | 학습 패턴 분석, 추천/복습/콘텐츠 난이도/UI 작업흐름 자동 조정 없음 |
| 콘텐츠 강화 | 30일 스토리와 phrase는 풍부함 | 약점 기반 재조합, Day 22-30 시나리오, 보스 퀴즈, 역할극 콘텐츠 부족 |
| 알림 | 설정 필드만 존재 | 알림 권한, 복습 due 안내, 앱 오픈 시 알림 로직 없음 |

---

## 2. 기능개선 목표

### P0 목표

- 첫 화면 추천이 현재 시간, 사용자 설정, 복습 필요도, 최근 학습 패턴에 맞게 동작한다.
- 학습 중 TTS가 재생 중이면 주요 화면 전환과 단계 전환은 TTS 종료 후 실행된다.
- Memory Map 카드가 스마트폰에서 충분히 읽히는 크기와 정보 구조를 가진다.

### P1 목표

- 사용자의 학습 패턴을 로컬에서 분석해 앱 전반의 추천, 복습, 난이도, 콘텐츠 순서에 반영한다.
- 앱의 안정성과 정체성을 유지하는 범위 안에서 UI와 작업흐름도 자동 조정한다.
- LLM 기능을 실제 학습 루프에 연결한다. 특히 작문 채점, 일기 기반 퀴즈, 역할극, 스토리 난이도 변환을 앱에서 자연스럽게 쓸 수 있어야 한다.

### P2 목표

- 학습효과를 높이기 위한 콘텐츠 보강 체계를 만든다. 약점 표현 재등장, 상황별 변형 문장, 보스 퀴즈, 쉐도잉, 주간 회고를 포함한다.

---

## 3. 개선 1: 첫 화면 Now 추천 알고리즘

### 3.1 현재 문제

현재 `web/src/lib/pocket.ts`의 `pickNow(completedLessonIds)`는 다음 규칙에 가깝다.

- 현재 시간대 `currentTimeBand()`를 가져온다.
- 미완료 Lesson 중 `lesson.coords.times`가 현재 시간대와 일치하는 첫 강을 고른다.
- 없으면 가장 앞의 미완료 강을 고른다.

이 방식은 밤 시간에 아침 기상 자료가 노출되는 식의 어색한 추천을 만들 수 있다. 특히 미완료 순서가 강하게 작동해 "지금 학습하기 좋은 자료"보다 "아직 안 한 첫 자료"가 우선될 수 있다.

### 3.2 설계 원칙

- `Now` 추천은 "다음 커리큘럼"이 아니라 "지금 이 순간에 할 만한 학습"이어야 한다.
- 현재 시간대와 맞지 않는 강의는 강한 페널티를 받는다.
- SRS due가 있으면 짧은 복습이 우선될 수 있다.
- 사용자의 일일 목표 시간이 짧을수록 `quick` 또는 `audio-only` 모드를 우선한다.
- 사용자가 자주 성공한 시간대/모드와 자주 이탈한 시간대/모드를 반영한다.
- 추천 이유를 UI에 표시할 수 있도록 결과 객체에 `reasons`를 포함한다.

### 3.3 입력 데이터

`pickNow`는 다음 입력을 받는 순수 함수로 확장한다.

```ts
interface PickNowInput {
  now: Date;
  completedLessonIds: Set<string>;
  lessonProgress: UserState["lessonProgress"];
  srs: UserState["srs"];
  quizAttempts: UserState["quizAttempts"];
  storyProgress: UserState["storyProgress"];
  prefs: UserState["prefs"];
  learnerProfile?: LearnerProfile;
  recentDismissedSuggestionIds?: string[];
  explicitContext?: {
    place?: PlaceTag;
    situation?: SituationTag;
    availableMinutes?: number;
    mode?: "quick" | "full" | "audio-only";
  };
}
```

### 3.4 출력 데이터

```ts
interface NowSuggestion {
  id: string;
  type: "lesson" | "review" | "story" | "roleplay";
  lesson?: Lesson;
  storyId?: string;
  label: string;
  band: TimeBand;
  modeHint: "quick" | "full" | "audio-only";
  durationMin: number;
  score: number;
  reasons: string[];
  warnings?: string[];
}
```

### 3.5 시간대 적합도

시간대는 인접 시간대까지만 완화한다.

| 현재 시간대 | 강한 일치 | 약한 일치 | 강한 페널티 |
|---|---|---|---|
| dawn | dawn, morning | night | midday, afternoon, evening |
| morning | morning | dawn, midday | evening, night |
| midday | midday, afternoon | morning | night |
| afternoon | afternoon, midday | evening | dawn, night |
| evening | evening | afternoon, night | morning |
| night | night | evening, dawn | morning, midday |

밤(`night`)에 `morning` 전용 강의는 기본적으로 Now 후보에서 제외한다. 단 모든 후보가 고갈된 경우에는 `지금 추천`이 아니라 `다음에 이어갈 강의`로 라벨을 바꾼다.

### 3.6 점수 계산

```ts
score =
  timeScore
  + dueReviewScore
  + progressionScore
  + goalFitScore
  + profileScore
  + freshnessScore
  + explicitContextScore
  - mismatchPenalty
  - fatiguePenalty
```

권장 가중치:

| 항목 | 점수 |
|---|---:|
| 현재 시간대 강한 일치 | +40 |
| 현재 시간대 약한 일치 | +15 |
| 현재 시간대 강한 불일치 | -60 |
| due SRS 1개 이상 | +35 |
| due SRS 5개 이상 | +50 |
| 미완료 강의 | +20 |
| 마지막 본 강의 이어하기 | +15 |
| 일일 목표 3~5분에 맞는 quick/audio | +15 |
| 사용자가 같은 시간대에 성공률 높음 | +10 |
| 최근 3회 추천에서 같은 자료 반복 | -20 |
| 사용자가 추천을 닫거나 무시함 | -25 |
| 밤 시간에 고인지 부하 Produce/Full 추천 | -20 |

### 3.7 모드 선택

| 조건 | 추천 모드 |
|---|---|
| due SRS가 있고 목표 시간이 3~5분 | `review` + `quick` |
| 밤, 취침/정리 관련 자료 존재 | `lesson` 또는 `story` + `audio-only` |
| 출근/이동 시간대 | `review` 또는 `absorb` 중심 `quick` |
| 오전/오후 집중 시간 | `lesson` + `full` |
| 사용자가 최근 Produce 단계에서 자주 이탈 | `absorb` 또는 `review` 우선 |

### 3.8 UI 요구사항

- `NowCard`는 추천 타입과 이유를 보여준다.
- 예시: `밤이라 가볍게 듣기`, `복습 4개 대기`, `최근 어려웠던 표현 재등장`.
- `1분만` 버튼은 항상 Review로 고정하지 말고 추천 결과가 `review`일 때 기본 CTA가 된다.
- 추천이 시간대와 맞지 않으면 `지금 추천` 문구를 쓰지 않는다. 이 경우 `다음 강의` 또는 `이어서 하기`로 표시한다.

### 3.9 구현 파일

- `web/src/lib/pocket.ts`: 점수 기반 추천 함수로 교체.
- `web/src/components/NowCard.tsx`: 추천 타입, 이유, CTA 분기 반영.
- `web/src/components/DailyStoryCard.tsx`: `pickNow` 결과를 재사용하되 Story 전용 추천도 지원.
- `web/src/lib/store.ts`: 추천 피드백과 사용자 패턴 필드 추가.
- `src/types/schema.ts`: `LearnerProfile`, `RecommendationFeedback`, 확장 `PocketSession` 타입 추가.

### 3.10 검증 기준

- 23:00에 미완료 Day 1이 있어도 밤/취침/복습 후보가 있으면 Day 1 아침 기상 강의를 Now로 추천하지 않는다.
- 07:00에는 아침 루틴 후보가 우선된다.
- due SRS가 5개 이상이면 강의보다 1분 복습을 우선한다.
- 사용자가 밤에 `full` 레슨을 2회 연속 중도 이탈하면 밤 추천은 `audio-only` 또는 `quick`으로 완화된다.
- 추천 결과에는 사람이 읽을 수 있는 `reasons`가 최소 1개 이상 포함된다.

---

## 4. 개선 2: TTS 종료 후 화면 전환

### 4.1 현재 문제

`web/src/lib/tts.ts`의 `speak()`는 Promise를 반환하지만, 여러 화면에서 `speak()` 호출 후 바로 다음 동작이 가능하다. 예를 들어 Lesson의 Absorb/Produce, Story의 듣기 버튼, Phrase 칩, Memory Map에서 TTS가 재생 중이어도 사용자가 화면 전환 버튼을 누르면 라우트나 단계가 바뀔 수 있다.

### 4.2 설계 원칙

- 학습 콘텐츠 내에서 발생하는 단계 전환과 화면 전환은 TTS 종료 후 실행한다.
- 사용자가 명시적으로 앱을 떠나는 전역 네비게이션은 `stopSpeak()` 후 이동을 허용할 수 있다.
- TTS 중에는 CTA 상태가 보이도록 버튼에 `읽는 중...` 또는 disabled 상태를 제공한다.
- 브라우저 TTS가 `onend`를 보내지 않는 경우를 대비해 안전 타임아웃을 둔다.

### 4.3 TTS 컨트롤러

`web/src/lib/tts.ts`를 단순 함수 모음에서 상태 추적 가능한 컨트롤러로 확장한다.

```ts
interface TtsState {
  speaking: boolean;
  currentText?: string;
  startedAt?: number;
}

function speak(text, opts): Promise<void>
function stopSpeak(): void
function isSpeaking(): boolean
function waitForTtsIdle(opts?: { timeoutMs?: number }): Promise<void>
```

### 4.4 라우트/단계 전환 헬퍼

새 훅을 추가한다.

```ts
function useTtsAwareNavigation() {
  return {
    navigateAfterTts(to),
    runAfterTts(fn),
    cancelAndNavigate(to)
  };
}
```

적용 기준:

- Lesson 내부 `next()`, `nextCard()`, `nextStep()`, `Read`의 Story 이동은 `runAfterTts` 또는 `navigateAfterTts` 사용.
- Story의 뒤로가기, 이해 퀴즈 시작, 완료 이동은 TTS 대기.
- Review/QuizPlayer에서 문제 음성 재생 중 다음 문제로 넘어가는 경우도 대기.
- Memory Map에서 카드 TTS 재생 중 다른 카드 탭은 기존 음성을 취소하고 새 카드 음성을 재생한다. 라우트 이동 버튼은 대기한다.

### 4.5 UI 상태

- TTS 중 화면 전환 버튼은 disabled 처리하거나 클릭 시 대기 상태를 보여준다.
- 장문 Story TTS는 별도 `정지` 버튼을 제공한다.
- 사용자가 `정지`를 누르면 즉시 `stopSpeak()` 하고 전환 대기 상태를 해제한다.

### 4.6 검증 기준

- Story 본문 TTS 재생 중 `이해 퀴즈`를 누르면 TTS가 끝난 뒤 퀴즈가 열린다.
- Lesson 예문 TTS 재생 중 `다음`을 누르면 TTS 종료 후 다음 카드/단계로 넘어간다.
- 브라우저가 `speechSynthesis.onend`를 누락해도 지정 타임아웃 후 UI가 잠기지 않는다.
- 전역 하단바 이동은 TTS를 정지하고 이동한다는 정책이 일관되게 적용된다.

---

## 5. 개선 3: Memory Map 모바일 가독성

### 5.1 현재 문제

`web/src/routes/MemoryMap.tsx`는 모바일에서도 4열 정사각형 그리드와 `text-[10px]`를 사용한다. 실제 스마트폰에서는 phrase 텍스트가 작고, 영어 표현의 핵심을 읽기 어렵다.

### 5.2 UI 요구사항

- 기본 모바일 레이아웃은 2열 또는 3열을 사용한다.
- 카드 최소 높이는 92px 이상, 권장 104px.
- 영어 표현은 최소 14px 이상, 권장 `text-sm` 또는 `text-base`.
- 한국어 뜻 또는 기억 상태를 작은 보조 텍스트로 표시한다.
- 기억 강도는 배경색뿐 아니라 테두리/라벨로도 구분한다.
- 긴 표현은 줄바꿈 2줄까지 허용하고, 카드 내부에서 전문적으로 보이도록 line-height를 조정한다.

### 5.3 카드 정보 구조

```text
[영어 표현]
[한국어 뜻 또는 상황]
[기억 상태: 흐림 / 보통 / 선명]
```

권장 상태:

- `흐림`: strength < 0.35
- `보통`: 0.35 <= strength < 0.7
- `선명`: strength >= 0.7

### 5.4 구현 파일

- `web/src/routes/MemoryMap.tsx`: 그리드와 카드 UI 수정.
- `web/src/lib/srs.ts`: `memoryStrength` 기준을 유지하되 라벨 helper 추가 가능.
- `web/src/index.css`: 필요 시 `.memory-card` 또는 container query 보조 스타일 추가.

### 5.5 검증 기준

- iPhone SE 폭 375px에서 카드 영어 표현이 14px 이상으로 보인다.
- 100개 이상의 Phrase가 있어도 스크롤 성능이 유지된다.
- 카드 탭 TTS와 `/review?n=10` 이동이 충돌하지 않는다.

---

## 6. 개선 4: 사용자 학습 패턴 기반 자기개선

### 6.1 목적

사용자의 학습 행동을 로컬에서 분석해 앱이 점점 더 잘 맞춰지도록 한다. 이 기능은 "사용자가 뭘 틀렸는지"뿐 아니라 "언제, 어떤 방식으로 학습하면 잘 되는지"를 앱 구성과 콘텐츠에 반영한다.

### 6.2 개인정보 원칙

- 기본 분석은 브라우저 로컬에서만 수행한다.
- LLM으로 요약/코칭을 보내는 기능은 사용자가 명시적으로 켠 경우에만 동작한다.
- 일기 원문은 기본적으로 외부 전송하지 않는다. LLM 퀴즈 생성 버튼을 누른 경우에만 전송한다.

### 6.3 수집 신호

```ts
type LearningSignalType =
  | "lesson_start"
  | "lesson_complete"
  | "step_enter"
  | "step_exit"
  | "quiz_answer"
  | "tts_play"
  | "story_read"
  | "journal_add"
  | "recommendation_shown"
  | "recommendation_clicked"
  | "recommendation_dismissed";
```

각 신호에는 다음 필드를 가진다.

```ts
interface LearningSignal {
  id: string;
  type: LearningSignalType;
  at: string;
  timeBand: TimeBand;
  lessonId?: string;
  phraseId?: string;
  quizId?: string;
  step?: "understand" | "absorb" | "read" | "produce" | "imprint";
  result?: "success" | "skip" | "wrong" | "correct" | "abandon";
  durationMs?: number;
  metadata?: Record<string, string | number | boolean>;
}
```

### 6.4 Learner Profile

```ts
interface LearnerProfile {
  updatedAt: string;
  preferredTimeBands: TimeBand[];
  weakPhraseIds: string[];
  weakTags: string[];
  strongTags: string[];
  bestModes: ("understand" | "absorb" | "read" | "produce" | "imprint")[];
  fragileModes: ("understand" | "absorb" | "read" | "produce" | "imprint")[];
  averageSessionSecondsByBand: Partial<Record<TimeBand, number>>;
  recommendationAffinity: Partial<Record<TimeBand, "quick" | "full" | "audio-only">>;
}
```

### 6.5 자기개선 적용 위치

| 적용 위치 | 반영 내용 |
|---|---|
| Home NowCard | 선호 시간대, 최근 성공 모드, 약점 표현, SRS due 반영 |
| Review | 약점 phrase/tag를 섞고, 최근 오답을 과도하게 반복하지 않도록 간격 조정 |
| Lesson | 사용자가 취약한 step에 보조 힌트/예문 추가 |
| Story | 사용자의 독해 성공률에 따라 기본 난이도 선택 |
| Journal | 자주 쓰는 표현과 목표 표현 간 차이를 피드백 |
| Toolbelt | 주간 학습 리포트와 추천 조정 상태 표시 |
| UI/Flow | 사용자의 행동 패턴에 따라 화면 밀도, CTA 순서, 기본 모드, 보조 힌트 노출을 안전한 범위에서 조정 |

### 6.6 로컬 분석 규칙

- 최근 14일 데이터를 우선한다.
- 오답률 40% 이상 또는 평균 recall 5초 이상이면 약점으로 분류한다.
- 특정 시간대 완주율이 60% 미만이면 그 시간대에는 더 짧은 세션을 추천한다.
- 사용자가 `produce` 단계에서 자주 이탈하면 다음 3회 추천에는 `absorb` 또는 `imprint`를 먼저 제안한다.
- Story 이해 퀴즈 점수가 2/3 미만이면 다음 Story 기본 난이도를 `easy`로 낮춘다.

### 6.7 UI/작업흐름 자동 변경

자기개선은 콘텐츠 추천뿐 아니라 화면 구성과 작업흐름에도 반영한다. 단, 이 기능은 앱의 안정성과 정체성을 해치지 않는 "가드레일 안의 적응형 UI"로 제한한다.

#### 6.7.1 허용 범위

| 변경 영역 | 허용되는 자동 변경 | 예시 |
|---|---|---|
| Home | 카드 노출 순서와 기본 CTA 변경 | 밤에는 `듣기/복습` CTA 우선, 아침에는 `회로 시작` 우선 |
| Lesson | step별 보조 힌트 노출량 조정 | Produce 이탈이 많으면 예문 힌트를 먼저 표시 |
| Review | 퀴즈 타입 비중 조정 | translation 오답이 많으면 arrange/fill로 워밍업 후 translation 출제 |
| Story | 기본 난이도와 TTS 버튼 위치 조정 | 독해 점수가 낮으면 `easy` 기본, 듣기 버튼을 상단에 노출 |
| Memory Map | 정렬/필터 기본값 변경 | 약점 표현 우선, 최근 흐려진 표현 우선 |
| Toolbelt | 개인 리포트 섹션 노출 | 일주일 데이터가 쌓이면 리포트 카드 표시 |

#### 6.7.2 금지 범위

- 주요 라우트 구조를 자동으로 삭제하거나 숨기지 않는다.
- 하단바의 핵심 목적지와 명칭은 자동 변경하지 않는다.
- 브랜드명, 색상 토큰, 핵심 학습 모델명, 5축 구조는 자동 변경하지 않는다.
- 사용자의 학습 데이터를 바탕으로 검증되지 않은 LLM 생성 UI 코드를 런타임에 실행하지 않는다.
- 결제, 데이터 삭제, 외부 전송, 권한 요청 같은 민감 동작의 위치나 의미를 자동 변경하지 않는다.
- 접근성 기준을 떨어뜨리는 변경은 허용하지 않는다. 텍스트 크기, 대비, 터치 타깃은 최소 기준을 유지한다.

#### 6.7.3 변경 레벨

```ts
type AdaptiveUiLevel = "off" | "safe" | "suggested" | "experimental";
```

| 레벨 | 동작 |
|---|---|
| `off` | UI/flow 자동 변경 없음. 추천과 복습만 개인화 |
| `safe` | CTA 순서, 기본 탭, 난이도 기본값, 힌트 노출 같은 저위험 변경 자동 적용 |
| `suggested` | 사용자가 승인한 뒤 화면 밀도, 섹션 순서, Review 구성 변경 적용 |
| `experimental` | 명시적 opt-in 사용자에게만 A/B 후보 UI를 제한적으로 적용 |

기본값은 `safe`다. `experimental`은 개발/테스트 플래그로 시작하고, 일반 사용자 기본값으로 두지 않는다.

#### 6.7.4 Adaptive UI Patch 모델

UI 변경은 코드 생성이 아니라 미리 정의한 슬롯과 변형값을 조합하는 방식으로 저장한다.

```ts
interface AdaptiveUiPatch {
  id: string;
  createdAt: string;
  source: "local" | "llm";
  status: "candidate" | "active" | "rejected" | "expired";
  surface: "home" | "lesson" | "review" | "story" | "memory-map" | "toolbelt";
  changeType:
    | "reorder_sections"
    | "change_default_mode"
    | "adjust_density"
    | "show_hint"
    | "hide_optional_section"
    | "change_cta_priority"
    | "change_default_filter";
  reason: string;
  evidence: {
    signals: number;
    windowDays: number;
    metric: string;
    before?: number;
    afterTarget?: number;
  };
  payload: Record<string, string | number | boolean | string[]>;
  expiresAt?: string;
}
```

#### 6.7.5 안정성 가드레일

- 변경은 `AdaptiveUiPatch`로 기록하고 언제든 되돌릴 수 있어야 한다.
- 자동 적용 전 최소 신호 수를 요구한다. 권장값: 같은 패턴 5회 이상 또는 7일 이상 데이터.
- 한 화면에 동시에 적용되는 active patch는 최대 3개로 제한한다.
- patch에는 만료일을 둔다. 권장값: 14일.
- 사용자가 수동으로 원래 보기로 되돌리면 같은 patch는 최소 14일간 재적용하지 않는다.
- LLM이 제안한 patch는 `candidate`로 저장하고, `safe` 레벨에서는 자동 적용하지 않는다.
- 모든 변경은 Toolbelt의 "맞춤화 기록"에서 이유와 되돌리기 버튼을 제공한다.

#### 6.7.6 사용자 경험 흐름

1. 앱이 학습 신호를 로컬에 쌓는다.
2. `adaptive-profile`이 매 세션 종료 또는 앱 시작 시 프로필을 갱신한다.
3. `adaptive-ui`가 허용된 변경 후보를 만든다.
4. `safe` 변경은 바로 적용하고, `suggested` 변경은 Toolbelt 또는 Home에서 제안 카드로 보여준다.
5. 사용자가 불편함을 표시하거나 되돌리면 해당 변경은 `rejected`로 기록된다.
6. 14일 뒤에도 효과가 좋으면 같은 방향의 기본값을 유지한다.

#### 6.7.7 효과 측정

변경별로 다음 지표를 본다.

- 추천 클릭률.
- 레슨 완주율.
- step별 이탈률.
- Review 정답률.
- Story 이해 퀴즈 점수.
- TTS 재생 완료율.
- 사용자의 되돌리기/거부 비율.

자동 UI 변경은 지표를 개선하지 못하면 만료 후 제거한다.

### 6.8 LLM 기반 코칭

LLM이 연결된 경우 주간 리포트를 자연어로 생성한다.

입력:

- 집계된 약점 태그, 약점 표현 id, 학습 시간대, step별 완주율.
- 일기 원문은 제외하고, 사용자가 허용한 경우에만 포함한다.

출력:

- 이번 주 강점 1개.
- 다음 주 집중 표현 3개.
- 추천 루틴 1개.
- UI/작업흐름 조정 제안 1개. 단, 앱이 실행 가능한 `AdaptiveUiPatch` 후보 형태로만 받는다.
- 짧은 격려 문장 1개.

### 6.9 구현 파일

- `src/types/schema.ts`: `LearningSignal`, `LearnerProfile`, `RecommendationFeedback` 타입 추가.
- `src/types/schema.ts`: `AdaptiveUiPatch`, `AdaptiveUiLevel` 타입 추가.
- `web/src/lib/store.ts`: 신호 저장, 프로필 저장, 추천 피드백, adaptive UI patch 액션 추가.
- `web/src/lib/adaptive-profile.ts`: 로컬 프로필 계산.
- `web/src/lib/adaptive-ui.ts`: 안전한 UI/flow 변경 후보 생성과 적용 여부 판단.
- `web/src/lib/pocket.ts`: `LearnerProfile` 점수 반영.
- `web/src/routes/Toolbelt.tsx`: 학습 패턴 리포트와 맞춤화 기록/되돌리기 섹션 추가.
- `web/src/components/AdaptiveSlot.tsx`: Home/Lesson/Review/Story에서 허용된 슬롯 변형만 적용.
- `web/src/lib/llm.ts`: `summarizeLearningPattern()` 추가.
- `server/workers/src/index.ts`: `/learning-coach` 엔드포인트 추가.

### 6.10 검증 기준

- 학습 데이터가 0개일 때는 기존 기본 추천이 안정적으로 동작한다.
- 5개 이상의 오답 기록이 쌓이면 Review에 약점 표현이 우선 반영된다.
- 사용자가 특정 추천을 반복적으로 무시하면 같은 추천의 노출 점수가 낮아진다.
- LLM이 꺼져 있어도 로컬 자기개선은 동작한다.
- `safe` 레벨에서 적용되는 UI 변경은 사전에 정의한 슬롯/변형값만 사용한다.
- 사용자가 맞춤화 변경을 되돌리면 같은 patch가 즉시 재적용되지 않는다.
- 하단바, 5축 구조, 브랜드 토큰, 데이터 삭제/외부 전송 UI는 자동 변경되지 않는다.
- adaptive UI patch를 모두 비활성화해도 앱은 기본 레이아웃으로 정상 동작한다.

---

## 7. 개선 5: 학습효과를 높이는 콘텐츠 강화

### 7.1 콘텐츠 강화 원칙

- 같은 표현을 카드, 듣기, 독해, 출력, 복습에서 다른 형태로 다시 만나게 한다.
- 오답 표현은 단순 반복이 아니라 상황을 바꿔 재등장시킨다.
- 사용자가 실제로 말하거나 쓸 수 있는 산출 활동을 늘린다.
- 난이도는 자동으로 높아지되, 실패가 누적되면 다시 낮춘다.

### 7.2 강화 항목

| 항목 | 설명 | 우선순위 |
|---|---|---|
| Weak Phrase Remix | 약점 표현을 새 상황/시간대 예문으로 재생성 | P1 |
| Day 22-30 Scenario | 현재 비어있는 고급 패턴 누적 작문 시나리오 보강 | P1 |
| Stage Boss Quiz | Stage 4-5 포함 종합 퀴즈 추가 | P2 |
| Shadowing Mode | TTS 듣기, 녹음, 비교 재생, 자기평가 | P1 |
| Roleplay Mode | 상황별 대화 스트리밍 UI와 목표 표현 사용 체크 | P1 |
| Retrieval Warm-up | 레슨 시작 전 최근 약점 2개 회상 | P2 |
| Story Follow-up | Story 읽은 뒤 표현 3개를 내 문장으로 바꾸기 | P2 |
| Weekly Review | 7일 단위 리포트와 보스형 복습 | P2 |

### 7.3 LLM 활용 콘텐츠

LLM은 "정답 생성기"가 아니라 개인화 보조 도구로 제한한다.

| 기능 | LLM 사용 | 로컬 폴백 |
|---|---|---|
| 작문 채점 | `/grade` | 저장만 하고 기본 힌트 표시 |
| 일기 → 빈칸 퀴즈 | `/diary-to-quiz` | 일기만 저장 |
| Story 난이도 변환 | `/story-difficulty` | 기존 시드 본문 사용 |
| 역할극 | `/roleplay` | 정적 시나리오 step 사용 |
| 약점 표현 예문 생성 | 신규 `/remix-phrase` 또는 `/learning-coach` | 기존 examples 재사용 |

### 7.4 퀴즈 강화 규칙

- 한 Lesson의 최종 퀴즈는 최소 6문항을 유지한다.
- 약점 표현은 24시간 안에 같은 정답을 그대로 묻지 않고, 유형을 바꿔 재출제한다.
- `translation`과 `word_arrange`는 acceptable answers를 넓혀 불필요한 오답을 줄인다.
- `situation_match`는 현재 시간대/장소와 맞는 distractor를 포함한다.

### 7.5 콘텐츠 품질 기준

- 한국어 설명은 "문법 용어 먼저"가 아니라 "상황 먼저, 문법은 뒤에서 정리"를 원칙으로 한다.
- 예문은 하루 루틴 안에서 자연스럽게 이어져야 한다.
- LLM 생성 콘텐츠는 저장 전 JSON schema 검증을 통과해야 한다.
- 사용자의 일기에서 생성된 퀴즈는 개인 데이터로 취급하고 export/reset 대상에 포함한다.

---

## 8. 구현 로드맵

### Milestone 1: 추천과 TTS 안정화

작업:

- `pickNow`를 점수 기반 추천으로 교체.
- `NowCard`에 추천 이유와 타입별 CTA 반영.
- TTS 컨트롤러와 `useTtsAwareNavigation` 추가.
- Lesson, Story, Review, Memory Map의 화면 전환을 TTS-aware로 수정.
- Memory Map 모바일 UI 개선.

완료 기준:

- 시간대별 추천 수동 테스트 통과.
- TTS 중 전환 테스트 통과.
- 모바일 폭 375px Memory Map 스크린샷에서 텍스트가 읽힌다.

### Milestone 2: 자기개선 로컬 루프

작업:

- `LearningSignal` 수집 추가.
- `LearnerProfile` 계산기 작성.
- Now/Review/Story에 프로필 반영.
- Adaptive UI patch 모델과 `safe` 레벨 적용기 작성.
- Toolbelt에 학습 패턴 리포트와 맞춤화 기록/되돌리기 추가.

완료 기준:

- LLM 없이도 추천이 사용자의 이탈/성공 패턴에 따라 달라진다.
- Home/Lesson/Review/Story 중 최소 2개 화면에서 사전 정의된 UI/flow 변형이 안전하게 적용된다.
- 사용자가 adaptive UI 변경을 되돌릴 수 있다.
- reset/export에 새 데이터가 포함된다.

### Milestone 3: LLM 기능 완성

작업:

- LLM 프록시 배포 및 `.env` 설정 검증.
- `/roleplay` 스트리밍 UI 구현.
- `/diary-to-quiz` 결과를 실제 Review 큐에 연결.
- `/learning-coach` 또는 `/remix-phrase` 엔드포인트 추가.

완료 기준:

- Toolbelt 헬스 체크와 AI 호출 테스트 성공.
- 일기 작성 후 다음날 파생 퀴즈가 Review에서 출제된다.
- 역할극에서 목표 표현 사용 여부가 기록된다.

### Milestone 4: 콘텐츠 강화

작업:

- Day 22-30 시나리오 추가.
- Stage 4-5 보스 퀴즈 추가.
- Shadowing UI 구현.
- Weak Phrase Remix 도입.
- 주간 회고 콘텐츠 추가.

완료 기준:

- Stage 1-5 모두 종합 복습 루프가 있다.
- 약점 표현이 다른 상황/형태로 재등장한다.
- 쉐도잉 녹음 수가 통계에 반영된다.

---

## 9. 테스트 계획

### 9.1 단위 테스트

- `pickNow`: 시간대, SRS due, 목표 시간, 프로필 가중치 테스트.
- `tts`: `speak`, `stopSpeak`, `waitForTtsIdle`의 Promise 정리 테스트.
- `adaptive-profile`: 신호 데이터에서 weak tags, preferred bands 계산 테스트.
- `adaptive-ui`: patch 생성, 적용 제한, 만료, 거부 후 재적용 차단 테스트.
- `srs`: 기존 SRS 회귀 테스트 유지.

### 9.2 통합 테스트

- Home에서 시간대를 mock해 추천 카드가 달라지는지 확인.
- Lesson에서 TTS 재생 중 다음 버튼 클릭 시 전환이 지연되는지 확인.
- Story에서 장문 TTS 중 퀴즈 시작이 지연되는지 확인.
- adaptive UI patch 적용 후에도 하단바, 5축, 민감 작업 UI가 바뀌지 않는지 확인.
- Journal에서 LLM 생성 퀴즈가 저장되고 Review로 이어지는지 확인.

### 9.3 수동 QA

- iPhone SE 375px, iPhone 14 390px, Android 412px 폭에서 Memory Map 확인.
- iOS Safari에서 TTS 첫 탭 후 재생/종료 이벤트 확인.
- GitHub Pages 배포 환경에서 HashRouter 라우팅 확인.
- LLM 프록시 미설정/설정/장애 상태 각각 확인.

---

## 10. 우선순위 요약

| 우선순위 | 작업 | 이유 |
|---|---|---|
| P0 | Now 추천 점수화 | 첫 화면 체감 품질에 직접 영향 |
| P0 | TTS-aware 전환 | 학습 흐름 깨짐과 음성 중단 문제 해결 |
| P0 | Memory Map 모바일 가독성 | 스마트폰 사용성 개선 |
| P1 | 로컬 자기개선 루프 | 앱이 사용자에게 맞춰지는 핵심 기반 |
| P1 | Adaptive UI/Flow | 안정성과 정체성 범위 안에서 화면과 작업흐름을 개인화 |
| P1 | LLM 실제 연결 | 비전상 핵심이나 환경 설정 의존 |
| P1 | Roleplay/Diary Quiz/Shadowing | 출력 훈련 강화 |
| P2 | 보스 퀴즈/주간 회고/콘텐츠 리믹스 | 장기 학습효과 강화 |

---

## 11. 작업 시작 순서

1. `web/src/lib/pocket.ts`에 순수 추천 스코어러를 먼저 만든다.
2. `web/src/lib/tts.ts`에 TTS 상태와 대기 함수를 추가한다.
3. `NowCard`, `Lesson`, `Story`, `Review`, `MemoryMap`을 작은 단위로 연결한다.
4. `MemoryMap` UI를 모바일 기준으로 조정한다.
5. 위 P0 작업에 테스트를 붙이고 빌드한다.
6. 그 다음 `LearningSignal`과 `LearnerProfile`로 자기개선 루프를 시작한다.
7. adaptive UI는 `safe` 레벨의 사전 정의 슬롯부터 적용하고, Toolbelt 되돌리기 UI를 먼저 제공한다.
