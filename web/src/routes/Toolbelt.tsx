import { useNavigate } from "react-router-dom";
import { useStore } from "../lib/store";
import { llmAvailable } from "../lib/llm";

export function Toolbelt() {
  const nav = useNavigate();
  const stats = useStore(s => s.stats);
  const prefs = useStore(s => s.prefs);
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
      </Card>

      <Card title="LLM 연결">
        <div className="text-sm">
          상태: {llmAvailable() ? <span className="text-success">✓ 프록시 연결됨</span> : <span className="text-warn">⚠ 미설정</span>}
        </div>
        <p className="text-xs text-text-muted leading-relaxed">
          빌드 환경 변수 <code className="px-1 rounded bg-surface-2">VITE_LLM_PROXY_URL</code> 에 Cloudflare Workers URL을 설정하면<br />
          작문 채점·일기→퀴즈·스토리 난이도 변환이 활성화됩니다.
        </p>
      </Card>

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
