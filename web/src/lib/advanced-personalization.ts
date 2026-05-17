import type { AdvancedArticle, JournalInsight } from "@shared/types/schema";

const PATTERN_TOPIC_HINTS: Record<string, string[]> = {
  "업무일": ["업무", "기술/AI"],
  "저녁 회복": ["건강", "업무"],
  "사람과 대화": ["관계", "교육"],
  "여행 준비": ["여행", "이동", "아시아"],
  "아침 루틴": ["건강"],
  "시사 토론": ["글로벌 트렌드", "국제뉴스", "사회"],
};

export interface PersonalizedAdvancedPlan {
  activeTopics: string[];
  reasonKo: string;
  personalizedArticles: AdvancedArticle[];
  generalArticles: AdvancedArticle[];
}

export function buildPersonalizedAdvancedPlan(
  articles: AdvancedArticle[],
  journalInsight?: JournalInsight,
): PersonalizedAdvancedPlan {
  const activeTopics = buildActiveTopics(journalInsight);
  const scored = articles.map(article => ({
    article,
    score: scoreArticle(article, activeTopics),
  }));
  const personalizedArticles = scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.article.estimatedMinutes - b.article.estimatedMinutes)
    .map(item => item.article);
  const personalizedIds = new Set(personalizedArticles.map(article => article.id));
  const generalArticles = articles
    .filter(article => !personalizedIds.has(article.id))
    .sort((a, b) => categoryWeight(a.category) - categoryWeight(b.category));

  return {
    activeTopics,
    reasonKo: buildReason(activeTopics, journalInsight),
    personalizedArticles,
    generalArticles,
  };
}

export function articleMatchesTopics(article: AdvancedArticle, topics: string[]): boolean {
  return scoreArticle(article, topics) > 0;
}

function buildActiveTopics(journalInsight?: JournalInsight): string[] {
  if (!journalInsight) return [];
  const topics = new Set<string>();
  for (const topic of journalInsight.preferredTopics ?? []) topics.add(topic);
  for (const pattern of journalInsight.dailyPatternTags ?? []) {
    for (const hinted of PATTERN_TOPIC_HINTS[pattern] ?? []) topics.add(hinted);
  }
  return [...topics].slice(0, 6);
}

function scoreArticle(article: AdvancedArticle, topics: string[]): number {
  if (topics.length === 0) return 0;
  const tags = new Set((article.interestTags ?? []).map(normalize));
  return topics.reduce((score, topic) => score + (tags.has(normalize(topic)) ? 2 : 0), 0);
}

function buildReason(topics: string[], journalInsight?: JournalInsight): string {
  if (topics.length === 0) {
    return "낙서장에 관심 주제와 생활 패턴이 쌓이면 상급 글 추천이 자동으로 달라집니다.";
  }
  const basis = journalInsight?.entryCount ? `낙서장 ${journalInsight.entryCount}개` : "낙서장";
  return `${basis}에서 보이는 관심 주제와 생활 패턴을 기준으로 골랐습니다.`;
}

function categoryWeight(category: AdvancedArticle["category"]): number {
  if (category === "work") return 1;
  if (category === "news") return 2;
  return 3;
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, "").trim();
}
