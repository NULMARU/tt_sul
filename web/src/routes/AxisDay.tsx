import { useNavigate } from "react-router-dom";
import { LESSONS } from "@shared/data/stages.seed";
import { useStore } from "../lib/store";

const WEEKS = [
  { range: [1, 7],  title: "WEEK 1 · 데일리 동작" },
  { range: [8, 14], title: "WEEK 2 · 일상생활" },
  { range: [15, 21],title: "WEEK 3 · 상태 표현" },
  { range: [22, 28],title: "WEEK 4 · 문장 패턴" },
  { range: [29, 30],title: "WEEK 5 · 종합 실전" },
];

export function AxisDay() {
  const nav = useNavigate();
  const progress = useStore(s => s.lessonProgress);

  return (
    <div className="px-5 pt-6 pb-4 flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <button onClick={() => nav("/")} className="w-9 h-9 rounded-full hover:bg-surface-2">←</button>
        <h1 className="text-xl font-bold">📅 30일 트랙</h1>
      </header>

      {WEEKS.map(w => (
        <section key={w.title}>
          <h2 className="text-xs text-text-muted font-semibold mb-2">{w.title}</h2>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: w.range[1] - w.range[0] + 1 }, (_, i) => {
              const day = w.range[0] + i;
              const lesson = LESSONS.find(l => l.day === day);
              const done = lesson && progress[lesson.id]?.completed;
              const exists = !!lesson;
              return (
                <button
                  key={day}
                  disabled={!exists}
                  onClick={() => lesson && nav(`/lesson/${lesson.id}`)}
                  className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center text-sm font-semibold transition-all ${
                    !exists      ? "border-border bg-surface-2 opacity-40" :
                    done         ? "border-success bg-success/15 text-success" :
                                   "border-accent/40 bg-accent/10 hover:bg-accent/20"
                  }`}
                >
                  <span>{day}</span>
                  <span className="text-xs">{!exists ? "🔒" : done ? "✅" : "▶"}</span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
