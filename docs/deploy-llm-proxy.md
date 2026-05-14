# LLM 프록시 배포 가이드 — Cloudflare Workers + Anthropic Claude

> 끝까지 따라하면 **약 30–40분**에 LLM 기능(작문 채점·일기→퀴즈·스토리 난이도 변환·롤플레잉)이 모두 켜집니다.
> 명령은 모두 복사 붙여넣기 가능. 막히는 단계에서 멈추셔도 안전합니다.

---

## 🎯 끝나면 할 수 있는 것

- 📝 **자유 작문 채점**: 사용자가 쓴 영어 한 문장 → AI가 점수·수정·대안·이유 4가지 피드백
- 📓 **일기 → 다음날 퀴즈**: 사용자가 쓴 일기를 자동으로 빈칸 퀴즈 3개로 변환
- 📖 **스토리 난이도 변환**: Day 15~30처럼 본문이 비어 있는 스토리도 🟢🟡🔴 3난이도 자동 생성
- 🎭 **롤플레잉**: (옵션, 추후 UI 구현 시) 카페 직원·면접관 등과 영어 대화

---

## ⏱ 예상 소요 시간 + 비용

| 단계 | 시간 | 비용 |
|---|---|---|
| Anthropic 계정·키 발급 | 5분 | 처음 $5 충전 권장 |
| Cloudflare 계정 | 5분 | 무료 |
| Wrangler 설치·로그인 | 5분 | 무료 |
| KV 생성 + 시크릿 설정 | 5분 | 무료 |
| 배포 + 테스트 | 5분 | 무료 |
| PWA 연결 + 빌드 | 5분 | 무료 |
| **총합** | **~30분** | **~$5 (선불 충전)** |

> 본인 1명이 매일 50회 호출해도 월 **$0.5 미만**. 100명 활성 사용자도 월 $5 수준.

---

## 0️⃣ 사전 준비

이 컴퓨터에 다음이 설치돼 있으면 OK:
- ✅ Node.js 18+ (`node -v`로 확인)
- ✅ Git, 그리고 이 저장소(`/Users/spacenulmaru/Projects/projects/tt_sulsul`)

> Cloudflare 계정과 Anthropic 계정은 아래 단계에서 만듭니다.

---

## 1️⃣ Anthropic API 키 발급 (5분)

### Step 1.1 — 계정 만들기
1. https://console.anthropic.com 접속
2. **"Sign up"** → 이메일 또는 Google 계정으로 가입
3. 휴대폰 번호로 본인 인증 (필수)

### Step 1.2 — 결제 정보 등록
1. 좌측 메뉴 **Settings → Billing**
2. **Add payment method** → 카드 등록
3. **Buy credits** → 최소 $5 충전 (한 번만 충전하면 됨, 자동결제 X)

### Step 1.3 — API 키 만들기
1. 좌측 메뉴 **Settings → API Keys**
2. **Create Key** → 이름은 `sulsul-plus-proxy` 같은 식별 가능한 이름
3. **키가 한 번만 보입니다** — 안전한 곳에 복사해 둘 것
   - 형식: `sk-ant-api03-XXXXXXXXXX...` (이걸 그대로 쓰세요)

> ⚠️ **이 키를 절대 git에 커밋하지 마세요.** Workers 시크릿으로만 등록할 겁니다.

---

## 2️⃣ Cloudflare 계정 만들기 (5분)

1. https://dash.cloudflare.com/sign-up 접속
2. 이메일로 가입, 비밀번호 설정, 이메일 인증
3. **로그인하면 Workers/Pages 메뉴가 좌측에 보입니다.**

> 카드 등록 불필요. Workers 무료 플랜은 **하루 10만 요청**까지 무료입니다.

---

## 3️⃣ Wrangler CLI 설치 + 로그인 (5분)

```bash
cd /Users/spacenulmaru/Projects/projects/tt_sulsul/server/workers
npm install                      # 이미 설치돼 있으면 그냥 패스
npx wrangler --version           # 버전 확인
```

브라우저로 Cloudflare 로그인:
```bash
npx wrangler login
```

브라우저 창이 열림 → **Allow** 클릭 → 터미널로 돌아오면 `Successfully logged in.` 메시지.

---

## 4️⃣ KV 네임스페이스 만들기 (5분)

캐시용 + rate-limit용 KV 두 개를 만듭니다.

```bash
npx wrangler kv namespace create CACHE
npx wrangler kv namespace create RATE
```

각 명령의 출력에서 **`id = "..."`** 줄을 확인해 두세요. 예시:
```
🌀 Creating namespace with title "sulsul-llm-proxy-CACHE"
✨ Success!
Add the following to your configuration file in your kv_namespaces array:
{ binding = "CACHE", id = "a1b2c3d4e5f6g7h8i9j0..." }
```

### 4.1 — wrangler.toml에 id 붙여넣기

[server/workers/wrangler.toml](../server/workers/wrangler.toml) 열어서 두 군데 수정:

```toml
[[kv_namespaces]]
binding = "CACHE"
id = "여기에_CACHE_id_붙여넣기"

[[kv_namespaces]]
binding = "RATE"
id = "여기에_RATE_id_붙여넣기"
```

---

## 5️⃣ 시크릿 등록 (3분)

```bash
# 필수: Anthropic 키
npx wrangler secret put ANTHROPIC_API_KEY
# → 프롬프트가 뜨면 sk-ant-api03-... 키를 붙여넣고 Enter
```

선택사항: Gemini 폴백 (Anthropic 다운 시 자동 전환). 안 해도 동작합니다.
```bash
npx wrangler secret put GEMINI_API_KEY
# Google AI Studio에서 발급: https://aistudio.google.com/apikey
# 무료, 일 분당 60회 제한
```

---

## 6️⃣ 배포 (1분)

```bash
npm run deploy
```

성공 출력 예시:
```
Total Upload: 12.34 KiB / gzip: 4.56 KiB
Uploaded sulsul-llm-proxy (1.23 sec)
Published sulsul-llm-proxy (0.45 sec)
  https://sulsul-llm-proxy.YOUR-SUBDOMAIN.workers.dev
Current Deployment ID: ...
```

**이 URL을 복사해 두세요.** (예: `https://sulsul-llm-proxy.nulmaru.workers.dev`)

---

## 7️⃣ 동작 확인 (2분)

### 7.1 — Health 체크
```bash
curl https://YOUR-WORKER.workers.dev/health
# → {"ok":true,"time":"2026-05-15T..."}
```

### 7.2 — 실제 채점 호출 테스트
```bash
curl -X POST https://YOUR-WORKER.workers.dev/grade \
  -H "Content-Type: application/json" \
  -H "X-User-Id: test-user" \
  -d '{"sentence":"I goes to school","target":"학교에 가다"}'

# 예상 응답:
# {"score":4,"fix":"I go to school","alt":"I'm heading to school","why":"주어 I 뒤에는 동사 원형 'go'를 써요"}
```

> 첫 호출은 모델 콜드 스타트로 2–3초, 이후는 0.5–1.5초.

---

## 8️⃣ PWA에 연결 (3분)

웹앱 디렉토리에 환경 변수 파일을 만듭니다:

```bash
cd /Users/spacenulmaru/Projects/projects/tt_sulsul/web
echo 'VITE_LLM_PROXY_URL=https://YOUR-WORKER.workers.dev' > .env.local
```

빌드하거나 dev 서버 재시작:
```bash
# 개발 중 확인
npm run dev
# → http://localhost:5173 접속 → 도구함(/toolbelt)에서 LLM 상태 ✓ 확인

# 또는 운영 빌드
npm run build
```

> `.env.local`은 `.gitignore`에 포함돼 있어 GitHub에 올라가지 않습니다. 안전.

---

## 9️⃣ 사용해 보기

### A. 자유 작문 채점
1. 홈 → 회로 다이얼 중앙 클릭 → Day 1 시작
2. **🗣️ Produce 단계**에서 자유 작문 영역 (시나리오 없는 경우)에 영어 한 문장 입력
3. **AI 채점** 버튼 → 점수·수정·대안·이유 표시

### B. 일기 → 다음날 퀴즈
1. 하단 **🛠️ 도구** → **📓 일기**
2. 영어로 한 문장 작성 → **저장**
3. LLM 활성화 시 "📝 빈칸 퀴즈 N개 생성됨" 표시
4. 다음날 1분 복습에 자동 등장

### C. 스토리 난이도 변환
1. 홈 → **📖 오늘의 스토리** 또는 `/story/story-day-15` 같은 비어 있는 본문의 스토리로 직접 이동
2. 🟢🟡🔴 난이도 토글 → LLM이 즉시 본문 생성 (캐시되므로 두 번째부터는 즉시)

---

## 🔄 (옵션) GitHub Actions 자동 배포

코드 push할 때 Workers 자동 배포되게 하려면:

### 1. Cloudflare API Token 발급
1. https://dash.cloudflare.com/profile/api-tokens
2. **Create Token** → **Edit Cloudflare Workers** 템플릿 사용
3. 토큰 복사

### 2. GitHub Secrets 등록
1. https://github.com/NULMARU/tt_sul/settings/secrets/actions
2. **New repository secret** 3개 추가:
   - `CF_API_TOKEN`: 위에서 발급한 토큰
   - `CF_ACCOUNT_ID`: Cloudflare 대시보드 우측에 있는 Account ID
   - (이미 시크릿으로 등록한 키들도 GitHub에 똑같이 등록하면 워크플로가 매번 재설정)

### 3. 이미 만들어 둔 워크플로
[.github/workflows/deploy-workers.yml](.github/workflows/deploy-workers.yml) — main 브랜치에 push 시 자동 배포.

---

## 🚨 트러블슈팅

| 증상 | 원인 / 해결 |
|---|---|
| `wrangler login` 브라우저가 안 열림 | 로컬 권한 문제. 출력된 URL을 수동으로 복사해 다른 브라우저에서 열기 |
| `kv namespace create` 401 | 다시 `npx wrangler login` |
| `deploy` 시 "ANTHROPIC_API_KEY not defined" | `wrangler secret put ANTHROPIC_API_KEY` 단계 누락. 재실행 |
| `/grade` 호출 시 500 | Cloudflare 대시보드 → Workers → Logs에서 실시간 로그 확인. 보통 잘못된 API 키 |
| `/grade` 호출 시 CORS 차단 | [server/workers/src/index.ts](../server/workers/src/index.ts)의 `ALLOWED_ORIGINS`에 현재 사용 중인 도메인 추가 |
| 채점이 작동하지 않음 (앱 안) | PWA에서 `import.meta.env.VITE_LLM_PROXY_URL`이 비어 있을 가능성. `.env.local` 만든 후 dev/build 재시작 필수 |
| 비용이 걱정 | 도구함 → 통계에서 `TTS 재생` 옆에 호출 수 표시되도록 추후 추가 가능. Workers는 일일 한도 200회 자체 제한 있음 (수정 가능: server/workers/src/index.ts의 `DAILY_CALL_QUOTA`) |

### 로그 실시간 보기
```bash
cd /Users/spacenulmaru/Projects/projects/tt_sulsul/server/workers
npm run tail
# → Cloudflare에 흘러들어오는 모든 요청 + 응답을 실시간으로 표시
```

---

## 🔐 보안 체크리스트

- ✅ API 키는 `wrangler secret`로만 등록 (코드·git 절대 노출 X)
- ✅ Workers 코드에 `ALLOWED_ORIGINS` 화이트리스트 (CORS)
- ✅ 사용자별 일일 호출 한도 `DAILY_CALL_QUOTA = 200`
- ✅ 입력 길이 제한 (sentence 600자, diary 800자, passage 1500자)
- ✅ X-User-Id는 익명 UUID (이메일·이름 없음)
- ✅ `.env.local`은 `.gitignore`에 포함

---

## 💸 비용 통제 가이드

### Anthropic 측
- 도구함의 통계 확인 (다음 PR에서 추가될 예정)
- console.anthropic.com → Usage 페이지에서 일별 토큰 사용량
- Spending limits 설정 가능 (Settings → Billing → Spending Limit)

### Cloudflare 측
- Workers 무료 플랜: 10만 req/day, 10ms CPU time per req
- KV 무료 플랜: 1k write/day, 100k read/day
- 본 앱은 KV write = 호출당 1회(캐시 miss시), read = 호출당 2회(rate + cache)
- 100 DAU × 50 호출 = 5,000 호출 → 무료 plan 한계의 5%

### Workers 내부 안전장치 (이미 구현됨)
```ts
DAILY_CALL_QUOTA = 200       // 사용자당 일일 호출 상한
DAILY_TOKEN_QUOTA = 50_000   // (참고용 상수, 실제 계산은 KV 활용 시 추가)
캐시 TTL                     // grade: 24h / diary-to-quiz: 7d / story-difficulty: 30d
```

수정하려면 [server/workers/src/index.ts](../server/workers/src/index.ts) 상단 상수 수정 후 재배포.

---

## ✅ 완료 체크리스트

배포가 끝났다면:

- [ ] `curl YOUR-URL/health` → `{"ok":true,...}` 응답
- [ ] `curl -X POST YOUR-URL/grade ...` → JSON 채점 응답
- [ ] `web/.env.local`에 URL 저장
- [ ] `npm run dev` → 도구함 LLM 상태 ✓
- [ ] 홈 → 회로 다이얼 → 자유 작문에 영어 입력 → AI 채점 동작 확인
- [ ] 일기 작성 → "빈칸 퀴즈 N개 생성됨" 메시지 확인
- [ ] Day 15 스토리 이동 → 난이도 토글 시 본문 자동 생성

여기까지 가셨으면 다음 단계는 **Day 15–30 스토리는 이미 손작성됨 → 다른 LLM 기능 본격 사용** 또는 **쉐도잉 모드 구현**.
