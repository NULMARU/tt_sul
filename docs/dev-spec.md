# Sulsul + Tt 통합 학습 PWA — 개발명세 (Dev Spec)

> 최종 목표: tt(출력·시나리오)와 sulsul(이해 카드·SRS·다양 퀴즈)를 합쳐, **회로 학습 모델 + 5축 맥락 항해 + Daily Story + LLM 보조**를 갖춘 짬짬이 영어 학습 PWA.

---

## 1. 비전 한 줄
**"한 표현이 5축에 흩어져 있고, 매번 다른 모드로 다시 만난다."**

---

## 2. 아키텍처 개요

```
┌────────────────────────────────────────────────────────┐
│ Client — PWA  (Vite + React + TS + Tailwind)           │
│  • Home, 5 Axis, Lesson(회로 5스텝), Story, Review,    │
│    Memory Map, Journal, Toolbelt                       │
│  • Zustand store + IndexedDB(persist)                  │
│  • Web Speech API (TTS) + MediaRecorder (쉐도잉)        │
│  • framer-motion 애니메이션                             │
└─────────────┬──────────────────────────────────────────┘
              │ HTTPS (CORS 화이트리스트)
┌─────────────▼──────────────────────────────────────────┐
│ Edge — Cloudflare Workers (TypeScript)                 │
│  • /grade  /roleplay  /diary-to-quiz                   │
│    /story-difficulty  /health                          │
│  • KV: CACHE(응답 캐시) + RATE(사용자별 일일 쿼터)      │
│  • Anthropic prompt caching (ephemeral)                │
└─────────────┬──────────────────────────────────────────┘
              │
┌─────────────▼──────────────────────────────────────────┐
│ LLM Providers                                          │
│  • Anthropic Claude Haiku 4.5  (primary)               │
│  • Google Gemini 2.5 Flash-Lite (fallback)             │
│  • (옵션) DeepSeek V3 — 배치 작업                       │
└────────────────────────────────────────────────────────┘
```

배포 타깃: **GitHub Pages** (정적). 도메인: `nulmaru.github.io/sulsul-plus/` 또는 후속 결정.

---

## 3. 기술 스택 (확정)

| 영역 | 선택 | 근거 |
|---|---|---|
| 프레임워크 | React 18 + TypeScript 5 | sulsul과 동일 — 마이그레이션 0 |
| 빌드 | Vite 5 | sulsul과 동일 |
| 스타일 | Tailwind CSS 3 + 커스텀 토큰 | 빠른 반복 + 시간의 색 토큰 |
| 라우팅 | react-router-dom v6 (HashRouter) | GitHub Pages 호환 |
| 상태 | zustand + idb-keyval persist | sulsul 패턴 + IndexedDB 영구화 |
| 애니메이션 | framer-motion | sulsul 그대로 |
| PWA | vite-plugin-pwa (Workbox) | service worker + manifest |
| 폰트 | Pretendard Variable | sulsul과 동일 |
| 음성 | Web Speech API (TTS/STT) + MediaRecorder | 무료, 브라우저 내장 |
| 백엔드 | Cloudflare Workers + KV | 무료 티어로 100명 운영 가능 |

---

## 4. 데이터 모델 (요약 — 전체는 `src/types/schema.ts`)

```
Phrase {id, ko, en, past?, coords:{days,stages,places,situations,times}, examples[]}
Card   {id, type:hook|narration|analogy|example|highlight, phraseId?, ...}
Quiz   {id, type:MC|OX|FILL|ARRANGE|MATCH|TRANSLATE, ...}
Scenario {id, situation, steps[3]}            ← tt의 3단계 누적 작문
Lesson {id, stageId, day?, cards[], scenarioIds[], finalQuizIds[], storyId?, coords}
Stage  {id, lessonIds[], bossQuizId?, unlockThreshold}
Story  {id, day, genre, place, time, body:{easy,natural,challenge}, comprehension}
UserState {srs, quizAttempts, recallSpeedMs, lessonProgress, storyProgress,
           myPhrases, journal, bookmarks, notes, unlockedStages, stats, prefs}
```

5축 좌표는 모두 *태그 배열*. 같은 Phrase가 여러 day/place/situation/time에 동시에 속할 수 있어 횡단 탐색 가능.

---

## 5. 화면 목록 (라우트 + 우선순위)

| 라우트 | 화면 | P |
|---|---|---|
| `/` | Home (Now-card · 회로 다이얼 · Daily Story 카드 · 5축 칩 · 하단바) | **P0** |
| `/lesson/:id` | 회로 5스텝 (Understand→Absorb→Read→Produce→Imprint) | **P0** |
| `/story/:id` | Daily Story (난이도 토글 + 이해 퀴즈) | **P0** |
| `/review` | SRS 큐 (n=3, wrong=1 옵션) | **P0** |
| `/axis/day` | 30일 그리드 (tt 유지) | **P0** |
| `/axis/stage` | Stage 트리 (sulsul 유지) | **P1** |
| `/axis/place` | 집/도시 미니맵 | **P1** |
| `/axis/situation` | 씬 라이브러리 | **P1** |
| `/axis/time` | 24h 클럭 | **P2** |
| `/memory-map` | 망각 시각화 그리드 | **P1** |
| `/journal` | 일기 + LLM 빈칸 변환 | **P2** |
| `/toolbelt` | 설정·내보내기·도구함 | **P1** |
| `/quiz/:id` | 단독 퀴즈 (Boss·Mid) | **P1** |
| `/now` | 자동 진입 (시간∩장소 추천) | **P2** |

---

## 6. 회로 5스텝 정의 (`/lesson/:id`)

| # | 모드 | 사용 컴포넌트 |
|---|---|---|
| 1 | 🧠 **Understand** | hook → analogy → highlight 카드, 자동 TTS |
| 2 | 👂 **Absorb** | 표현 카드 N개 (한↔영 플립) · 받아쓰기 · 쉐도잉 (녹음+TTS비교) |
| 3 | 📖 **Read** | 그날의 Daily Story 임베드 (옵션, 매칭 시) |
| 4 | 🗣️ **Produce** | tt의 3단계 누적 작문 + 자유 작문(LLM 채점) |
| 5 | 🔁 **Imprint** | 6종 혼합 퀴즈 → 결과 → SRS 큐 등록 → 일기 한 문장 |

상단 컨텍스트 칩: `📅 Day · 🪜 Stage · 🗺️ Place · 🎬 Situation · ⏰ Time`

---

## 7. 핵심 알고리즘

### 7.1 SRS (수정 SM-2 단순화)
```
정답 →
  consecutiveCorrect += 1
  intervalDays = [0.25, 1, 3, 7, 16, 30, 60][min(cc-1, 6)]
  nextReviewAt = now + intervalDays
오답 →
  consecutiveCorrect = 0
  lapses += 1
  nextReviewAt = now + 0.25일 (6시간)
```

복습 큐 정렬: `consecutiveCorrect ASC, nextReviewAt ASC`. *sulsul과 호환.*

### 7.2 Pocket Session 추천
```
input: now, lastKnownPlace, recentTags
output: PocketSession 1개

규칙 (우선순위):
1. 시간대 ⏰
   05-08 → 기상/세면/주방 후보
   08-10 → 출근/이동
   12-14 → 점심/카페
   18-20 → 퇴근/저녁
   22-24 → 자기 전
2. 마지막 학습일자 → 미진행 day 우선
3. SRS 큐가 비어있지 않으면 1분 복습 우선
4. 사용자 dailyMinutesGoal에 맞는 길이로
```

### 7.3 시간의 색 (자동 테마)
```
morning   06-11 → bg=#FFFBF2  accent=#F5C842
midday    11-17 → bg=#F4F6FF  accent=#4F46E5
evening   17-22 → bg=#1F1B2E  accent=#A78BFA
night     22-06 → bg=#0F172A  accent=#94A3B8
```

### 7.4 Phrase Memory Map 강도
```
strength = min(1, consecutiveCorrect / 5) × decay(days_since_last)
decay(d) = exp(-d / halfLife),  halfLife = 7
색 = lerp(faded → vivid, strength)
```

---

## 8. LLM 통합

### 8.1 엔드포인트
| Path | 용도 | 모델 | 캐시 |
|---|---|---|---|
| `POST /grade` | 자유 작문 채점 | Haiku 4.5 + Gemini 폴백 | 24h |
| `POST /roleplay` | 씬 롤플레잉 (스트리밍) | Haiku 4.5 | 없음 |
| `POST /diary-to-quiz` | 일기 → 빈칸 퀴즈 | Haiku 4.5 | 7d |
| `POST /story-difficulty` | 본문 난이도 변환 | Haiku 4.5 | 30d |
| `GET /health` | 헬스체크 | - | - |

### 8.2 비용 절감
- 시스템 프롬프트 `cache_control: { type: "ephemeral" }`
- 결과 SHA-256 키 KV 캐시
- 사용자별 일일 200 호출 한도
- 응답 max_tokens 강제 (150~600)
- 비실시간(diary→quiz, story-difficulty)은 캐시 적극

### 8.3 비용 가정 (Haiku 4.5, 2026)
- 1 호출 평균 in 200 + out 100 = 300 토큰
- 캐시 적용 후 실효: 호출당 ~$0.0001~0.0003
- 100 DAU × 일 50 호출 = 월 ~$5 (캐시 적용 시)

---

## 9. 보안

- API 키는 Workers Secret으로만 저장 (`wrangler secret put`)
- CORS 화이트리스트
- 사용자 입력 길이 제한 (300~1500자)
- 토스트 외 무료 토큰 노출 금지
- 클라이언트의 `X-User-Id`는 익명 UUID (이메일·이름 없음)

---

## 10. 콘텐츠 작성 정책

| 범위 | 작성 방식 | 양 |
|---|---|---|
| Week 1 (Day 1–7) | 사람 손작성 (tt 기반 인용) | 표현 ~105개, 시나리오 7, 스토리 3편 풀 |
| Day 8–14 | 메타·표현만 골격 | 표현 70개 |
| Day 15–30 | 메타데이터만 + LLM 확장 가능 | 제목·장소·시간 |
| Stage 데이터 | tt 5주 분리 + sulsul 스테이지 매핑 | 5단계 |
| 카드 유형 | tt 표현은 `example` 카드로 변환 + sulsul `hook/analogy/narration` 추가 | 자동 + 수동 |
| 퀴즈 | `generateQuizzes(lesson)` 함수로 자동 생성 + 일부 수동 | 레슨당 6~10개 |

---

## 11. 단계별 구현 계획 + 검증

각 단계 끝에 **검증 체크포인트**가 있음. 통과 못 하면 다음 단계 진행 안 함.

### 단계 A — Foundation ✅ (완료)
- [x] `src/types/schema.ts`
- [x] `server/workers/*` (인덱스, wrangler, package, tsconfig)
- [x] `docs/wireframes.md`
- [x] `docs/dev-spec.md`
- **검증**: 파일 존재, 타입 일관성

### 단계 B — Seed Content
- [ ] `src/data/taxonomy.ts` — 장소/상황/시간 라벨·이모지·한글명
- [ ] `src/data/phrases.seed.ts` — Day 1–14 표현 풀
- [ ] `src/data/scenarios.seed.ts` — tt 시나리오 마이그레이션
- [ ] `src/data/lessons.seed.ts` — 강 메타 + 카드 + 퀴즈 ID 매핑
- [ ] `src/data/stages.seed.ts` — 5단계
- [ ] `src/data/stories.seed.ts` — Day 1–3 풀 + Day 4–30 메타
- [ ] `src/data/quiz-generator.ts` — phrase 풀에서 6종 자동 생성
- **검증**: TypeScript 컴파일 통과, 모든 ID 참조 유효

### 단계 C — PWA 스캐폴드
- [ ] `web/` 디렉토리에 Vite 프로젝트 구성
- [ ] tailwind.config + 시간의 색 토큰 + Pretendard 로드
- [ ] vite-plugin-pwa manifest + service worker
- [ ] HashRouter + 라우트 셸
- **검증**: `npm run build` 성공, `index.html`이 PWA manifest 포함

### 단계 D — 코어 라이브러리
- [ ] `lib/store.ts` zustand + idb-keyval persist
- [ ] `lib/srs.ts` SRS 알고리즘
- [ ] `lib/tts.ts` Web Speech 헬퍼
- [ ] `lib/time.ts` 시간대 → TimeBand + 색
- [ ] `lib/llm.ts` Workers 호출 클라이언트
- [ ] `lib/pocket.ts` Pocket Session 추천
- **검증**: 각 함수 단위로 콘솔 출력 동작 확인 (브라우저 데브툴)

### 단계 E — Home
- [ ] `components/NowCard.tsx`
- [ ] `components/CircuitDial.tsx`
- [ ] `components/DailyStoryCard.tsx`
- [ ] `components/AxisChips.tsx`
- [ ] `components/BottomBar.tsx`
- [ ] `routes/Home.tsx`
- **검증**: 홈에서 모든 위젯 렌더, 시간의 색 자동 적용

### 단계 F — Lesson 5-step + Story
- [ ] 카드 스택 컴포넌트 (좌우 스와이프)
- [ ] 6종 퀴즈 컴포넌트 (sulsul 패턴 차용)
- [ ] tt의 3단계 누적 작문
- [ ] Story 난이도 토글 + 본문 표현 하이라이트
- [ ] Story 이해 퀴즈 3종
- **검증**: lesson-1 실제 진행해서 5스텝이 끝까지 흐름

### 단계 G — 5축 라우트
- [ ] AxisDay, AxisStage, AxisPlace, AxisSituation, AxisTime
- **검증**: 각 축에서 진입 → 같은 표현에 도달

### 단계 H — Review · MemoryMap · Journal · Toolbelt
- [ ] SRS 큐 진행 로직
- [ ] Memory Map 그리드 (망각 색)
- [ ] 일기 작성 + LLM 채점 + 다음날 빈칸 큐 등록
- [ ] 설정·내보내기
- **검증**: 일기 작성 → 빈칸 퀴즈 변환 → SRS 큐에 등장

### 단계 I — 빌드 + 검증
- [ ] `npm run build` 0 error
- [ ] `npm run preview` 로컬 동작
- [ ] Lighthouse PWA 점수 확인
- [ ] 라우트별 수동 워크스루
- **검증**: 빌드 산출물이 `web/dist`에 생성

### 단계 J — 진행 로그
- [ ] `docs/progress.md` 작성 (무엇이 끝났고 무엇이 남았는지)
- [ ] 배포 명령 + 시크릿 등록 절차 정리

---

## 12. 사전 결정 사항 (사용자 승인)

| # | 결정 | 사유 |
|---|---|---|
| 1 | **PWA-first, native-later (Capacitor 래핑 후속)** | 4주 MVP·재사용 |
| 2 | 기본 LLM = **Claude Haiku 4.5** | 한↔영 페어 강함 |
| 3 | 폴백 LLM = **Gemini 2.5 Flash-Lite** | 비용 |
| 4 | 상태 = **zustand + idb-keyval** | sulsul 패턴 정합 |
| 5 | 라우팅 = **HashRouter** | GitHub Pages 호환 |
| 6 | Tailwind + 커스텀 시간색 토큰 | 빠른 반복 |
| 7 | Week 1 풀 콘텐츠, Week 2–4 골격, Story 3편 풀+27편 메타 | 야간 작업 범위 현실화 |
| 8 | 퀴즈는 자동 생성 함수 + 일부 수동 | 콘텐츠 양산 |
| 9 | 디렉토리: 루트 `src/` (공유 타입·데이터) + `web/` (PWA) + `server/workers/` | 모노레포 가벼움 |
| 10 | 다국어: 한국어 UI 우선, 추후 영어 UI 추가 | MVP 단순화 |

---

## 13. 알려진 위험 & 완화

| 위험 | 완화 |
|---|---|
| 30편 스토리 본문 작성 시간 | Week 1 풀(3편), 이후 메타+자동 LLM 확장 자리만 |
| iOS PWA 알림 약함 | MVP는 토스트 + 내일 Capacitor 래핑 시 푸시 |
| Web Speech 음성 인식 정확도 들쭉날쭉 | 쉐도잉은 비교 재생 중심, ASR은 옵션 |
| LLM 키 무한 호출 | Workers KV 일일 쿼터 + 응답 캐시 |
| 사용자 ID 익명 → 디바이스 변경 시 데이터 유실 | 설정 > 데이터 내보내기 + 추후 sync 검토 |

---

## 14. MVP "정의된 완료(Done)" 기준

다음을 모두 만족하면 야간 MVP 종료:

1. ✅ 빌드 통과 (`npm run build` exit 0)
2. ✅ Home/Lesson/Story/Review 동작
3. ✅ Day 1–3 풀 학습 시작→완료 가능
4. ✅ SRS 큐가 채워지고 1분 복습 동작
5. ✅ Story 난이도 토글 동작 (LLM 호출 없이 캐시본만)
6. ✅ Workers 프록시 코드 deploy-ready (배포 명령 명세)
7. ✅ `docs/progress.md`에 현 상태·다음 작업 정리
