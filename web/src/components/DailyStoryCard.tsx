import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { STORY_BY_DAY } from "@shared/data/stories.seed";
import { useStore } from "../lib/store";
import { pickNow } from "../lib/pocket";

export function DailyStoryCard() {
  const nav = useNavigate();
  const lessonProgress = useStore(s => s.lessonProgress);
  const srs = useStore(s => s.srs);
  const prefs = useStore(s => s.prefs);
  const learnerProfile = useStore(s => s.learnerProfile);
  const storyProgress = useStore(s => s.storyProgress);
  const recommendationFeedback = useStore(s => s.recommendationFeedback);
  const completed = useMemo(
    () => new Set(Object.entries(lessonProgress).filter(([, v]) => v.completed).map(([k]) => k)),
    [lessonProgress],
  );
  const sug = pickNow({
    completedLessonIds: completed,
    lessonProgress,
    srs,
    storyProgress,
    prefs,
    learnerProfile,
    recommendationFeedback,
  });
  const story = sug.lesson.day ? STORY_BY_DAY[sug.lesson.day] : undefined;
  if (!story) return null;

  const hasFull = !!story.body.natural;
  return (
    <button
      className="w-full text-left rounded-2xl bg-surface border border-border p-4 active:scale-[0.99] transition-transform"
      onClick={() => nav(`/story/${story.id}`)}
    >
      <div className="flex items-center gap-2 text-xs text-text-muted">
        📖 오늘의 스토리
        {!hasFull && <span className="text-warn">· 본문 준비 중</span>}
      </div>
      <div className="mt-1 font-semibold leading-snug">"{story.title}"</div>
      <div className="text-sm text-text-muted mt-0.5">
        {story.phraseIds.length}개 학습 표현 포함 · 약 {Math.max(3, Math.round(story.phraseIds.length * 1.2))}분
      </div>
      <div className="mt-2 flex gap-1.5 text-xs">
        <span className="rounded-full bg-surface-2 border border-border px-2 py-0.5">🟢 단순</span>
        <span className="rounded-full bg-accent/20 border border-accent px-2 py-0.5">🟡 자연</span>
        <span className="rounded-full bg-surface-2 border border-border px-2 py-0.5">🔴 도전</span>
      </div>
    </button>
  );
}
