import { useNavigate } from "react-router-dom";
import { STAGES, LESSON_BY_ID } from "@shared/data/stages.seed";
import { useStore } from "../lib/store";

export function AxisStage() {
  const nav = useNavigate();
  const progress = useStore(s => s.lessonProgress);
  const unlockAll = useStore(s => s.prefs.unlockAllStages);

  function stagePct(lessonIds: string[]) {
    if (lessonIds.length === 0) return 0;
    const done = lessonIds.filter(id => progress[id]?.completed).length;
    return done / lessonIds.length;
  }

  return (
    <div className="px-5 pt-6 pb-4 flex flex-col gap-3">
      <header className="flex items-center gap-3">
        <button onClick={() => nav("/")} className="w-9 h-9 rounded-full hover:bg-surface-2">←</button>
        <h1 className="text-xl font-bold">🪜 Stage 트리</h1>
      </header>

      {STAGES.map((s, idx) => {
        const prevPct = idx === 0 ? 1 : stagePct(STAGES[idx - 1].lessonIds);
        const unlocked = unlockAll || idx === 0 || prevPct >= s.unlockThreshold;
        const pct = stagePct(s.lessonIds);
        return (
          <section
            key={s.id}
            className={`rounded-2xl border p-4 ${unlocked ? "bg-surface border-border" : "bg-surface-2 border-border opacity-60"}`}
          >
            <div className="flex items-baseline justify-between">
              <h2 className="font-semibold">{s.title} {!unlocked && "🔒"}</h2>
              <span className="text-xs text-text-muted">{Math.round(pct * 100)}%</span>
            </div>
            <p className="text-sm text-text-muted mt-0.5">{s.description}</p>
            <div className="mt-2 h-1.5 rounded-full bg-surface-2 overflow-hidden">
              <div className="h-full bg-accent" style={{ width: `${pct * 100}%` }} />
            </div>
            {unlocked && s.lessonIds.length > 0 && (
              <ul className="mt-3 flex flex-col">
                {s.lessonIds.map(id => {
                  const l = LESSON_BY_ID[id];
                  if (!l) return null;
                  const done = progress[id]?.completed;
                  return (
                    <li key={id}>
                      <button
                        onClick={() => nav(`/lesson/${id}`)}
                        className="w-full flex items-center gap-2 py-2 text-left text-sm border-b border-border/60 last:border-0"
                      >
                        <span className="w-6 text-center text-text-muted">{done ? "✓" : "○"}</span>
                        <span className="flex-1">{l.title} — {l.subtitle}</span>
                        <span className="text-text-muted">→</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            {!unlocked && (
              <p className="mt-2 text-xs text-text-muted">🔒 직전 단계 {Math.round(s.unlockThreshold * 100)}% 완료 시 해금</p>
            )}
          </section>
        );
      })}
    </div>
  );
}
