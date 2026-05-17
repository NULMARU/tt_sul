import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ADVANCED_ARTICLES } from "@shared/data/advanced.seed";
import { DIALOGUE_LESSONS } from "@shared/data/dialogues.seed";
import {
  INTERMEDIATE_READING_LESSONS,
  INTERMEDIATE_SOURCE_PROFILE_BY_ID,
} from "@shared/data/intermediate-readings.seed";
import { PHRASES } from "@shared/data/phrases.seed";
import { LESSONS } from "@shared/data/stages.seed";
import { PLACE_META } from "@shared/data/taxonomy";
import type { AdvancedArticle, PlaceTag } from "@shared/types/schema";
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

type PlaceContext = {
  id: string;
  title: string;
  emoji: string;
  note: string;
  keywords: string[];
};

type AxisPlaceItem = {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  route: string;
  meta: string;
  status: AxisStatus;
  personalized?: boolean;
};

const INTERMEDIATE_PLACE_CONTEXTS: PlaceContext[] = [
  {
    id: "city-travel",
    title: "도시·여행",
    emoji: "🗺️",
    note: "길 안내, 박물관, 공항처럼 실제 이동 장면에서 말하기를 연결합니다.",
    keywords: ["museum", "airport", "hotel", "directions", "travel", "city", "station"],
  },
  {
    id: "food-local",
    title: "음식·동네",
    emoji: "🍽️",
    note: "식당 추천, 시장, 카페처럼 취향을 묻고 설명하는 장면입니다.",
    keywords: ["food", "dinner", "restaurant", "market", "cafe", "coffee", "noodle"],
  },
  {
    id: "work-social",
    title: "업무·사회",
    emoji: "💼",
    note: "짧은 업무 업데이트와 사회·생활 주제 리딩을 묶습니다.",
    keywords: ["work", "update", "business", "society", "journal", "community"],
  },
  {
    id: "tech-world",
    title: "기술·세계",
    emoji: "🔭",
    note: "기술, 환경, 우주처럼 뉴스형 독해로 확장하기 좋은 장소 축입니다.",
    keywords: ["technology", "space", "battery", "bus", "climate", "rain", "global"],
  },
];

const ADVANCED_PLACE_CONTEXTS: PlaceContext[] = [
  {
    id: "workplace",
    title: "업무 현장",
    emoji: "💼",
    note: "회의, 피드백, 근무 방식처럼 직장 토론에 바로 쓰는 글입니다.",
    keywords: ["work", "meeting", "feedback", "company", "week", "data"],
  },
  {
    id: "global-newsroom",
    title: "뉴스룸",
    emoji: "🗞️",
    note: "글로벌 이슈를 읽고 찬반 논점으로 바꿉니다.",
    keywords: ["news", "global", "platform", "space", "climate", "city", "public"],
  },
  {
    id: "tech-lab",
    title: "기술·우주 랩",
    emoji: "🛰️",
    note: "AI, 우주산업, 로봇처럼 관심사 기반 상급 주제를 다룹니다.",
    keywords: ["ai", "technology", "space", "satellite", "robot", "data", "infrastructure"],
  },
  {
    id: "community-life",
    title: "지역·생활",
    emoji: "🏙️",
    note: "동네 가게, 도시 생활, 돌봄처럼 사회적 관점을 말합니다.",
    keywords: ["shop", "local", "community", "city", "care", "people", "neighborhood"],
  },
  {
    id: "wellbeing",
    title: "회복·건강",
    emoji: "🌿",
    note: "디지털 휴식, 폭염, 회복 시간처럼 삶의 패턴과 연결합니다.",
    keywords: ["health", "rest", "offline", "heat", "care", "wellbeing", "recovery"],
  },
];

export function AxisPlace() {
  const level = useStore(s => s.currentCourseLevel ?? "beginner");
  if (level === "intermediate") return <IntermediateAxisPlace />;
  if (level === "advanced") return <AdvancedAxisPlace />;
  return <BeginnerAxisPlace />;
}

function BeginnerAxisPlace() {
  const nav = useNavigate();
  const [sel, setSel] = useState<PlaceTag | null>(null);

  const placeKeys = Object.keys(PLACE_META) as PlaceTag[];
  const home = placeKeys.filter(k => PLACE_META[k].group === "home");
  const city = placeKeys.filter(k => PLACE_META[k].group === "city");

  function phrasesIn(place: PlaceTag) {
    return PHRASES.filter(p => p.coords.places?.includes(place));
  }
  function lessonsIn(place: PlaceTag) {
    return LESSONS.filter(l => l.coords.places?.includes(place));
  }

  return (
    <div className="px-5 pt-6 pb-4 flex flex-col gap-4">
      <AxisHeader title="🗺️ 장소" level="Stage 1 · 초급" />

      <BeginnerSection title="🏠 집" places={home} PlaceBtn={PlaceButton(setSel, phrasesIn)} />
      <BeginnerSection title="🏙️ 도시" places={city} PlaceBtn={PlaceButton(setSel, phrasesIn)} />

      {sel && (
        <div className="rounded-2xl border border-border bg-surface p-4 mt-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{PLACE_META[sel].emoji}</span>
            <h2 className="font-semibold">{PLACE_META[sel].ko}</h2>
            <span className="text-xs text-text-muted ml-auto">표현 {phrasesIn(sel).length}개</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {phrasesIn(sel).slice(0, 12).map(p => (
              <span key={p.id} className="text-xs en rounded-full bg-surface-2 border border-border px-2 py-1">{p.en}</span>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-1.5">
            {lessonsIn(sel).slice(0, 4).map(l => (
              <button key={l.id} onClick={() => nav(`/lesson/${l.id}`)} className="text-left text-sm rounded-lg bg-surface-2 border border-border px-3 py-2">
                ▶ {l.title} — {l.subtitle}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function IntermediateAxisPlace() {
  const nav = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const dialogueProgress = useStore(s => s.dialogueProgress ?? {});
  const readingProgress = useStore(s => s.intermediateReadingProgress ?? {});
  const insight = useStore(s => s.learnerProfile?.journalInsight);
  const topics = activeAxisTopics(insight);

  const contexts = useMemo(() => sortByPersonalization(
    INTERMEDIATE_PLACE_CONTEXTS,
    context => axisTopicScore(`${context.title} ${context.note} ${context.keywords.join(" ")}`, topics),
  ), [topics]);
  const selectedContext = contexts.find(context => context.id === selected) ?? contexts[0];

  const items = useMemo(() => {
    if (!selectedContext) return [];
    const dialogueItems = DIALOGUE_LESSONS
      .filter(dialogue => keywordScore(dialogueText(dialogue), selectedContext.keywords) > 0)
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
          score: axisTopicScore(text, topics) + keywordScore(text, selectedContext.keywords),
        };
      });

    const readingItems = INTERMEDIATE_READING_LESSONS
      .filter(lesson => keywordScore(readingText(lesson), selectedContext.keywords) > 0)
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
          score: axisTopicScore(text, topics) + keywordScore(text, selectedContext.keywords),
        };
      });

    return [...dialogueItems, ...readingItems].sort((a, b) => b.score - a.score);
  }, [dialogueProgress, readingProgress, selectedContext, topics]);

  return (
    <div className="px-5 pt-6 pb-4 flex flex-col gap-4">
      <AxisHeader title="🗺️ 장소별 중급 루프" level={axisLevelTitle("intermediate")} />
      <TopicNotice topics={topics} fallback="낙서장 관심사에 맞춰 장소 축의 대화와 리딩 순서가 바뀝니다." />
      <ContextGrid contexts={contexts} selectedId={selectedContext?.id} countFor={context => countIntermediatePlaceItems(context)} onSelect={setSelected} />
      {selectedContext && (
        <ContentPanel
          context={selectedContext}
          items={items}
          emptyText="이 장소 축에 맞는 중급 콘텐츠가 아직 없습니다."
          onOpen={route => nav(route)}
        />
      )}
    </div>
  );
}

function AdvancedAxisPlace() {
  const nav = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
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
  const contexts = useMemo(() => sortByPersonalization(
    ADVANCED_PLACE_CONTEXTS,
    context => axisTopicScore(`${context.title} ${context.note} ${context.keywords.join(" ")}`, topics),
  ), [topics]);
  const selectedContext = contexts.find(context => context.id === selected) ?? contexts[0];

  const items = useMemo(() => {
    if (!selectedContext) return [];
    return orderedArticles
      .filter(article => keywordScore(advancedText(article), selectedContext.keywords) > 0)
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
          score: axisTopicScore(text, topics) + keywordScore(text, selectedContext.keywords),
        };
      })
      .sort((a, b) => b.score - a.score);
  }, [orderedArticles, plan.personalizedArticles, progress, selectedContext, topics]);

  return (
    <div className="px-5 pt-6 pb-4 flex flex-col gap-4">
      <AxisHeader title="🗺️ 장소별 상급 이슈" level={axisLevelTitle("advanced")} />
      <TopicNotice topics={topics} fallback="낙서장 관심사와 최근 생성 주제를 기준으로 상급 글 순서가 바뀝니다." />
      <ContextGrid contexts={contexts} selectedId={selectedContext?.id} countFor={context => countAdvancedPlaceItems(orderedArticles, context)} onSelect={setSelected} />
      {selectedContext && (
        <ContentPanel
          context={selectedContext}
          items={items}
          emptyText="이 장소 축에 맞는 상급 글이 아직 없습니다."
          onOpen={route => nav(route)}
        />
      )}
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
      <p className="mt-1 text-text-muted">{topics.length ? `관심 주제 ${topics.slice(0, 3).join(", ")}와 생활 패턴을 먼저 고려합니다.` : fallback}</p>
    </section>
  );
}

function ContextGrid({
  contexts,
  selectedId,
  countFor,
  onSelect,
}: {
  contexts: PlaceContext[];
  selectedId?: string;
  countFor: (context: PlaceContext) => number;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="grid grid-cols-2 gap-2">
      {contexts.map(context => {
        const active = context.id === selectedId;
        return (
          <button
            key={context.id}
            onClick={() => onSelect(context.id)}
            className={`rounded-2xl border p-3 text-left active:scale-[0.99] ${active ? "border-accent bg-accent/10" : "border-border bg-surface"}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-2xl">{context.emoji}</span>
              <span className="text-xs text-text-muted">{countFor(context)}개</span>
            </div>
            <div className="mt-2 font-semibold">{context.title}</div>
            <p className="mt-1 text-xs text-text-muted line-clamp-2">{context.note}</p>
          </button>
        );
      })}
    </section>
  );
}

function ContentPanel({
  context,
  items,
  emptyText,
  onOpen,
}: {
  context: PlaceContext;
  items: AxisPlaceItem[];
  emptyText: string;
  onOpen: (route: string) => void;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start gap-3">
        <span className="text-3xl">{context.emoji}</span>
        <div>
          <h2 className="font-semibold">{context.title}</h2>
          <p className="mt-0.5 text-sm text-text-muted">{context.note}</p>
        </div>
      </div>
      <div className="mt-3 grid gap-2">
        {items.length === 0 && <div className="rounded-xl bg-surface-2 p-3 text-sm text-text-muted">{emptyText}</div>}
        {items.map(item => (
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

function BeginnerSection({ title, places, PlaceBtn }: { title: string; places: PlaceTag[]; PlaceBtn: (p: PlaceTag) => JSX.Element }) {
  return (
    <section>
      <h2 className="text-xs text-text-muted font-semibold mb-2">{title}</h2>
      <div className="grid grid-cols-4 gap-2">
        {places.map(PlaceBtn)}
      </div>
    </section>
  );
}

function PlaceButton(setSel: (p: PlaceTag) => void, phrasesIn: (p: PlaceTag) => unknown[]) {
  return (p: PlaceTag) => {
    const m = PLACE_META[p];
    const n = phrasesIn(p).length;
    const intensity = Math.min(1, n / 12);
    return (
      <button
        key={p}
        onClick={() => setSel(p)}
        className="aspect-square rounded-xl border border-border bg-surface flex flex-col items-center justify-center gap-0.5 active:scale-95"
        style={{ backgroundColor: `rgba(245,200,66,${0.05 + intensity * 0.25})` }}
      >
        <span className="text-2xl">{m.emoji}</span>
        <span className="text-[11px] text-text-muted">{m.ko}</span>
        {n > 0 && <span className="text-[10px] text-text-muted">{n}</span>}
      </button>
    );
  };
}

function countIntermediatePlaceItems(context: PlaceContext) {
  return DIALOGUE_LESSONS.filter(dialogue => keywordScore(dialogueText(dialogue), context.keywords) > 0).length
    + INTERMEDIATE_READING_LESSONS.filter(lesson => keywordScore(readingText(lesson), context.keywords) > 0).length;
}

function countAdvancedPlaceItems(articles: AdvancedArticle[], context: PlaceContext) {
  return articles.filter(article => keywordScore(advancedText(article), context.keywords) > 0).length;
}

function keywordScore(text: string, keywords: string[]) {
  const normalized = text.toLowerCase();
  return keywords.reduce((score, keyword) => score + (normalized.includes(keyword.toLowerCase()) ? 1 : 0), 0);
}

function dialogueText(dialogue: (typeof DIALOGUE_LESSONS)[number]) {
  return `${dialogue.title} ${dialogue.subtitle} ${dialogue.situation} ${dialogue.targetFunctions.join(" ")} ${dialogue.turns.map(turn => `${turn.en} ${turn.ko} ${turn.functionTags?.join(" ") ?? ""}`).join(" ")}`;
}

function readingText(lesson: (typeof INTERMEDIATE_READING_LESSONS)[number]) {
  return `${lesson.title} ${lesson.subtitle} ${lesson.topicTags.join(" ")} ${lesson.skillFocus.join(" ")} ${lesson.sourceUseNoteKo} ${lesson.body}`;
}

function advancedText(article: AdvancedArticle) {
  return `${article.title} ${article.subtitle} ${article.summaryKo} ${article.category} ${article.interestTags?.join(" ") ?? ""} ${article.trendLabelKo ?? ""} ${article.sourceNoteKo ?? ""} ${article.body}`;
}
