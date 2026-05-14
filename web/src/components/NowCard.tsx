import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useStore } from "../lib/store";
import { pickNow } from "../lib/pocket";
import { bandLabel, bandEmoji } from "../lib/time";
import { PLACE_META } from "@shared/data/taxonomy";

export function NowCard() {
  const nav = useNavigate();
  const lessonProgress = useStore(s => s.lessonProgress);
  const completed = new Set(Object.entries(lessonProgress).filter(([, v]) => v.completed).map(([k]) => k));
  const sug = pickNow(completed);

  const place = sug.lesson.coords.places?.[0];
  const placeMeta = place ? PLACE_META[place] : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl bg-surface border border-border p-4 shadow-sm"
    >
      <div className="flex items-center gap-2 text-xs text-text-muted">
        <span>{bandEmoji(sug.band)} {bandLabel(sug.band)}</span>
        {placeMeta && <span>· {placeMeta.emoji} {placeMeta.ko}</span>}
      </div>
      <div className="mt-1 font-semibold text-lg leading-snug">
        지금 추천 · {sug.lesson.title}
      </div>
      <div className="text-sm text-text-muted mt-0.5">{sug.lesson.subtitle}</div>
      <div className="mt-3 flex gap-2">
        <button
          className="flex-1 rounded-xl bg-accent text-[#2A2522] font-medium py-2.5 active:scale-[0.99]"
          onClick={() => nav(`/lesson/${sug.lesson.id}`)}
        >
          시작 →
        </button>
        <button
          className="rounded-xl border border-border px-3 py-2.5 text-sm text-text-muted"
          onClick={() => nav("/review?n=3")}
        >
          ⚡ 1분만
        </button>
      </div>
    </motion.div>
  );
}
