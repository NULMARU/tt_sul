import type { AdvancedArticle, JournalInsight } from "@shared/types/schema";

export interface AxisStatus {
  label: string;
  className: string;
}

export function activeAxisTopics(insight?: JournalInsight): string[] {
  if (!insight) return [];
  return [...new Set([...(insight.preferredTopics ?? []), ...(insight.dailyPatternTags ?? [])])].slice(0, 6);
}

export function axisTopicScore(text: string, topics: string[]): number {
  const normalizedText = normalize(text);
  return topics.reduce((score, topic) => {
    const keys = AXIS_TOPIC_KEYWORDS[topic] ?? [topic];
    return score + keys.filter(key => normalizedText.includes(normalize(key))).length;
  }, 0);
}

export function progressStatus(completed = false, activityCount = 0): AxisStatus {
  if (completed) return { label: "완료", className: "border-success/40 bg-success/10 text-success" };
  if (activityCount > 0) return { label: "진행 중", className: "border-warn/40 bg-warn/10 text-warn" };
  return { label: "대기", className: "border-border bg-surface-2 text-text-muted" };
}

export function advancedStatus(progress: {
  completed?: boolean;
  read?: boolean;
  speakingPracticeCount?: number;
  writingFeedbackHistory?: unknown[];
} | undefined): AxisStatus {
  if (progress?.completed) return { label: "완료", className: "border-success/40 bg-success/10 text-success" };
  if (progress?.read || progress?.speakingPracticeCount || progress?.writingFeedbackHistory?.length) {
    return { label: "진행 중", className: "border-warn/40 bg-warn/10 text-warn" };
  }
  return { label: "대기", className: "border-border bg-surface-2 text-text-muted" };
}

export function mergeAdvancedArticles(generated: AdvancedArticle[], seeded: AdvancedArticle[]): AdvancedArticle[] {
  const seen = new Set<string>();
  return [...generated, ...seeded].filter(article => {
    if (seen.has(article.id)) return false;
    seen.add(article.id);
    return true;
  });
}

export function categoryLabel(category: AdvancedArticle["category"]) {
  if (category === "work") return "업무";
  if (category === "news") return "뉴스형 이슈";
  return "사회";
}

export function categoryEmoji(category: AdvancedArticle["category"]) {
  if (category === "work") return "💼";
  if (category === "news") return "🗞️";
  return "🌐";
}

export function axisLevelTitle(level: string) {
  if (level === "intermediate") return "Stage 2 · 중급";
  if (level === "advanced") return "Stage 3 · 상급";
  return "Stage 1 · 초급";
}

export function sortByPersonalization<T>(
  items: T[],
  score: (item: T) => number,
  fallbackScore: (item: T) => number = () => 0,
): T[] {
  return [...items].sort((a, b) => score(b) - score(a) || fallbackScore(a) - fallbackScore(b));
}

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, "").trim();
}

const AXIS_TOPIC_KEYWORDS: Record<string, string[]> = {
  "업무": ["work", "office", "meeting", "update", "business", "task", "feedback", "company"],
  "우주산업": ["space", "satellite", "orbit", "rocket", "infrastructure", "lunar", "aerospace"],
  "기술/AI": ["technology", "tech", "ai", "digital", "data", "media", "battery", "robot", "automation"],
  "글로벌 트렌드": ["global", "trend", "news", "world", "media", "community"],
  "아시아": ["asia", "asian", "hong", "singapore", "nikkei", "market", "korea", "china", "japan"],
  "환경": ["environment", "climate", "rain", "clean", "electric", "pollution", "heat"],
  "교육": ["learning", "reading", "teacher", "school", "education", "tutor"],
  "경제/소비": ["business", "market", "price", "shop", "brand", "commerce", "platform"],
  "음식": ["food", "dinner", "restaurant", "cafe", "coffee", "noodle", "meal"],
  "이동": ["bus", "train", "airport", "route", "transport", "station", "museum"],
  "집": ["home", "sleep", "routine", "rest", "offline"],
  "건강": ["health", "exercise", "rest", "wellbeing", "heat", "recovery"],
  "관계": ["friend", "team", "people", "community", "conversation", "family"],
  "여행": ["travel", "trip", "hotel", "museum", "airport", "city", "directions"],
  "취미": ["hobby", "movie", "art", "video", "journal", "museum"],
  "아침 루틴": ["routine", "morning", "coffee", "health"],
  "업무일": ["work", "meeting", "update", "feedback", "office"],
  "저녁 회복": ["rest", "health", "wellbeing", "offline", "night"],
  "사람과 대화": ["friend", "conversation", "community", "team", "talk"],
  "여행 준비": ["travel", "hotel", "airport", "museum", "directions"],
  "시사 토론": ["news", "policy", "global", "society", "debate", "issue"],
};
