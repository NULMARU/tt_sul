# 작업 진행 로그

> 매 세션 끝에 갱신. 아침에 이 파일부터 확인하세요.

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
