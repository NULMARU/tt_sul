import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ADVANCED_ARTICLES } from "@shared/data/advanced.seed";
import { DIALOGUE_LESSONS } from "@shared/data/dialogues.seed";
import {
  INTERMEDIATE_READING_LESSONS,
  INTERMEDIATE_SOURCE_PROFILE_BY_ID,
} from "@shared/data/intermediate-readings.seed";
import { LESSONS } from "@shared/data/stages.seed";
import { TIME_META } from "@shared/data/taxonomy";
import type { AdvancedArticle, TimeBand } from "@shared/types/schema";
import { buildPersonalizedAdvancedPlan } from "../lib/advanced-personalization";
import {
  activeAxisTopics,
  advancedStatus,
  axisLevelTitle,
  axisTopicScore,
  categoryEmoji,
  categoryLabel,
  mergeAdvancedArticles,
  progressStatus,
  type AxisStatus,
} from "../lib/course-axis";
import { bandEmoji, bandLabel, currentTimeBand } from "../lib/time";
import { useStore } from "../lib/store";

const BANDS: TimeBand[] = ["dawn", "morning", "midday", "afternoon", "evening", "night"];

type TimePlan = {
  band: TimeBand;
  title: string;
  note: string;
  keywords: string[];
};

type AxisTimeItem = {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  route: string;
  meta: string;
  status: AxisStatus;
  personalized?: boolean;
  score: number;
};

const INTERMEDIATE_TIME_PLANS: TimePlan[] = [
  {
    band: "dawn",
    title: "가볍게 듣기",
    note: "짧은 대화 한 장면을 듣고 입을 풀기 좋습니다.",
    keywords: ["weekend", "plans", "listening", "short", "sentence"],
  },
  {
    band: "morning",
    title: "요지 먼저 잡기",
    note: "뉴스형 리딩을 읽고 중심 생각을 말해봅니다.",
    keywords: ["gist", "main idea", "reading", "news", "strategy"],
  },
  {
    band: "midday",
    title: "실생활 대화",
    note: "음식, 이동, 추천처럼 바로 쓸 수 있는 대화가 어울립니다.",
    keywords: ["food", "dinner", "museum", "directions", "recommend"],
  },
  {
    band: "afternoon",
    title: "업무·설명 루프",
    note: "업무 업데이트나 설명형 리딩으로 말의 구조를 세웁니다.",
    keywords: ["work", "update", "business", "explain", "summary"],
  },
  {
    band: "evening",
    title: "쉐도잉과 짧은 작문",
    note: "오늘 본 문장을 따라 말하고 내 문장으로 바꿉니다.",
    keywords: ["shadowing", "speaking", "writing", "journal", "habits"],
  },
  {
    band: "night",
    title: "부담 낮은 복습",
    note: "짧고 쉬운 설명형 글이나 대화 복습이 좋습니다.",
    keywords: ["eli5", "battery", "easy", "warm-up", "confidence"],
  },
];

const ADVANCED_TIME_PLANS: TimePlan[] = [
  {
    band: "dawn",
    title: "긴 글 예열",
    note: "상급 글의 요약과 핵심 표현만 먼저 훑습니다.",
    keywords: ["summary", "expression", "education", "ai", "rest"],
  },
  {
    band: "morning",
    title: "뉴스 분석",
    note: "글로벌 이슈를 읽고 원인과 위험을 정리합니다.",
    keywords: ["news", "global", "climate", "space", "public"],
  },
  {
    band: "midday",
    title: "업무 의견",
    note: "회의, 피드백, 근무 방식처럼 실전 의견 주제를 다룹니다.",
    keywords: ["work", "meeting", "feedback", "company", "week"],
  },
  {
    band: "afternoon",
    title: "토론 프레임",
    note: "찬반 입장과 조건부 결론을 만드는 시간입니다.",
    keywords: ["debate", "should", "stance", "argument", "risk"],
  },
  {
    band: "evening",
    title: "작문 피드백",
    note: "긴 글을 4-5문장 의견문으로 압축합니다.",
    keywords: ["writing", "opinion", "propose", "sentence", "explain"],
  },
  {
    band: "night",
    title: "1분 발화",
    note: "오늘의 관심 주제를 짧게 말하고 평가합니다.",
    keywords: ["speaking", "one-minute", "delivery", "clarity", "structure"],
  },
];

export function AxisTime() {
  const level = useStore(s => s.currentCourseLevel ?? "beginner");
  if (level === "intermediate") return <IntermediateAxisTime />;
  if (level === "advanced") return <AdvancedAxisTime />;
  return <BeginnerAxisTime />;
}

function BeginnerAxisTime() {
  const nav = useNavigate();
  const now = currentTimeBand();

  return (
    <div className="px-5 pt-6 pb-4 flex flex-col gap-4">
      <AxisHeader title="⏰ 시간대" level="Stage 1 · 초급" />
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
              <h2 className="font-semibold">{meta.emoji} {bandLabel(b)} <span className="text-xs text-text-muted font-normal">{meta.range[0]}-{meta.range[1]}시</span></h2>
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

function IntermediateAxisTime() {
  const nav = useNavigate();
  const now = currentTimeBand();
  const dialogueProgress = useStore(s => s.dialogueProgress ?? {});
  const readingProgress = useStore(s => s.intermediateReadingProgress ?? {});
  const insight = useStore(s => s.learnerProfile?.journalInsight);
  const topics = activeAxisTopics(insight);

  return (
    <div className="px-5 pt-6 pb-4 flex flex-col gap-4">
      <AxisHeader title="⏰ 중급 시간대 추천" level={axisLevelTitle("intermediate")} />
      <TopicNotice topics={topics} fallback="시간대별로 부담이 다른 대화·리딩 루프를 추천합니다." />
      {INTERMEDIATE_TIME_PLANS.map(plan => {
        const active = plan.band === now;
        const items = buildIntermediateTimeItems(plan, topics, dialogueProgress, readingProgress);
        return (
          <TimeSection
            key={plan.band}
            plan={plan}
            active={active}
            items={items}
            onOpen={route => nav(route)}
          />
        );
      })}
    </div>
  );
}

function AdvancedAxisTime() {
  const nav = useNavigate();
  const now = currentTimeBand();
  const progress = useStore(s => s.advancedArticleProgress ?? {});
  const generated = useStore(s => s.generatedAdvancedArticles ?? []);
  const insight = useStore(s => s.learnerProfile?.journalInsight);
  const topics = activeAxisTopics(insight);
  const articles = useMemo(() => mergeAdvancedArticles(generated, ADVANCED_ARTICLES), [generated]);
  const plan = buildPersonalizedAdvancedPlan(articles, insight);
  const orderedArticles = useMemo(() => {
    const seen = new Set<string>();
    return [...plan.personalizedArticles, ...plan.generalArticles].filter(article => {
      if (seen.has(article.id)) return false;
      seen.add(article.id);
      return true;
    });
  }, [plan.generalArticles, plan.personalizedArticles]);

  return (
    <div className="px-5 pt-6 pb-4 flex flex-col gap-4">
      <AxisHeader title="⏰ 상급 시간대 미션" level={axisLevelTitle("advanced")} />
      <TopicNotice topics={topics} fallback="시간대에 따라 읽기, 토론, 작문, 발화의 부담을 조절합니다." />
      {ADVANCED_TIME_PLANS.map(timePlan => {
        const active = timePlan.band === now;
        const items = buildAdvancedTimeItems(timePlan, topics, orderedArticles, progress, plan.personalizedArticles);
        return (
          <TimeSection
            key={timePlan.band}
            plan={timePlan}
            active={active}
            items={items}
            onOpen={route => nav(route)}
          />
        );
      })}
    </div>
  );
}

function AxisHeader({ title, level }: { title: string; level: string }) {
  const nav = useNavigate();
  return (
    <header className="flex items-center gap-3">
      <button onClick={() => nav("/")} className="w-9 h-9 rounded-full hover:bg-surface-2">←</button>
      <div>
        <div className="text-xs text-text-muted">{level}</div>
        <h1 className="text-xl font-bold">{title}</h1>
      </div>
    </header>
  );
}

function TopicNotice({ topics, fallback }: { topics: string[]; fallback: string }) {
  return (
    <section className="rounded-2xl border border-accent/40 bg-accent/10 p-4 text-sm">
      <div className="text-xs font-semibold text-accent-strong">낙서장·사용패턴 반영</div>
      <p className="mt-1 text-text-muted">{topics.length ? `관심 주제 ${topics.slice(0, 3).join(", ")}와 시간대 패턴을 같이 봅니다.` : fallback}</p>
    </section>
  );
}

function TimeSection({
  plan,
  active,
  items,
  onOpen,
}: {
  plan: TimePlan;
  active: boolean;
  items: AxisTimeItem[];
  onOpen: (route: string) => void;
}) {
  const meta = TIME_META[plan.band];
  return (
    <section className={`rounded-2xl border p-4 ${active ? "border-accent bg-accent/10" : "border-border bg-surface"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">{meta.emoji} {bandLabel(plan.band)} · {plan.title}</h2>
          <p className="mt-0.5 text-sm text-text-muted">{plan.note}</p>
        </div>
        <span className="shrink-0 text-xs text-text-muted">{meta.range[0]}-{meta.range[1]}시</span>
      </div>
      <div className="mt-3 grid gap-2">
        {items.slice(0, 3).map(item => (
          <button
            key={item.id}
            onClick={() => onOpen(item.route)}
            className={`rounded-xl border p-3 text-left ${item.personalized ? "border-accent/60 bg-accent/10" : "border-border bg-surface-2"}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{item.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="font-medium truncate">{item.title}</div>
                  {item.personalized && <span className="shrink-0 text-xs text-accent-strong">맞춤</span>}
                </div>
                <p className="mt-0.5 text-xs text-text-muted line-clamp-2">{item.subtitle}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] ${item.status.className}`}>{item.status.label}</span>
                  <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] text-text-muted">{item.meta}</span>
                </div>
              </div>
              <span className="text-text-muted">→</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function buildIntermediateTimeItems(
  plan: TimePlan,
  topics: string[],
  dialogueProgress: ReturnType<typeof useStore.getState>["dialogueProgress"],
  readingProgress: ReturnType<typeof useStore.getState>["intermediateReadingProgress"],
): AxisTimeItem[] {
  const dialogues = DIALOGUE_LESSONS.map(dialogue => {
    const text = dialogueText(dialogue);
    const score = keywordScore(text, plan.keywords) + axisTopicScore(text, topics);
    return {
      id: dialogue.id,
      emoji: dialogue.emoji ?? "💬",
      title: dialogue.title,
      subtitle: dialogue.subtitle,
      route: `/dialogue/${dialogue.id}`,
      meta: `대화 암송 · ${dialogue.turns.length}턴`,
      status: progressStatus(dialogueProgress[dialogue.id]?.completed, dialogueProgress[dialogue.id]?.practiceCount ?? 0),
      personalized: axisTopicScore(text, topics) > 0,
      score,
    };
  });

  const readings = INTERMEDIATE_READING_LESSONS.map(lesson => {
    const text = readingText(lesson);
    const score = keywordScore(text, plan.keywords) + axisTopicScore(text, topics);
    return {
      id: lesson.id,
      emoji: lesson.emoji ?? "📰",
      title: lesson.title,
      subtitle: lesson.subtitle,
      route: `/intermediate-reading/${lesson.id}`,
      meta: `${INTERMEDIATE_SOURCE_PROFILE_BY_ID[lesson.sourceProfileId]?.label ?? "중급 리딩"} · ${lesson.estimatedMinutes}분`,
      status: progressStatus(readingProgress[lesson.id]?.completed, readingProgress[lesson.id]?.listenCount ?? 0),
      personalized: axisTopicScore(text, topics) > 0,
      score,
    };
  });

  return [...dialogues, ...readings].sort((a, b) => b.score - a.score);
}

function buildAdvancedTimeItems(
  plan: TimePlan,
  topics: string[],
  articles: AdvancedArticle[],
  progress: ReturnType<typeof useStore.getState>["advancedArticleProgress"],
  personalizedArticles: AdvancedArticle[],
): AxisTimeItem[] {
  return articles.map(article => {
    const text = advancedText(article);
    const score = keywordScore(text, plan.keywords) + axisTopicScore(text, topics);
    return {
      id: article.id,
      emoji: categoryEmoji(article.category),
      title: article.title,
      subtitle: article.subtitle,
      route: `/advanced/article/${article.id}`,
      meta: `${categoryLabel(article.category)} · ${article.estimatedMinutes}분`,
      status: advancedStatus(progress[article.id]),
      personalized: personalizedArticles.some(item => item.id === article.id) || axisTopicScore(text, topics) > 0,
      score,
    };
  }).sort((a, b) => b.score - a.score);
}

function keywordScore(text: string, keywords: string[]) {
  const normalized = text.toLowerCase();
  return keywords.reduce((score, keyword) => score + (normalized.includes(keyword.toLowerCase()) ? 1 : 0), 0);
}

function dialogueText(dialogue: (typeof DIALOGUE_LESSONS)[number]) {
  return `${dialogue.title} ${dialogue.subtitle} ${dialogue.situation} ${dialogue.targetFunctions.join(" ")} ${dialogue.turns.map(turn => `${turn.en} ${turn.ko} ${turn.functionTags?.join(" ") ?? ""}`).join(" ")}`;
}

function readingText(lesson: (typeof INTERMEDIATE_READING_LESSONS)[number]) {
  return `${lesson.title} ${lesson.subtitle} ${lesson.topicTags.join(" ")} ${lesson.skillFocus.join(" ")} ${lesson.sourceUseNoteKo} ${lesson.body} ${lesson.shadowingSentences.join(" ")} ${lesson.writingPrompt} ${lesson.speakingPrompt}`;
}

function advancedText(article: AdvancedArticle) {
  return `${article.title} ${article.subtitle} ${article.summaryKo} ${article.category} ${article.interestTags?.join(" ") ?? ""} ${article.trendLabelKo ?? ""} ${article.sourceNoteKo ?? ""} ${article.body} ${article.debate.question} ${article.writingPrompt} ${article.speakingPrompt}`;
}
