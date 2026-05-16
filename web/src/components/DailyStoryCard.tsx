import { useNavigate } from "react-router-dom";
import { useStore } from "../lib/store";
import { localDateKey, storyDayForDate, todayStory } from "../lib/daily-story";

export function DailyStoryCard() {
  const nav = useNavigate();
  const storyProgress = useStore(s => s.storyProgress);
  const story = todayStory();
  const todayKey = localDateKey();
  const readAt = storyProgress[story.id]?.readAt;
  const readToday = readAt ? localDateKey(new Date(readAt)) === todayKey : false;

  const hasFull = !!story.body.natural;
  return (
    <button
      className="w-full text-left rounded-2xl bg-surface border border-border p-4 active:scale-[0.99] transition-transform"
      onClick={() => nav(`/story/${story.id}`)}
    >
      <div className="flex items-center gap-2 text-xs text-text-muted">
        📖 오늘의 스토리 · Day {storyDayForDate()}
        {readToday && <span className="text-success">· 읽음</span>}
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
