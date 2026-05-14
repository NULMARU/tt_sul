import { useNavigate } from "react-router-dom";
import { SITUATION_META } from "@shared/data/taxonomy";
import { PHRASES } from "@shared/data/phrases.seed";
import { LESSONS } from "@shared/data/stages.seed";
import type { SituationTag } from "@shared/types/schema";

const GROUPS: Record<string, string> = {
  morning:  "🌅 아침",
  transit:  "🚌 이동",
  work:     "💼 일·회의",
  midday:   "☀️ 낮·식사",
  evening:  "🌆 저녁",
  night:    "🌙 밤",
};

export function AxisSituation() {
  const nav = useNavigate();
  const keys = Object.keys(SITUATION_META) as SituationTag[];

  const byGroup = keys.reduce<Record<string, SituationTag[]>>((acc, k) => {
    const g = SITUATION_META[k].group;
    (acc[g] ??= []).push(k);
    return acc;
  }, {});

  function firstLessonFor(s: SituationTag) {
    return LESSONS.find(l => l.coords.situations?.includes(s));
  }

  return (
    <div className="px-5 pt-6 pb-4 flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <button onClick={() => nav("/")} className="w-9 h-9 rounded-full hover:bg-surface-2">←</button>
        <h1 className="text-xl font-bold">🎬 Scene Library</h1>
      </header>

      {Object.entries(byGroup).map(([g, items]) => (
        <section key={g}>
          <h2 className="text-xs text-text-muted font-semibold mb-2">{GROUPS[g] ?? g}</h2>
          <div className="flex flex-wrap gap-2">
            {items.map(s => {
              const m = SITUATION_META[s];
              const n = PHRASES.filter(p => p.coords.situations?.includes(s)).length;
              const lesson = firstLessonFor(s);
              return (
                <button
                  key={s}
                  disabled={!lesson}
                  onClick={() => lesson && nav(`/lesson/${lesson.id}`)}
                  className={`rounded-xl border px-3 py-2 text-sm bg-surface ${lesson ? "border-border active:scale-95" : "border-border opacity-50"}`}
                >
                  <span className="text-base mr-1">{m.emoji}</span>
                  {m.ko}
                  {n > 0 && <span className="text-[10px] text-text-muted ml-1">({n})</span>}
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
