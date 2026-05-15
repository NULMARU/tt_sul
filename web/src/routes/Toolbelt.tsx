import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../lib/store";
import { llmAvailable, llmProxyUrl, probeHealth, probeTest, type HealthResult } from "../lib/llm";

export function Toolbelt() {
  const nav = useNavigate();
  const stats = useStore(s => s.stats);
  const prefs = useStore(s => s.prefs);
  const learnerProfile = useStore(s => s.learnerProfile);
  const adaptiveUiPatches = useStore(s => s.adaptiveUiPatches);
  const rejectAdaptiveUiPatch = useStore(s => s.rejectAdaptiveUiPatch);
  const setPrefs = useStore(s => s.setPrefs);
  const exportJson = useStore(s => s.exportJson);
  const reset = useStore(s => s.resetAll);
  const unlockAll = useStore(s => s.unlockAll);

  function doExport() {
    const json = exportJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `sulsul-plus-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="px-5 pt-6 pb-4 flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <button onClick={() => nav("/")} className="w-9 h-9 rounded-full hover:bg-surface-2">←</button>
        <h1 className="text-xl font-bold">🛠️ 도구함</h1>
      </header>

      <Card title="추가 도구">
        <Row label="📓 일기 (다음날 퀴즈로)"   action={() => nav("/journal")} />
        <Row label="📅 일자 트랙"             action={() => nav("/axis/day")} />
        <Row label="🪜 스테이지 트리"         action={() => nav("/axis/stage")} />
        <Row label="🗺️ 장소 지도"             action={() => nav("/axis/place")} />
        <Row label="🎬 씬 라이브러리"         action={() => nav("/axis/situation")} />
        <Row label="⏰ 시간대"                action={() => nav("/axis/time")} />
      </Card>

      <Card title="학습 설정">
        <Field label="일일 목표 (분)">
          <Segment value={String(prefs.dailyMinutesGoal)} options={["3","5","10","20"]} onChange={v => setPrefs({ dailyMinutesGoal: Number(v) as any })} />
        </Field>
        <Field label="TTS 속도">
          <Segment value={String(prefs.ttsRate)} options={["0.85","1","1.15","1.25","1.5"]} onChange={v => setPrefs({ ttsRate: Number(v) })} />
        </Field>
        <Field label="내레이션">
          <Segment value={prefs.narrationLevel} options={["off","examples","cards","all"]} onChange={v => setPrefs({ narrationLevel: v as any })} />
        </Field>
        <Field label="전체 단계 해금" inline>
          <Toggle value={prefs.unlockAllStages} onChange={() => unlockAll()} />
        </Field>
        <Field label="맞춤형 화면">
          <Segment value={prefs.adaptiveUiLevel ?? "safe"} options={["off","safe","suggested","experimental"]} onChange={v => setPrefs({ adaptiveUiLevel: v as any })} />
        </Field>
      </Card>

      <Card title="학습 패턴">
        <div className="text-xs text-text-muted leading-relaxed">
          선호 시간대: {learnerProfile?.preferredTimeBands.join(", ") || "데이터 수집 중"} · 약점 표현 {learnerProfile?.weakPhraseIds.length ?? 0}개 · 취약 단계 {learnerProfile?.fragileModes.join(", ") || "없음"}
        </div>
        {adaptiveUiPatches.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="text-xs font-semibold text-text-muted">맞춤화 기록</div>
            {[...adaptiveUiPatches].reverse().slice(0, 5).map(p => (
              <div key={p.id} className="rounded-lg border border-border bg-surface-2 p-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className={p.status === "active" ? "text-success" : "text-text-muted"}>{p.status}</span>
                  <span className="font-medium">{p.surface}</span>
                  {p.status === "active" && (
                    <button onClick={() => rejectAdaptiveUiPatch(p.id)} className="ml-auto underline text-text-muted">
                      되돌리기
                    </button>
                  )}
                </div>
                <div className="mt-1 text-text-muted">{p.reason}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <LLMSection />



      <Card title="데이터">
        <Row label="📤 진행률 내보내기 (JSON)" action={doExport} />
        <Row label="♻️ 모든 진행률 초기화"     action={() => { if (window.confirm("정말 초기화할까요?")) reset(); }} danger />
      </Card>

      <Card title="통계">
        <div className="text-xs text-text-muted leading-relaxed">
          🔥 스트릭 {stats.streak}일 · 카드 {stats.totalCardsViewed} · 퀴즈 {stats.totalQuizzesAttempted}회 · 학습 시간 {Math.floor(stats.totalStudySeconds / 60)}분 · TTS {stats.ttsPlays} · 스토리 {stats.storiesRead}
        </div>
      </Card>
    </div>
  );
}

function LLMSection() {
  const [health, setHealth] = useState<HealthResult | null>(null);
  const [test, setTest] = useState<(HealthResult & { sample?: string }) | null>(null);
  const [busy, setBusy] = useState<"health" | "test" | null>(null);

  async function runHealth() {
    setBusy("health"); setHealth(null);
    setHealth(await probeHealth());
    setBusy(null);
  }
  async function runTest() {
    setBusy("test"); setTest(null);
    setTest(await probeTest());
    setBusy(null);
  }

  return (
    <section className="rounded-2xl bg-surface border border-border p-4 flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-text-muted">LLM 연결</h2>

      <div className="text-sm">
        프록시 URL:{" "}
        {llmAvailable() ? (
          <code className="px-1 rounded bg-surface-2 text-xs break-all">{llmProxyUrl()}</code>
        ) : (
          <span className="text-warn">⚠ 미설정</span>
        )}
      </div>

      {!llmAvailable() && (
        <p className="text-xs text-text-muted leading-relaxed">
          빌드 환경 변수 <code className="px-1 rounded bg-surface-2">VITE_LLM_PROXY_URL</code> 을 설정하면 활성화됩니다.<br />
          → <code className="px-1 rounded bg-surface-2">web/.env.local</code> 에 추가하고 <code className="px-1 rounded bg-surface-2">npm run dev</code> 재시작.<br />
          가이드: docs/deploy-llm-proxy.md
        </p>
      )}

      {llmAvailable() && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={runHealth}
              disabled={!!busy}
              className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm disabled:opacity-50"
            >
              {busy === "health" ? "확인 중…" : "헬스 체크"}
            </button>
            <button
              onClick={runTest}
              disabled={!!busy}
              className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm disabled:opacity-50"
            >
              {busy === "test" ? "확인 중…" : "AI 호출 테스트"}
            </button>
          </div>

          {health && (
            <ResultBox
              label="헬스 체크"
              ok={health.ok}
              latency={health.latency_ms}
              detail={health.ok ? `model=${health.model ?? "?"} · time=${health.time ?? "?"}` : health.error}
            />
          )}
          {test && (
            <ResultBox
              label="AI 호출 테스트"
              ok={test.ok}
              latency={test.latency_ms}
              detail={test.ok ? `model=${test.model} · "${test.sample}"` : test.error}
            />
          )}
        </div>
      )}

      <p className="text-xs text-text-muted leading-relaxed">
        헬스 체크 = 프록시 연결만 확인 (LLM 호출 없음).<br />
        AI 호출 테스트 = 실제 Claude API에 1회 호출하여 API 키와 라우팅 확인.
      </p>
    </section>
  );
}

function ResultBox({ label, ok, latency, detail }: { label: string; ok: boolean; latency?: number; detail?: string }) {
  return (
    <div className={`text-xs rounded-lg border p-2 ${ok ? "border-success/40 bg-success/10" : "border-error/40 bg-error/10"}`}>
      <div className="flex items-center gap-1.5">
        <span>{ok ? "✓" : "✗"}</span>
        <span className="font-medium">{label}</span>
        {latency !== undefined && <span className="ml-auto text-text-muted">{latency}ms</span>}
      </div>
      {detail && <div className="mt-1 text-text-muted break-all">{detail}</div>}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-surface border border-border p-4 flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-text-muted">{title}</h2>
      {children}
    </section>
  );
}
function Row({ label, action, danger }: { label: string; action: () => void; danger?: boolean }) {
  return (
    <button onClick={action} className={`text-left rounded-lg border border-border px-3 py-2 text-sm flex items-center justify-between ${danger ? "text-error" : ""}`}>
      <span>{label}</span><span>→</span>
    </button>
  );
}
function Field({ label, children, inline }: any) {
  return (
    <div className={inline ? "flex items-center justify-between gap-3" : "flex flex-col gap-1.5"}>
      <div className="text-sm">{label}</div>
      <div>{children}</div>
    </div>
  );
}
function Segment({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="inline-flex bg-surface-2 rounded-lg p-0.5 border border-border flex-wrap gap-0.5">
      {options.map(o => (
        <button key={o} onClick={() => onChange(o)} className={`px-3 py-1 text-sm rounded-md ${value === o ? "bg-accent text-[#2A2522] font-medium" : "text-text-muted"}`}>{o}</button>
      ))}
    </div>
  );
}
function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button role="switch" aria-checked={value} onClick={onChange} className={`relative w-12 h-7 rounded-full transition-colors ${value ? "bg-accent" : "bg-border"}`}>
      <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${value ? "translate-x-5" : ""}`} />
    </button>
  );
}
