# Sulsul+ — 통합 영어 학습 PWA

> **tt**(출력·시나리오 30일 코퍼스)와 **sulsul**(이해 카드·SRS·다양 퀴즈)을 합쳐 만든
> **회로형 5축 학습 + Daily Story + LLM 보조** 영어 학습 PWA.

## 🚀 빠른 시작

```bash
git clone https://github.com/NULMARU/tt_sul.git
cd tt_sul/web
npm install
npm run dev          # http://localhost:5173
```

## 📚 문서

- [docs/wireframes.md](docs/wireframes.md) — 5축 메인 화면 와이어프레임
- [docs/dev-spec.md](docs/dev-spec.md) — 아키텍처·결정·구현 단계
- [docs/deploy-llm-proxy.md](docs/deploy-llm-proxy.md) — **LLM 프록시 배포 가이드 (30분)** ← AI 기능 켜기
- [docs/progress.md](docs/progress.md) — 진행 로그

## 🎯 주요 기능

| 영역 | 내용 |
|---|---|
| **회로 5스텝 학습** | 🧠 이해 → 👂 흡수 → 📖 독해 → 🗣️ 출력 → 🔁 각인 |
| **5축 탐색** | 📅 일자 / 🪜 단계 / 🗺️ 장소 / 🎬 상황 / ⏰ 시간 |
| **30일 Daily Story** | 한 주인공의 30일 연속극, 🟢🟡🔴 3난이도 토글 |
| **SRS + Memory Map** | 망각곡선 기반 복습 + 시각적 망각도 그리드 |
| **6종 퀴즈** | 객관식·OX·빈칸·어순배열·상황매칭·번역 (자동 생성) |
| **시간의 색** | 시간대에 따라 배경·악센트 자동 전환 |
| **PWA** | 홈스크린 추가·오프라인·단축키 4종 |
| **LLM (옵션)** | 작문 채점·일기→퀴즈·스토리 난이도 변환 (Claude Haiku 4.5) |

## 📁 구조

```
.
├── docs/                 가이드·명세 문서
├── src/                  공유 타입·시드 (web과 workers 모두 사용)
│   ├── types/schema.ts
│   └── data/
│       ├── taxonomy.ts          5축 메타 (장소/상황/시간/스테이지)
│       ├── phrases.seed.ts      표현 100+ (Day 1-30)
│       ├── scenarios.seed.ts    3단계 누적 작문 시나리오
│       ├── stories.seed.ts      Daily Story 30편 (모두 풀 본문)
│       ├── stages.seed.ts       5 스테이지 + 30 강
│       └── quiz-generator.ts    6종 퀴즈 자동 생성
│
├── web/                  PWA (Vite + React + TS + Tailwind)
└── server/workers/       Cloudflare Workers LLM 프록시
```

## 🚀 배포

### GitHub Pages 자동 배포 (5분)
1. 워크플로 파일을 `.github/workflows/`로 복사:
   ```bash
   mkdir -p .github/workflows
   cp docs/templates/github-workflows/*.yml .github/workflows/
   git add .github/workflows && git commit -m "Enable workflows" && git push
   ```
   > 거부 시 PAT에 `workflow` 스코프 추가: https://github.com/settings/tokens
2. `Settings → Pages → Source: GitHub Actions` 활성화
3. 결과 URL: `https://nulmaru.github.io/tt_sul/`

### LLM 프록시 자동 배포 (옵션)
- 위와 같은 절차로 `deploy-workers.yml` 활성화
- `Settings → Secrets` 에 `CF_API_TOKEN`, `CF_ACCOUNT_ID` 등록
- 상세: [docs/deploy-llm-proxy.md](docs/deploy-llm-proxy.md)

## 📜 라이선스

개인 학습용. 코드 자유롭게 참고 가능.

## 🤝 기여

이슈·PR 환영. [GitHub](https://github.com/NULMARU/tt_sul)
