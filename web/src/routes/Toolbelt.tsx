import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../lib/store";
import { llmAvailable, llmProxyUrl, probeHealth, probeTest, suggestContentUpdate, type HealthResult } from "../lib/llm";
import { analyzeContent, buildLlmContentSuggestion, buildLocalContentSuggestion, contentLabPayload } from "../lib/content-lab";
import { APP_VERSION } from "../lib/version";
import { PHRASE_BY_ID } from "@shared/data/phrases.seed";
import type { ContentSuggestion } from "@shared/types/schema";

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

      <ContentLabSection />

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

      <Card title="앱 정보">
        <div className="text-xs text-text-muted leading-relaxed">
          Sulsul+ v{APP_VERSION} · GitHub Pages/PWA 빌드
        </div>
      </Card>
    </div>
  );
}

function ContentLabSection() {
  const srs = useStore(s => s.srs);
  const quizAttempts = useStore(s => s.quizAttempts);
  const learnerProfile = useStore(s => s.learnerProfile);
  const customContentPhrases = useStore(s => s.customContentPhrases ?? []);
  const contentSuggestions = useStore(s => s.contentSuggestions ?? []);
  const upsertContentSuggestion = useStore(s => s.upsertContentSuggestion);
  const acceptContentSuggestion = useStore(s => s.acceptContentSuggestion);
  const rejectContentSuggestion = useStore(s => s.rejectContentSuggestion);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const input = { srs, quizAttempts, learnerProfile, customContentPhrases };
  const stats = analyzeContent(input);
  const latest = [...contentSuggestions].reverse().slice(0, 3);

  async function generateSuggestion() {
    setBusy(true);
    setMessage("");
    const draft = llmAvailable() ? await suggestContentUpdate(contentLabPayload(input)) : null;
    const suggestion = draft
      ? buildLlmContentSuggestion(input, draft)
      : buildLocalContentSuggestion(input);
    upsertContentSuggestion(suggestion);
    setMessage(draft ? "AI가 학습 기록 기반 후보를 만들었습니다." : "로컬 규칙 기반 후보를 만들었습니다.");
    setBusy(false);
  }

  return (
    <Card title="콘텐츠 자동 보강">
      <div className="text-xs text-text-muted leading-relaxed">
        충분히 익힌 표현은 노출을 줄일 후보로 표시하고, 부족한 부분에는 새 생활 표현을 제안합니다. 승인 전에는 학습 데이터가 바뀌지 않습니다.
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <MiniStat label="마스터 후보" value={stats.masteredPhraseIds.length} />
        <MiniStat label="보강 필요" value={stats.weakPhraseIds.length} />
        <MiniStat label="추가 표현" value={customContentPhrases.length} />
      </div>
      <button
        onClick={generateSuggestion}
        disabled={busy}
        className="rounded-xl bg-accent text-[#2A2522] px-4 py-2.5 text-sm font-medium disabled:opacity-50"
      >
        {busy ? "분석 중…" : llmAvailable() ? "AI로 보강 후보 만들기" : "보강 후보 만들기"}
      </button>
      {message && <div className="text-xs text-success">{message}</div>}
      {latest.length === 0 && (
        <div className="text-xs text-text-muted rounded-xl border border-border bg-surface-2 p-3">
          아직 콘텐츠 후보가 없습니다. 위 버튼을 누르면 검토 가능한 보강팩이 생성됩니다.
        </div>
      )}
      {latest.map(suggestion => (
        <SuggestionCard
          key={suggestion.id}
          suggestion={suggestion}
          onAccept={() => acceptContentSuggestion(suggestion.id)}
          onReject={() => rejectContentSuggestion(suggestion.id)}
        />
      ))}
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-surface-2 px-2 py-2">
      <div className="text-lg font-bold">{value}</div>
      <div className="text-[11px] text-text-muted">{label}</div>
    </div>
  );
}

function SuggestionCard({ suggestion, onAccept, onReject }: { suggestion: ContentSuggestion; onAccept: () => void; onReject: () => void }) {
  const disabled = suggestion.status !== "candidate";
  return (
    <div className="rounded-xl border border-border bg-surface-2 p-3 text-xs flex flex-col gap-2">
      <div className="flex items-start gap-2">
        <div>
          <div className="font-semibold text-sm">{suggestion.title}</div>
          <div className="text-text-muted">{suggestion.source === "llm" ? "AI 제안" : "로컬 제안"} · {new Date(suggestion.createdAt).toLocaleDateString()}</div>
        </div>
        <span className={`ml-auto rounded-full border px-2 py-0.5 ${suggestion.status === "accepted" ? "border-success/40 text-success" : suggestion.status === "rejected" ? "border-error/40 text-error" : "border-border text-text-muted"}`}>
          {suggestion.status === "candidate" ? "검토중" : suggestion.status === "accepted" ? "적용됨" : "보류"}
        </span>
      </div>
      <div className="text-text-muted leading-relaxed">{suggestion.rationale}</div>
      {suggestion.reinforcePhraseIds.length > 0 && (
        <div className="text-text-muted">보강 기준: {suggestion.reinforcePhraseIds.slice(0, 3).map(phraseName).join(", ")}</div>
      )}
      {suggestion.retirePhraseIds.length > 0 && (
        <div className="text-text-muted">노출 줄일 후보: {suggestion.retirePhraseIds.slice(0, 3).map(phraseName).join(", ")}</div>
      )}
      <div className="flex flex-col gap-1.5">
        {suggestion.phrases.slice(0, 4).map(p => (
          <div key={p.id} className="rounded-lg bg-surface border border-border px-2 py-2">
            <div className="en font-semibold">{p.en}</div>
            <div className="text-text-muted">{p.ko}</div>
            <div className="mt-1 text-[11px] text-text-muted">{p.reason}</div>
          </div>
        ))}
      </div>
      {suggestion.story && (
        <div className="rounded-lg bg-surface border border-border px-2 py-2">
          <div className="font-semibold">읽기 보강: {suggestion.story.title}</div>
          <div className="mt-1 en text-text-muted line-clamp-3">{suggestion.story.body}</div>
        </div>
      )}
      <div className="flex gap-2">
        <button disabled={disabled} onClick={onAccept} className="flex-1 rounded-lg bg-accent text-[#2A2522] px-3 py-2 font-medium disabled:opacity-40">
          승인해서 추가
        </button>
        <button disabled={disabled} onClick={onReject} className="rounded-lg border border-border px-3 py-2 text-text-muted disabled:opacity-40">
          보류
        </button>
      </div>
    </div>
  );
}

function phraseName(id: string): string {
  return PHRASE_BY_ID[id]?.ko ?? id;
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
