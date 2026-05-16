import { STORIES, STORY_BY_DAY } from "@shared/data/stories.seed";

export function localDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function storyDayForDate(date = new Date()): number {
  return ((date.getDate() - 1) % 30) + 1;
}

export function todayStory(date = new Date()) {
  return STORY_BY_DAY[storyDayForDate(date)] ?? STORIES[0];
}
