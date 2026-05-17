# Stage 1/2/3 커리큘럼 확장 검토 및 개발 명세

작성일: 2026-05-17  
기준 프로젝트: `/Users/spacenulmaru/Projects/projects/sulsul-plus`  
현재 배포: `https://nulmaru.github.io/tt_sul/`  
기준 커밋: `df3831d Expand journal correction preview`

## 0. 구현 시작 기록

2026-05-17에 1차 구현을 시작했다.

| 영역 | 반영 내용 |
|---|---|
| Course Stage | `beginner`, `intermediate`, `advanced` 상위 과정 메타 추가 |
| 자율 선택 | Stage 화면에서 초급/중급/상급을 잠금 없이 선택 가능하게 변경 |
| 레벨테스트 | `placement-map` 레벨 탐험전 추가 |
| 승급 미션 | 초급→중급, 중급→상급 미션 blueprint 추가 |
| 시험 기록 | 시험 시도 결과, 점수, 통과 여부, 추천 레벨, 섹션별 피드백 저장 |
| 낙서장 인사이트 | 낙서장 텍스트에서 선호 주제, 생활 패턴, 오류율, 추천 레벨 산출 |
| Google Docs 자료 | 원문 저장 없이 구조와 주제만 참고하는 원칙 유지 |

승급 미션은 같은 섹션 구성으로 반복되지만, 매 시험마다 랜덤 시드로 표현/스토리/응답 문제가 달라지도록 구현했다. 결과는 학습을 막는 잠금 장치가 아니라 레벨 확인과 피드백 기록으로만 사용한다.

2026-05-17 추가 구현:

| 영역 | 반영 내용 |
|---|---|
| Stage 2 대화 모델 | `DialogueLesson`, `DialogueTurn`, `DialoguePracticeMode` 타입 추가 |
| 중급 콘텐츠 | 앱용 신규 대화 seed 4개 추가. Google Docs 원문 미사용 |
| 암송 플레이어 | 전체 듣기, 끊어 읽기, 역할 A/B, 한글 힌트 모드 구현 |
| 기록 | 대화별 연습 횟수, 마지막 모드, 모드별 횟수, 완료 상태 저장 |
| 라우트 | `/dialogues`, `/dialogue/:id` 추가 |

## 1. 결론

현재 앱은 이미 30강, Phrase, Story, Quiz, Journal, Review, Content Lab, LLM 작문검사, 오답노트까지 갖춘 초급 생활영어 학습 루프가 있다. 따라서 다음 확장은 기존 구조를 갈아엎는 방식보다, 상위에 3개 과정 레벨을 얹는 방식이 안전하다.

권장 구조는 다음과 같다.

| 새 구조 | 역할 | 현재 구조와의 관계 |
|---|---|---|
| Stage 1 · 초급 과정 | 생활 동작, 짧은 문장, 기본 대화, 일기 한 문장 | 현재 30강 전체를 Stage 1로 편입 |
| Stage 2 · 중급 과정 | A/B 대화 암송, 역할별 말하기, 여행/사회/관계 상황 | Google Docs 대화 자료의 핵심 사용처 |
| Stage 3 · 상급 과정 | 토론, 긴 글, 뉴스/업무/사회 이슈, 발화 평가 | Google Docs 자료는 일부 브릿지로만 사용 |

현재 코드의 `stage-1`부터 `stage-5`는 난이도 Stage가 아니라 초급 30일 과정 내부 단원이다. 새 Stage 1/2/3과 이름이 충돌하므로, 구현 시에는 기존 `Stage`를 `Unit` 또는 `BeginnerUnit`으로 재해석하는 것이 좋다.

## 2. 현재 앱 구조 진단

현재 데이터 구조는 `src/types/schema.ts` 기준으로 다음 흐름을 갖는다.

| 영역 | 현재 상태 | 확장 관점 |
|---|---|---|
| Phrase | 159개 day 매핑 엔트리, Day 1-6 밀도 높음, Day 18-21/28-30 표현 부족 | 중급/상급에서는 `phrase`보다 `turn`, `dialogue`, `argument` 단위가 필요 |
| Lesson | 30개 모두 존재 | Stage 1 초급 과정으로 유지 가능 |
| Internal Stage | 5개, 30강을 7일 단위로 묶음 | 명칭을 Unit으로 바꾸는 것이 혼란이 적음 |
| Story | 30편, easy/natural/challenge + 이해 퀴즈 | Stage 2부터는 Story보다 Dialogue/Article이 필요 |
| Scenario | 12개, Day 1-8/10-12 위주 | Day 13-30 및 중급 대화형 시나리오 보강 필요 |
| Quiz | Phrase 기반 6종 자동 생성 | 중급은 역할 응답 퀴즈, 상급은 논지/근거/요약 퀴즈 필요 |
| Journal | 영어 문장 저장, 문장검사, 오답노트, 복습 연결 | 중급은 짧은 답변, 상급은 단락/스피치 평가로 확장 가능 |
| Review | SRS와 오답 복습 | 모든 Stage에 공통 적용 가능 |
| Content Lab | 약점 기반 생활 표현 제안 | 레벨별 콘텐츠 제안으로 확장 필요 |

현재 앱의 강점은 "짧게 자주 출력하는 생활영어 루프"다. 이 정체성은 유지해야 한다. 중급/상급을 붙일 때도 긴 강의형 앱이 아니라, 짧은 출력, 반복 암송, 역할 응답, 오답 자동 복습을 중심에 둬야 한다.

## 3. Google Docs 자료 검토

제공된 문서는 크게 두 종류의 콘텐츠로 나뉜다.

| 구분 | 내용 | 앱 반영 가치 |
|---|---|---|
| 학습법 서론/부록 활용법 | 암기와 암송의 차이, 실시간 대화, 끊어 읽기, 역할별 대화, 자투리 복습, 누적 암송 | 앱의 Stage 2/3 학습 루프 설계에 매우 적합 |
| 30개 대화 부록 | 자기소개, 날씨, 교통, 취미, 직업, 가족 대화, 여행, 공항, 호텔, 면세점 등 | Stage 2 중급 대화 과정에 가장 적합 |

중요한 제한이 있다. 문서 내용은 출판물에서 온 것으로 보이며, 원문 대화 전체를 앱에 그대로 넣는 것은 권리 확인 전에는 피해야 한다. 개발 명세에서는 이 자료를 "커리큘럼 설계 참고자료"로 사용하고, 실제 앱 콘텐츠는 직접 작성한 원문 또는 사용 권한이 확인된 콘텐츠로 구성해야 한다.

권리 확인 전 가능한 사용 방식은 다음과 같다.

| 가능 | 주의 필요 |
|---|---|
| 주제, 난이도, 학습법 구조 참고 | 대화 원문 전체 수록 |
| 비슷한 상황을 앱 정체성에 맞게 새로 집필 | 책의 문장 순서/표현을 거의 그대로 변형 |
| 암송 루프를 기능으로 구현 | 스캔/OCR 자료를 콘텐츠 seed로 저장 |
| 레슨 제목 수준의 분류 검토 | 출판물 본문을 공개 저장소에 커밋 |

## 4. Google Docs 자료의 Stage 편입 판정

### 4.1 Stage 1 · 초급 과정 편입 가능성

일부 자료는 초급에 포함할 수 있다. 다만 현재 앱의 초급은 "I wake up", "I check my emails" 같은 한 문장 생활 동작 중심이다. Google Docs의 대화는 초급 주제라도 문장 길이와 턴 수가 길어, 초급 본편보다 "초급 후반 대화 암송팩"에 가깝다.

초급 편입 후보:

| 과 | 주제 | 판정 |
|---|---|---|
| 1-2 | 자기소개, 간단한 목표 말하기 | 초급 후반 가능 |
| 3-4 | 날씨, 일기예보 | 초급 후반 가능 |
| 5 | 대중교통 | 초급 후반 가능 |
| 16 | 음식 주문 연습 | 초급 후반 또는 중급 초입 |
| 21 | 아침 루틴 | 현재 앱 Stage 1과 연결하기 좋음 |

권장 방식은 전체 대화를 한 번에 넣는 것이 아니라, 4-6턴 마이크로 대화로 쪼개고 핵심 표현을 Phrase 카드로 풀어내는 것이다.

### 4.2 Stage 2 · 중급 과정 편입 가능성

Google Docs 대화 자료는 Stage 2에 가장 잘 맞는다. 이유는 다음과 같다.

| 중급 목표 | 문서 자료와의 적합성 |
|---|---|
| 여러 문장을 이어 말하기 | A/B 대화 구조가 이미 있음 |
| 역할별 응답하기 | 한 화자의 말을 듣고 다른 화자로 답하는 훈련에 적합 |
| 상황별 기능어 학습 | 부탁, 추천, 길 안내, 흥정, 설명, 농담, 칭찬, 거절이 포함됨 |
| 암송 기반 출력 | 문서의 학습법 자체가 암송/출력 중심 |
| 자투리 복습 | 현재 앱의 1분복습, 오답노트와 잘 맞음 |

중급 핵심 편입 후보:

| 과 | 주제 | Stage 2 활용 |
|---|---|---|
| 6-10 | 직업, 취미, 운동, 여가 | 자기 설명과 취향 말하기 |
| 11-15 | 회화 연습, 부탁, 학습 대화 | 관계 속 요청/설명/칭찬 |
| 22-24 | 한국 음식, 길 안내, 공항 가는 길 | 실전 안내/추천 |
| 25-29 | 관광, 공항, 호텔, 길 묻기, 면세점 | 여행 실전 대화 |

Stage 2의 중심 콘텐츠는 `DialogueLesson`이 되어야 한다. 현재 `Lesson.cards`는 Phrase 중심이라 긴 대화 학습에는 부족하다. 따라서 Stage 2에서는 대화 턴, 역할, 한글 힌트, 암송 상태를 별도 모델로 두는 것이 좋다.

### 4.3 Stage 3 · 상급 과정 편입 가능성

Google Docs 자료만으로는 상급 과정을 구성하기 어렵다. 일부 주제는 상급 브릿지로 쓸 수 있지만, 본격 상급에는 논리 전개, 긴 글, 사회 이슈, 업무 발화, 평가 루브릭이 추가되어야 한다.

상급 브릿지 후보:

| 과 | 주제 | 활용 방식 |
|---|---|---|
| 8 | 전공과 철학 | 추상 주제 설명의 입문 |
| 17-20 | 가족 유머, 세대 차이, 트렌드 | 뉘앙스/농담/간접 표현 |
| 25 | 관광 안내 | 장소 설명을 긴 안내문으로 확장 |
| 28 | 길 묻기와 산책 경로 | 상세 안내, 묘사, 추천 스피치 |

상급 본편에는 별도 콘텐츠가 필요하다.

| 상급 모듈 | 필요한 콘텐츠 |
|---|---|
| Debate | 찬반 주장, 반박, 근거 제시 |
| News | 기사 요약, 핵심 쟁점, 의견 말하기 |
| Work | 회의 발언, 일정 조율, 피드백, 설득 |
| Society | 교육, 기술, 환경, 지역사회 이슈 |
| Long Form | 150-300단어 읽기, 60초 말하기, 1문단 작문 |
| Evaluation | 정확성, 유창성, 구조, 어휘 다양성, 발음/억양 평가 |

## 5. Stage별 콘텐츠 설계

### 5.1 Stage 1 · 초급 과정

목표는 "내 하루를 영어로 짧게 말한다"이다.

| 구성 | 설계 |
|---|---|
| Lesson | 기존 30강 유지 |
| Phrase | 생활 동작, 상태, 기본 패턴 |
| Story | 기존 Daily Story 30편 유지 |
| Quiz | 6종 자동 퀴즈 유지 |
| Journal | 한 문장 쓰기, 문장검사, 오답노트 유지 |
| Speaking | 듣고 따라하기, 받아쓰기, 짧은 쉐도잉 |
| Review | 오답 문장과 SRS 유지 |

보강할 점은 Day 18-30의 Phrase/Scenario 밀도다. 현재 Story는 30편이 있으나 일부 후반 Day의 Phrase 연결이 약하다.

### 5.2 Stage 2 · 중급 과정

목표는 "상황 안에서 6-10턴 대화를 암송하고 역할로 답한다"이다.

권장 모듈:

| Unit | 주제 | 기능 |
|---|---|---|
| Unit 1 | 자기소개와 스몰토크 | 소개, 목표, 취향 |
| Unit 2 | 날씨/교통/길 안내 | 정보 묻기, 설명하기 |
| Unit 3 | 음식/주문/추천 | 주문, 추천, 선호 |
| Unit 4 | 취미/운동/여가 | 경험, 습관, 제안 |
| Unit 5 | 관계/가족/학습 | 부탁, 농담, 설득, 반응 |
| Unit 6 | 여행/공항/호텔/쇼핑 | 실전 문제 해결 |

필요 기능:

| 기능 | 설명 |
|---|---|
| 실시간 대화 듣기 | 전체 A/B 대화를 자연 속도로 듣기 |
| 끊어 읽기 | 문장 단위로 듣고 따라 말하기 |
| 역할별 대화 | A를 듣고 B로 답하기, B를 듣고 A로 답하기 |
| 한글 힌트 암송 | 한국어 단서만 보고 영어 턴 복원 |
| 누적 암송 | 1과부터 현재 과까지 짧은 점검 |
| Dialogue Quiz | 다음 대사 고르기, 빈 대사 말하기, 역할 응답 |
| Short Journal | 대화 상황에 맞춰 2-4문장 답변 작성 |

Stage 2의 핵심 데이터는 `DialogueLesson` 또는 기존 `Lesson` 확장이다.

```ts
type CourseLevelId = "beginner" | "intermediate" | "advanced";

interface DialogueTurn {
  id: string;
  speaker: "A" | "B";
  en: string;
  ko: string;
  hintKo?: string;
  phraseIds?: string[];
  functionTags?: string[];
}

interface DialogueLesson {
  id: string;
  levelId: CourseLevelId;
  unitId: string;
  title: string;
  situation: string;
  turns: DialogueTurn[];
  targetFunctions: string[];
  recitationModes: ("realtime" | "pause-repeat" | "role-a" | "role-b" | "korean-hint")[];
}
```

### 5.3 Stage 3 · 상급 과정

목표는 "긴 입력을 이해하고, 내 의견을 구조화해서 말하고 쓴다"이다.

권장 모듈:

| Unit | 주제 | 산출물 |
|---|---|---|
| Unit 1 | Opinion Builder | 1분 의견 말하기 |
| Unit 2 | News Brief | 기사 요약 + 의견 |
| Unit 3 | Work Talk | 회의 발언, 피드백, 설득 |
| Unit 4 | Social Issues | 찬반 토론 |
| Unit 5 | Long Reading | 200단어 글 읽고 요약 |
| Unit 6 | Presentation | 2분 발표 스크립트 |

필요 기능:

| 기능 | 설명 |
|---|---|
| 긴 글 난이도 조절 | natural/challenge 외에 summary/keywords 생성 |
| 논지 구조 퀴즈 | 주장, 근거, 예시, 반론 식별 |
| Debate Prompt | 찬성/반대 선택 후 답변 생성 |
| Speech Recorder | 30-60초 발화 녹음 |
| LLM 평가 | 정확성, 유창성, 구조, 어휘, 자연스러움 점수 |
| Rewrite Coach | 더 자연스러운 표현, 더 강한 논리, 더 짧은 표현 제안 |

상급에서는 단순 정답 퀴즈보다 루브릭 기반 평가가 중요하다.

```ts
interface SpeakingAssessment {
  id: string;
  promptId: string;
  transcript?: string;
  scores: {
    accuracy: number;
    fluency: number;
    structure: number;
    vocabulary: number;
    pragmatics: number;
  };
  feedback: string;
  suggestedRewrite?: string;
}
```

## 6. 기존 앱 정체성 유지 원칙

확장 후에도 다음 원칙은 유지한다.

| 원칙 | 유지 방법 |
|---|---|
| 짬짬이 학습 | 모든 Stage에 1분/3분/10분 모드 제공 |
| 생활 맥락 | 장소, 상황, 시간 태그를 계속 사용 |
| 출력 중심 | 모든 레슨이 말하기/쓰기 산출물로 끝남 |
| 오답 자동 복습 | 작문/말하기 오류를 오답노트와 1분복습으로 연결 |
| 회로 학습 | 이해 → 흡수 → 읽기/듣기 → 출력 → 각인 유지 |
| 스토리성 | Stage 1은 Daily Story, Stage 2는 Dialogue, Stage 3은 Article/Debate로 확장 |

새로운 Stage 화면은 다음처럼 설계하는 것이 좋다.

| 화면 | 변경 방향 |
|---|---|
| `/axis/stage` | 초급/중급/상급 3개 Course Stage 선택 화면으로 변경 |
| 기존 Stage 트리 | `/axis/unit` 또는 Stage 1 내부 화면으로 이동 |
| Home NowCard | 사용자의 현재 Course Stage를 기준으로 추천 |
| Review | 모든 Stage의 due item을 통합하되, 필터 제공 |
| Journal | Stage 1 한 문장, Stage 2 짧은 응답, Stage 3 단락/스피치로 모드 분화 |

## 7. 단계별 개발 계획

### Phase 0 · 설계 확정

이번 문서가 Phase 0 산출물이다. 구현 전 결정해야 할 것은 두 가지다.

| 결정 | 권장안 |
|---|---|
| 기존 `stage-1..5` 명칭 | 초급 내부 Unit으로 재해석 |
| Google Docs 원문 사용 | 권리 확인 전 원문 저장 금지, 구조와 주제만 참고 |

### Phase 1 · 데이터 모델 확장

작업:

| 작업 | 파일 |
|---|---|
| `CourseLevelId` 추가 | `src/types/schema.ts` |
| 기존 `Stage`를 `Unit` 개념으로 감싸기 | `src/data/stages.seed.ts`, `src/data/taxonomy.ts` |
| Lesson에 `levelId` 추가 | `src/types/schema.ts`, seed 파일 |
| Course stage 메타 추가 | 신규 `src/data/course-levels.seed.ts` |

검증:

| 기준 |
|---|
| 기존 30강 링크가 깨지지 않는다 |
| 기존 학습 진행 데이터가 유지된다 |
| `/axis/stage`에서 초급이 기존 30강으로 진입한다 |

### Phase 2 · Stage 1 정리

작업:

| 작업 | 목적 |
|---|---|
| Day 18-30 Phrase 보강 | 후반 레슨 퀴즈 품질 향상 |
| Day 13-30 Scenario 보강 | 출력 단계 공백 제거 |
| Stage 1 졸업 체크 | 초급 완료 조건 명확화 |
| Google Docs 초급 후보를 직접 집필 버전으로 재작성 | 초급 후반 대화팩 준비 |

검증:

| 기준 |
|---|
| 모든 Day에 최소 5개 이상 핵심 Phrase |
| 모든 Day에 Produce 과제가 있음 |
| Stage 1 완료 후 중급 추천이 자연스럽게 노출 |

### Phase 3 · Stage 2 대화 암송 과정

작업:

| 작업 | 목적 |
|---|---|
| DialogueLesson 모델 추가 | A/B 대화 구조 저장 |
| Recitation Player 추가 | 실시간/끊어읽기/역할별 대화 |
| Korean Hint 모드 추가 | 암송 출력 강화 |
| Dialogue Quiz 추가 | 대화 흐름 기반 퀴즈 |
| Roleplay UI와 연결 | LLM 대화 연습 확장 |

검증:

| 기준 |
|---|
| 한 레슨에서 전체 듣기, 문장 따라하기, 역할 응답이 가능 |
| 한글 힌트만 보고 최소 일부 턴을 복원할 수 있음 |
| 틀린 대사/작문이 오답노트와 복습에 들어감 |

### Phase 4 · Stage 3 상급 과정

작업:

| 작업 | 목적 |
|---|---|
| Article/Debate 콘텐츠 모델 추가 | 긴 글과 논쟁형 주제 지원 |
| Speaking Assessment 추가 | 발화 평가 루프 |
| Advanced Quiz 추가 | 주장/근거/요약/반박 퀴즈 |
| News/Work/Society 콘텐츠팩 작성 | 상급 정체성 확립 |

검증:

| 기준 |
|---|
| 150-300단어 글을 읽고 요약 가능 |
| 30-60초 발화를 녹음하고 평가 가능 |
| LLM 평가 결과가 복습 항목으로 전환됨 |

### Phase 5 · Content Lab 확장

작업:

| 작업 | 목적 |
|---|---|
| 레벨별 콘텐츠 추천 | 초/중/상급에 맞는 보강 |
| 약점 유형 분류 | 문법, 어휘, 응답 속도, 논리 구조 |
| 생성 콘텐츠 검수 상태 | draft/approved/published |
| 출처/권리 상태 필드 | original/licensed/reference-only |

검증:

| 기준 |
|---|
| 권리 미확인 자료가 앱 seed에 섞이지 않는다 |
| LLM 생성물이 바로 공개 콘텐츠가 되지 않고 검수 단계를 거친다 |

## 8. 추천 우선순위

바로 다음 개발은 다음 순서가 좋다.

1. `CourseLevelId`와 Course Stage 메타를 추가한다.
2. 기존 Stage 1-5를 초급 내부 Unit으로 UI에서만 재명명한다.
3. Stage 1 후반의 Phrase/Scenario 공백을 먼저 메운다.
4. Stage 2용 `DialogueLesson` 모델과 Recitation Player를 만든다.
5. Google Docs 자료는 원문 저장 없이 주제/기능/난이도 참고표로만 사용한다.
6. Stage 3는 Google Docs 자료를 기다리지 말고 별도 상급 원칙으로 설계한다.

최종 판정은 다음과 같다.

| 질문 | 답 |
|---|---|
| Google Docs 자료를 초급에 넣을 수 있나? | 일부 가능. 단 초급 본편보다 초급 후반/대화 보강팩으로 적합 |
| 중급에 넣을 수 있나? | 매우 적합. Stage 2의 핵심 설계 자료로 사용할 수 있음 |
| 상급에 넣을 수 있나? | 일부 브릿지로 가능. 상급 본편은 별도 제작 필요 |
| 원문을 그대로 넣어도 되나? | 권리 확인 전에는 권장하지 않음 |
| 기존 앱 정체성과 맞나? | 암송, 출력, 자투리 복습 철학이 매우 잘 맞음 |
