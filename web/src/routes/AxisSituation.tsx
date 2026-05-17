import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ADVANCED_ARTICLES } from "@shared/data/advanced.seed";
import { DIALOGUE_LESSONS } from "@shared/data/dialogues.seed";
import {
  INTERMEDIATE_READING_LESSONS,
  INTERMEDIATE_SOURCE_PROFILE_BY_ID,
} from "@shared/data/intermediate-readings.seed";
import { PHRASES } from "@shared/data/phrases.seed";
import { LESSONS } from "@shared/data/stages.seed";
import { SITUATION_META } from "@shared/data/taxonomy";
import type { AdvancedArticle, SituationTag } from "@shared/types/schema";
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
  sortByPersonalization,
  type AxisStatus,
} from "../lib/course-axis";
import { useStore } from "../lib/store";

const GROUPS: Record<string, string> = {
  morning:  "🌅 아침",
  transit:  "🚌 이동",
  work:     "💼 일·회의",
  midday:   "☀️ 낮·식사",
  evening:  "🌆 저녁",
  night:    "🌙 밤",
};

type SituationContext = {
  id: string;
  title: string;
  emoji: string;
  note: string;
  keywords: string[];
};

type AxisSituationItem = {
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

const INTERMEDIATE_SITUATIONS: SituationContext[] = [
  {
    id: "preference",
    title: "취향 묻기",
    emoji: "🤔",
    note: "상대의 취향을 묻고 내 선택을 자연스럽게 설명합니다.",
    keywords: ["ask-preference", "preference", "mood", "food", "weekend", "want"],
  },
  {
    id: "recommend",
    title: "추천·제안",
    emoji: "💡",
    note: "식당, 일정, 활동을 제안하고 이유를 덧붙입니다.",
    keywords: ["recommend", "suggest", "how about", "sounds good", "brand", "event"],
  },
  {
    id: "travel-help",
    title: "길 안내·여행",
    emoji: "🧭",
    note: "길 묻기, 이동 설명, 여행 중 도움 요청을 연습합니다.",
    keywords: ["directions", "museum", "station", "airport", "travel", "route"],
  },
  {
    id: "work-update",
    title: "업무 업데이트",
    emoji: "💼",
    note: "진행 상황, 지연 이유, 다음 단계를 짧게 말합니다.",
    keywords: ["work", "update", "draft", "numbers", "help", "review", "business"],
  },
  {
    id: "gist-reading",
    title: "요지 파악",
    emoji: "📰",
    note: "중급 뉴스형 글에서 핵심 주장과 이유를 먼저 잡습니다.",
    keywords: ["gist", "main idea", "summary", "reading", "news", "society", "global"],
  },
  {
    id: "shadowing",
    title: "쉐도잉·말하기",
    emoji: "🎙️",
    note: "짧은 문장을 따라 말한 뒤 내 의견으로 확장합니다.",
    keywords: ["shadowing", "speaking", "listening", "explain", "opinion", "sentence"],
  },
];

const ADVANCED_SITUATIONS: SituationContext[] = [
  {
    id: "debate",
    title: "토론 입장 만들기",
    emoji: "⚖️",
    note: "찬반 입장과 균형 잡힌 결론을 구성합니다.",
    keywords: ["debate", "should", "stance", "argument", "risk", "benefit"],
  },
  {
    id: "work-opinion",
    title: "업무 의견 제시",
    emoji: "💼",
    note: "업무 도구, 피드백, 근무 방식에 대한 의견을 말합니다.",
    keywords: ["work", "meeting", "feedback", "company", "policy", "team"],
  },
  {
    id: "news-analysis",
    title: "뉴스 분석",
    emoji: "🗞️",
    note: "글로벌 이슈의 배경, 이해관계, 공공 위험을 분석합니다.",
    keywords: ["news", "public", "global", "infrastructure", "climate", "platform"],
  },
  {
    id: "social-issue",
    title: "사회 이슈 연결",
    emoji: "🌐",
    note: "기술, 돌봄, 도시 생활을 사람과 제도의 문제로 확장합니다.",
    keywords: ["society", "people", "care", "city", "education", "human", "community"],
  },
  {
    id: "writing",
    title: "작문 피드백",
    emoji: "✍️",
    note: "긴 글의 논점을 4-5문장 의견문으로 압축합니다.",
    keywords: ["write", "writing", "sentence", "explain", "propose", "opinion"],
  },
  {
    id: "speaking",
    title: "1분 발화 평가",
    emoji: "🎤",
    note: "장점, 위험, 조건을 넣어 1분 의견을 말합니다.",
    keywords: ["speaking", "one-minute", "opinion", "delivery", "clarity", "structure"],
  },
];

export function AxisSituation() {
  const level = useStore(s => s.currentCourseLevel ?? "beginner");
  if (level === "intermediate") return <IntermediateAxisSituation />;
  if (level === "advanced") return <AdvancedAxisSituation />;
  return <BeginnerAxisSituation />;
}

function BeginnerAxisSituation() {
  const nav = useNavigate();
  const keys = Object.keys(SITUATION_META) as SituationTag[];

  const byGroup = keys.reduce<Record<string, SituationTag[]>>((acc, k) => {
    const g = SITUATION_META[k].group;
    (acc[g] ??= []).push(k);
    return acc;
  }, {});

  function firstLessonFor(s: SituationTag) {
    return LESSONS.find(l => l.coords.situations?.includes(s));
  }

  return (
    <div className="px-5 pt-6 pb-4 flex flex-col gap-4">
      <AxisHeader title="🎬 Scene Library" level="Stage 1 · 초급" />

      {Object.entries(byGroup).map(([g, items]) => (
        <section key={g}>
          <h2 className="text-xs text-text-muted font-semibold mb-2">{GROUPS[g] ?? g}</h2>
          <div className="flex flex-wrap gap-2">
            {items.map(s => {
              const m = SITUATION_META[s];
              const n = PHRASES.filter(p => p.coords.situations?.includes(s)).length;
              const lesson = firstLessonFor(s);
              return (
                <button
                  key={s}
                  disabled={!lesson}
                  onClick={() => lesson && nav(`/lesson/${lesson.id}`)}
                  className={`rounded-xl border px-3 py-2 text-sm bg-surface ${lesson ? "border-border active:scale-95" : "border-border opacity-50"}`}
                >
                  <span className="text-base mr-1">{m.emoji}</span>
                  {m.ko}
                  {n > 0 && <span className="text-[10px] text-text-muted ml-1">({n})</span>}
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function IntermediateAxisSituation() {
  const nav = useNavigate();
  const dialogueProgress = useStore(s => s.dialogueProgress ?? {});
  const readingProgress = useStore(s => s.intermediateReadingProgress ?? {});
  const insight = useStore(s => s.learnerProfile?.journalInsight);
  const topics = activeAxisTopics(insight);
  const situations = useMemo(() => sortByPersonalization(
    INTERMEDIATE_SITUATIONS,
    situation => axisTopicScore(`${situation.title} ${situation.note} ${situation.keywords.join(" ")}`, topics),
  ), [topics]);

  const itemsBySituation = useMemo(() => Object.fromEntries(situations.map(situation => {
    const dialogueItems: AxisSituationItem[] = DIALOGUE_LESSONS
      .filter(dialogue => keywordScore(dialogueText(dialogue), situation.keywords) > 0)
      .map(dialogue => {
        const text = dialogueText(dialogue);
        return {
          id: dialogue.id,
          emoji: dialogue.emoji ?? "💬",
          title: dialogue.title,
          subtitle: dialogue.subtitle,
          route: `/dialogue/${dialogue.id}`,
          meta: `대화 암송 · ${dialogue.turns.length}턴`,
          status: progressStatus(dialogueProgress[dialogue.id]?.completed, dialogueProgress[dialogue.id]?.practiceCount ?? 0),
          personalized: axisTopicScore(text, topics) > 0,
          score: axisTopicScore(text, topics) + keywordScore(text, situation.keywords),
        };
      });

    const readingItems: AxisSituationItem[] = INTERMEDIATE_READING_LESSONS
      .filter(lesson => keywordScore(readingText(lesson), situation.keywords) > 0)
      .map(lesson => {
        const text = readingText(lesson);
        return {
          id: lesson.id,
          emoji: lesson.emoji ?? "📰",
          title: lesson.title,
          subtitle: lesson.subtitle,
          route: `/intermediate-reading/${lesson.id}`,
          meta: `${INTERMEDIATE_SOURCE_PROFILE_BY_ID[lesson.sourceProfileId]?.label ?? "중급 리딩"} · ${lesson.estimatedMinutes}분`,
          status: progressStatus(readingProgress[lesson.id]?.completed, readingProgress[lesson.id]?.listenCount ?? 0),
          personalized: axisTopicScore(text, topics) > 0,
          score: axisTopicScore(text, topics) + keywordScore(text, situation.keywords),
        };
      });

    return [situation.id, [...dialogueItems, ...readingItems].sort((a, b) => b.score - a.score)];
  })), [dialogueProgress, readingProgress, situations, topics]);

  return (
    <div className="px-5 pt-6 pb-4 flex flex-col gap-4">
      <AxisHeader title="🎬 중급 상황별 학습" level={axisLevelTitle("intermediate")} />
      <TopicNotice topics={topics} fallback="낙서장 관심사에 맞춰 상황별 대화와 리딩 순서가 바뀝니다." />
      {situations.map(situation => (
        <SituationSection
          key={situation.id}
          situation={situation}
          items={(itemsBySituation[situation.id] ?? []) as AxisSituationItem[]}
          onOpen={route => nav(route)}
        />
      ))}
    </div>
  );
}

function AdvancedAxisSituation() {
  const nav = useNavigate();
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
  const situations = useMemo(() => sortByPersonalization(
    ADVANCED_SITUATIONS,
    situation => axisTopicScore(`${situation.title} ${situation.note} ${situation.keywords.join(" ")}`, topics),
  ), [topics]);

  const itemsBySituation = useMemo(() => Object.fromEntries(situations.map(situation => {
    const items: AxisSituationItem[] = orderedArticles
      .filter(article => keywordScore(advancedText(article), situation.keywords) > 0)
      .map(article => {
        const text = advancedText(article);
        return {
          id: article.id,
          emoji: categoryEmoji(article.category),
          title: article.title,
          subtitle: article.subtitle,
          route: `/advanced/article/${article.id}`,
          meta: `${categoryLabel(article.category)} · ${article.estimatedMinutes}분`,
          status: advancedStatus(progress[article.id]),
          personalized: plan.personalizedArticles.some(item => item.id === article.id) || axisTopicScore(text, topics) > 0,
          score: axisTopicScore(text, topics) + keywordScore(text, situation.keywords),
        };
      })
      .sort((a, b) => b.score - a.score);
    return [situation.id, items];
  })), [orderedArticles, plan.personalizedArticles, progress, situations, topics]);

  return (
    <div className="px-5 pt-6 pb-4 flex flex-col gap-4">
      <AxisHeader title="🎬 상급 상황별 미션" level={axisLevelTitle("advanced")} />
      <TopicNotice topics={topics} fallback="낙서장 관심사와 사용패턴에 따라 토론·작문·발화 미션 순서가 바뀝니다." />
      {situations.map(situation => (
        <SituationSection
          key={situation.id}
          situation={situation}
          items={(itemsBySituation[situation.id] ?? []) as AxisSituationItem[]}
          onOpen={route => nav(route)}
        />
      ))}
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
      <p className="mt-1 text-text-muted">{topics.length ? `관심 주제 ${topics.slice(0, 3).join(", ")}를 먼저 고려합니다.` : fallback}</p>
    </section>
  );
}

function SituationSection({
  situation,
  items,
  onOpen,
}: {
  situation: SituationContext;
  items: AxisSituationItem[];
  onOpen: (route: string) => void;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-3xl">{situation.emoji}</span>
          <div>
            <h2 className="font-semibold">{situation.title}</h2>
            <p className="mt-0.5 text-sm text-text-muted">{situation.note}</p>
          </div>
        </div>
        <span className="shrink-0 text-xs text-text-muted">{items.length}개</span>
      </div>
      <div className="mt-3 grid gap-2">
        {items.length === 0 && <div className="rounded-xl bg-surface-2 p-3 text-sm text-text-muted">이 상황에 맞는 콘텐츠가 아직 없습니다.</div>}
        {items.slice(0, 4).map(item => (
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

function keywordScore(text: string, keywords: string[]) {
  const normalized = text.toLowerCase();
  return keywords.reduce((score, keyword) => score + (normalized.includes(keyword.toLowerCase()) ? 1 : 0), 0);
}

function dialogueText(dialogue: (typeof DIALOGUE_LESSONS)[number]) {
  return `${dialogue.title} ${dialogue.subtitle} ${dialogue.situation} ${dialogue.targetFunctions.join(" ")} ${dialogue.turns.map(turn => `${turn.en} ${turn.ko} ${turn.functionTags?.join(" ") ?? ""}`).join(" ")}`;
}

function readingText(lesson: (typeof INTERMEDIATE_READING_LESSONS)[number]) {
  return `${lesson.title} ${lesson.subtitle} ${lesson.topicTags.join(" ")} ${lesson.skillFocus.join(" ")} ${lesson.sourceUseNoteKo} ${lesson.body} ${lesson.shadowingSentences.join(" ")} ${lesson.speakingPrompt}`;
}

function advancedText(article: AdvancedArticle) {
  return `${article.title} ${article.subtitle} ${article.summaryKo} ${article.category} ${article.interestTags?.join(" ") ?? ""} ${article.trendLabelKo ?? ""} ${article.sourceNoteKo ?? ""} ${article.body} ${article.debate.question} ${article.writingPrompt} ${article.speakingPrompt}`;
}
