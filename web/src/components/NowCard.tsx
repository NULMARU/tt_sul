import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useStore } from "../lib/store";
import { pickNow } from "../lib/pocket";
import { bandLabel, bandEmoji } from "../lib/time";
import { PLACE_META } from "@shared/data/taxonomy";

export function NowCard() {
  const nav = useNavigate();
  const lessonProgress = useStore(s => s.lessonProgress);
  const srs = useStore(s => s.srs);
  const quizAttempts = useStore(s => s.quizAttempts);
  const storyProgress = useStore(s => s.storyProgress);
  const prefs = useStore(s => s.prefs);
  const learnerProfile = useStore(s => s.learnerProfile);
  const recommendationFeedback = useStore(s => s.recommendationFeedback);
  const recordFeedback = useStore(s => s.recordRecommendationFeedback);
  const completed = useMemo(
    () => new Set(Object.entries(lessonProgress).filter(([, v]) => v.completed).map(([k]) => k)),
    [lessonProgress],
  );
  const sug = pickNow({
    completedLessonIds: completed,
    lessonProgress,
    srs,
    quizAttempts,
    storyProgress,
    prefs,
    learnerProfile,
    recommendationFeedback,
  });

  useEffect(() => {
    recordFeedback(sug.id, "shown");
  }, [recordFeedback, sug.id]);

  const place = sug.lesson.coords.places?.[0];
  const placeMeta = place ? PLACE_META[place] : undefined;
  const primaryPath =
    sug.type === "review" ? `/review?n=${sug.durationMin <= 2 ? 3 : 5}` :
    sug.type === "story" && sug.storyId ? `/story/${sug.storyId}` :
    `/lesson/${sug.lesson.id}`;
  const primaryLabel =
    sug.type === "review" ? "복습 시작 →" :
    sug.modeHint === "audio-only" ? "듣기 →" :
    sug.modeHint === "quick" ? "짧게 시작 →" :
    "시작 →";

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
        {sug.label}
      </div>
      <div className="text-sm text-text-muted mt-0.5">{sug.lesson.subtitle}</div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {sug.reasons.slice(0, 2).map(r => (
          <span key={r} className="rounded-full bg-surface-2 border border-border px-2 py-1 text-[11px] text-text-muted">
            {r}
          </span>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <button
          className="flex-1 rounded-xl bg-accent text-[#2A2522] font-medium py-2.5 active:scale-[0.99]"
          onClick={() => {
            recordFeedback(sug.id, "clicked");
            nav(primaryPath);
          }}
        >
          {primaryLabel}
        </button>
        <button
          className="rounded-xl border border-border px-3 py-2.5 text-sm text-text-muted"
          onClick={() => {
            recordFeedback(sug.id, "dismissed");
            nav(sug.type === "review" ? `/lesson/${sug.lesson.id}` : "/review?practice=1&n=3");
          }}
        >
          {sug.type === "review" ? "강의로" : "1분만"}
        </button>
      </div>
    </motion.div>
  );
}
