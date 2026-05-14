import { useNavigate } from "react-router-dom";
import { LESSONS } from "@shared/data/stages.seed";
import { TIME_META } from "@shared/data/taxonomy";
import { bandEmoji, bandLabel, currentTimeBand } from "../lib/time";
import type { TimeBand } from "@shared/types/schema";

const BANDS: TimeBand[] = ["dawn", "morning", "midday", "afternoon", "evening", "night"];

export function AxisTime() {
  const nav = useNavigate();
  const now = currentTimeBand();

  return (
    <div className="px-5 pt-6 pb-4 flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <button onClick={() => nav("/")} className="w-9 h-9 rounded-full hover:bg-surface-2">←</button>
        <h1 className="text-xl font-bold">⏰ 시간대</h1>
      </header>
      <div className="text-sm text-text-muted">지금: {bandEmoji(now)} {bandLabel(now)}</div>

      {BANDS.map(b => {
        const lessons = LESSONS.filter(l => l.coords.times?.includes(b));
        const meta = TIME_META[b];
        const active = b === now;
        return (
          <section
            key={b}
            className={`rounded-2xl border p-4 ${active ? "border-accent bg-accent/10" : "border-border bg-surface"}`}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{meta.emoji} {bandLabel(b)} <span className="text-xs text-text-muted font-normal">{meta.range[0]}–{meta.range[1]}시</span></h2>
              <span className="text-xs text-text-muted">{lessons.length}강</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {lessons.slice(0, 6).map(l => (
                <button key={l.id} onClick={() => nav(`/lesson/${l.id}`)} className="text-xs rounded-full bg-surface-2 border border-border px-2 py-1">
                  {l.title} · {l.subtitle}
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
