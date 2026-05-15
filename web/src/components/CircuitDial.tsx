import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../lib/store";
import { pickNow } from "../lib/pocket";

const MODES = [
  { key: "understand", label: "Understand", emoji: "🧠", angle: 270 },
  { key: "absorb",     label: "Absorb",     emoji: "👂", angle: 0 },
  { key: "produce",    label: "Produce",    emoji: "🗣️", angle: 90 },
  { key: "imprint",    label: "Imprint",    emoji: "🔁", angle: 180 },
] as const;

export function CircuitDial() {
  const nav = useNavigate();
  const lessonProgress = useStore(s => s.lessonProgress);
  const srs = useStore(s => s.srs);
  const prefs = useStore(s => s.prefs);
  const learnerProfile = useStore(s => s.learnerProfile);
  const completed = useMemo(
    () => new Set(Object.entries(lessonProgress).filter(([, v]) => v.completed).map(([k]) => k)),
    [lessonProgress],
  );
  const sug = pickNow({ completedLessonIds: completed, lessonProgress, srs, prefs, learnerProfile });

  const R = 90;

  return (
    <div className="relative mx-auto" style={{ width: 280, height: 280 }}>
      {/* outer ring */}
      <div className="absolute inset-4 rounded-full border-2 border-dashed border-border" />
      {/* mode buttons */}
      {MODES.map(m => {
        const rad = (m.angle * Math.PI) / 180;
        const x = 140 + Math.cos(rad) * R - 36;
        const y = 140 + Math.sin(rad) * R - 36;
        return (
          <button
            key={m.key}
            onClick={() => nav(`/lesson/${sug.lesson.id}?mode=${m.key}`)}
            className="absolute w-[72px] h-[72px] rounded-full bg-surface border border-border shadow-sm flex flex-col items-center justify-center text-[10px] text-text-muted active:scale-95"
            style={{ left: x, top: y }}
          >
            <span className="text-2xl leading-none">{m.emoji}</span>
            <span className="mt-1 font-medium">{m.label}</span>
          </button>
        );
      })}
      {/* center */}
      <button
        onClick={() => nav(`/lesson/${sug.lesson.id}`)}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-accent text-[#2A2522] font-semibold shadow active:scale-95 flex flex-col items-center justify-center"
      >
        <span className="text-sm">오늘의</span>
        <span className="text-base">회로 ◎</span>
      </button>
    </div>
  );
}
