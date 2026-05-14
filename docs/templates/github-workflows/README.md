# GitHub Actions 워크플로 — 활성화 방법

이 디렉토리의 두 YAML 파일은 **GitHub Actions로 자동 배포**를 켜기 위한 템플릿입니다.

자동 푸시가 차단된 이유:
> Personal Access Token에 `workflow` 스코프가 없어 `.github/workflows/` 디렉토리는 Claude가 직접 push할 수 없습니다.

## 활성화 방법 (5분)

### 옵션 A — 로컬에서 직접 복사 후 push (가장 쉬움)

```bash
cd /Users/spacenulmaru/Projects/projects/tt_sulsul
mkdir -p .github/workflows
cp docs/templates/github-workflows/deploy-pages.yml .github/workflows/
cp docs/templates/github-workflows/deploy-workers.yml .github/workflows/

git add .github/workflows
git commit -m "Enable GitHub Actions auto-deploy workflows"
git push
```

> 푸시가 또 거부되면, GitHub PAT에 **`workflow` 스코프**를 부여해야 합니다:
> https://github.com/settings/tokens → Edit → ☑ workflow → Update.

### 옵션 B — GitHub 웹 UI로 추가

1. https://github.com/NULMARU/tt_sul 접속
2. **Add file → Create new file** 클릭
3. 파일명 `.github/workflows/deploy-pages.yml`
4. [deploy-pages.yml](deploy-pages.yml) 내용 복사·붙여넣기
5. Commit
6. `deploy-workers.yml`도 같은 방식으로

---

## 활성화 후 추가 설정

### Pages 자동 배포
- **Settings → Pages → Source: GitHub Actions** 활성화
- (옵션) **Settings → Secrets and variables → Actions → Variables**에 `LLM_PROXY_URL` 추가
  → 빌드 시 `VITE_LLM_PROXY_URL`로 자동 주입됨

### Workers 자동 배포
- **Settings → Secrets and variables → Actions → Secrets**에:
  - `CF_API_TOKEN` — [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)에서 발급
  - `CF_ACCOUNT_ID` — Cloudflare 대시보드 우측 사이드바
- (옵션) Variables에 `WORKER_HEALTH_URL` 추가 → 배포 후 자동 헬스체크

상세 가이드: [../../deploy-llm-proxy.md](../../deploy-llm-proxy.md)
