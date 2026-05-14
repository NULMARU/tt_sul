# 작업 진행 로그 — 야간 MVP

> 사용자가 자는 동안 자율 진행한 결과 요약. 아침에 이 파일부터 확인하세요.

---

## ✅ 완성된 것 — MVP "Done" 기준 모두 충족

| # | 항목 | 상태 | 위치 |
|---|---|---|---|
| 1 | 와이어프레임 (홈·5축·레슨·스토리·메모리맵) | ✅ | [docs/wireframes.md](wireframes.md) |
| 2 | 개발명세 (아키텍처·결정·단계) | ✅ | [docs/dev-spec.md](dev-spec.md) |
| 3 | 통합 데이터 모델 (5축 좌표 + 회로 + Story) | ✅ | [src/types/schema.ts](../src/types/schema.ts) |
| 4 | 시드 콘텐츠 — 표현 ~85개, 시나리오 12, 강 17, 단계 5, 스토리 30(3편 풀+27 메타) | ✅ | [src/data/](../src/data/) |
| 5 | 6종 퀴즈 자동 생성기 | ✅ | [src/data/quiz-generator.ts](../src/data/quiz-generator.ts) |
| 6 | PWA 스캐폴드 (Vite + React + TS + Tailwind + vite-plugin-pwa) | ✅ | [web/](../web/) |
| 7 | 코어 라이브러리 (store · SRS · TTS · time · llm · pocket · quiz-check) | ✅ | [web/src/lib/](../web/src/lib/) |
| 8 | 12개 라우트 모두 구현 | ✅ | [web/src/routes/](../web/src/routes/) |
| 9 | Cloudflare Workers LLM 프록시 (Haiku+Gemini 폴백, 캐싱, rate limit) | ✅ | [server/workers/](../server/workers/) |
| 10 | 빌드 통과 (`npm run build`) — 385KB JS / 121KB gzip | ✅ | |
| 11 | 타입체크 통과 — web + workers 모두 0 error | ✅ | |
| 12 | PWA 매니페스트 + 아이콘 + 4개 단축키 | ✅ | |

---

## 🏃 지금 실행해 보기

### 로컬 PWA 실행
```bash
cd web
npm install            # 이미 설치돼 있음
npm run dev            # http://localhost:5173
# 또는
npm run preview        # http://localhost:4173 (빌드된 산출물 미리보기)
```

### 빌드
```bash
cd web
npm run build          # web/dist 에 산출
```

### Workers 프록시 배포 (옵션, LLM 기능 활성화용)
```bash
cd server/workers
npm install

# KV 네임스페이스 2개 생성 → wrangler.toml의 id에 붙여넣기
npx wrangler kv:namespace create CACHE
npx wrangler kv:namespace create RATE

# 시크릿 설정
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put GEMINI_API_KEY

# 배포
npm run deploy

# 그 후 web에서 .env.local 만들기
echo 'VITE_LLM_PROXY_URL=https://YOUR-WORKER.workers.dev' > web/.env.local
```

### GitHub Pages 배포
```bash
cd web
npm run build
# dist/ 를 gh-pages 브랜치로 push
# 또는 GitHub Actions로 자동화
```

---

## 🧪 검증 결과 (자동)

```
[web]    tsc -b              → 0 error
[web]    vite build          → 436 modules, 793ms
[web]    npm run preview     → HTTP 200, manifest 정상
[workers]tsc --noEmit        → 0 error
```

산출물 크기:
- `dist/index.html` — 1.04 KB
- `dist/assets/index-*.css` — 15.94 KB / gzip 3.99 KB
- `dist/assets/index-*.js` — 385.26 KB / gzip 120.98 KB
- PWA precache — 11 entries / 420 KiB

---

## 🗺️ 라우트 동작 확인 — 수동 워크스루용

브라우저에서 `npm run dev` 후 다음 경로:

| 경로 | 확인 포인트 |
|---|---|
| `/` | Now-card, 회로 다이얼(중앙+4모드), Daily Story 카드, 5축 칩, 하단바, 시간의 색 자동 적용 |
| `/lesson/lesson-1` | Intro → Understand(hook 카드) → Absorb(표현 플립) → Read(스토리 안내) → Produce(3단계 작문) → Imprint(6종 퀴즈) → Done |
| `/story/story-day-1` | 난이도 3토글, 표현 자동 하이라이트, TTS 듣기, 3문항 이해 퀴즈 |
| `/review?n=3` | SRS 큐 1분 모드 (푼 적 없으면 첫 강 첫 3문항으로 폴백) |
| `/axis/day` | 30일 5주차 그리드, Day 1–17 활성, 나머지 잠금 |
| `/axis/stage` | 5단계 트리, 직전 80% 해금 |
| `/axis/place` | 집·도시 평면도, 탭하면 그 장소의 표현·강 |
| `/axis/situation` | 씬 라이브러리, 시간대 그룹 |
| `/axis/time` | 6시간대 클럭, 현재 시간 강조 |
| `/memory-map` | Phrase Memory Map 그리드 (학습 전엔 모두 옅음) |
| `/journal` | 일기 작성 → LLM 있으면 빈칸 변환 |
| `/toolbelt` | 도구·설정·내보내기·LLM 상태 |

---

## 🎯 사용한 결정 (스펙 §12 + 진행 중 추가)

| # | 결정 | 메모 |
|---|---|---|
| A | TypeScript path alias `@shared/*` → `../src/*` | 공유 타입·데이터를 web에서 그대로 import |
| B | HashRouter | GitHub Pages 호환 |
| C | zustand persist → idb-keyval | sulsul 호환, IndexedDB 영구화 |
| D | Tailwind + CSS 변수로 "시간의 색" 자동 전환 | `<html data-time="...">` 갱신 |
| E | 6종 퀴즈는 phrase 풀에서 자동 생성 | 콘텐츠 양산 + 일관성 |
| F | 스토리 본문은 Day 1–3만 풀 작성, 나머지는 LLM 변환 자리 | 야간 시간 현실화 |
| G | PWA 아이콘은 sulsul 원본 재사용 (임시) | 추후 자체 아이콘 제작 |
| H | 발음 채점은 미구현(자리만), TTS+녹음 비교는 MVP에서 생략 | 다음 스프린트 |

---

## ⏭️ 다음 작업 (우선순위)

### P0 (다음 한 세션)
- [ ] **Day 4–14 스토리 본문** 사람 손작성 또는 LLM으로 일괄 생성
- [ ] **쉐도잉 모드** — MediaRecorder + TTS 비교 재생 (sulsul 코드 차용)
- [ ] **Workers 배포 + LLM 연결 E2E 테스트** — 실제 키 설정 후 `/grade`, `/diary-to-quiz`, `/story-difficulty` 확인
- [ ] **GitHub Pages 배포** — `npm run build` → gh-pages

### P1
- [ ] Day 15–30 표현 추가 (현재 Day 17까지)
- [ ] **롤플레잉 모드** — `/roleplay` 스트리밍, 카페·면접·길묻기 씬 (LLM)
- [ ] **알림** — 일일 학습 알림 (PWA Notification API)
- [ ] **다크모드 토글** — 시스템 외 수동 선택
- [ ] **My Phrases** — 사용자 변형 저장 UI
- [ ] **Phrase Chains** — 비슷한·반대 패턴 그래프 점프

### P2
- [ ] **Capacitor 래핑** — iOS/Android 네이티브 빌드 + 푸시 + 백그라운드 오디오
- [ ] Lighthouse PWA 점수 100점 목표
- [ ] i18n (영어 UI)
- [ ] **사용자 동기화** (옵션) — 디바이스 간 데이터 공유

---

## 🐛 알려진 이슈 / 한계

1. **본문이 비어 있는 스토리는 "준비 중" 안내**가 표시됨 (4-30일). LLM 연결 시 자동 변환 가능.
2. **음성 합성**: 브라우저 기본 보이스만 사용. iOS Safari에서는 첫 탭 후에만 동작 (사용자 제스처 요구).
3. **SRS 큐**: 사용자가 한 번도 퀴즈를 풀지 않은 상태에서는 첫 강 퀴즈로 폴백.
4. **3단계 작문에 LLM 미연동 채점**: 정답 확인 후 다음 단계 진행만, "내 답안 채점"은 Imprint 단계의 자유 작문에서만.
5. **장소·상황·시간 축 표현 수가 불균등** — Day 1–7 빅 그룹, Day 8–17은 작음.

---

## 📁 최종 디렉토리 구조

```
/Users/spacenulmaru/Projects/projects/tt_sulsul/
├── docs/
│   ├── wireframes.md     ← 메인·5축·레슨·스토리·메모리맵 와이어프레임
│   ├── dev-spec.md       ← 개발명세 (아키텍처·결정·단계·콘텐츠 정책)
│   └── progress.md       ← (이 파일)
│
├── src/                  ← 공유 타입·시드 (web과 workers 모두 사용 가능)
│   ├── types/schema.ts
│   └── data/
│       ├── index.ts
│       ├── taxonomy.ts          ← 5축 메타데이터·시간의 색
│       ├── phrases.seed.ts      ← Day 1-17 표현 ~85개
│       ├── scenarios.seed.ts    ← tt 3단계 누적 작문 12개
│       ├── stories.seed.ts      ← 30편 (3편 풀 + 27 메타)
│       ├── stages.seed.ts       ← 5단계 + 17강
│       └── quiz-generator.ts    ← 6종 퀴즈 자동 생성
│
├── web/                  ← PWA (Vite + React + TS + Tailwind)
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── public/icons/
│   ├── dist/             ← 빌드 산출
│   └── src/
│       ├── main.tsx, App.tsx, index.css, env.d.ts
│       ├── lib/         ← store, srs, tts, time, llm, pocket, quiz-check
│       ├── components/  ← BottomBar, NowCard, CircuitDial, DailyStoryCard,
│       │                  AxisChips, QuizPlayer
│       └── routes/      ← Home, Axis(Day|Stage|Place|Situation|Time),
│                          Lesson, Story, Review, MemoryMap, Journal, Toolbelt
│
└── server/workers/       ← Cloudflare Workers LLM 프록시
    ├── src/index.ts      ← /grade /roleplay /diary-to-quiz /story-difficulty /health
    ├── wrangler.toml
    ├── package.json
    └── tsconfig.json
```

---

## 🌐 GitHub Pages 배포 메모 (선택 사항)

`web/vite.config.ts`의 `base: "./"` 덕분에 어떤 경로에 배포해도 동작합니다.

```bash
# 옵션 1: gh-pages 브랜치 수동 푸시
cd web && npm run build
cd dist && git init && git checkout -b gh-pages && git add . && git commit -m "deploy"
git remote add origin <repo-url> && git push -f origin gh-pages

# 옵션 2: GitHub Actions — .github/workflows/deploy.yml
# (다음 세션에서 작성 권장)
```

---

## 💬 한 줄 정리

**tt의 시나리오·30일 코퍼스 + sulsul의 SRS·다양 퀴즈·PWA**를 5축 회로 모델 + Daily Story + LLM 보조로 묶은 통합 학습 앱의 **빌드 가능한 MVP가 완성**되었습니다. 다음 세션은 *콘텐츠 확장(스토리 본문) → Workers 실제 배포 → GitHub Pages 배포* 순서가 가장 짧은 경로입니다.
