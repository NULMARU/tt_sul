import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ADVANCED_ARTICLES } from "@shared/data/advanced.seed";
import { DIALOGUE_LESSONS } from "@shared/data/dialogues.seed";
import {
  INTERMEDIATE_READING_LESSONS,
  INTERMEDIATE_SOURCE_PROFILE_BY_ID,
} from "@shared/data/intermediate-readings.seed";
import { LESSONS } from "@shared/data/stages.seed";
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
} from "../lib/course-axis";
import { buildPersonalizedAdvancedPlan } from "../lib/advanced-personalization";
import { useStore } from "../lib/store";

const WEEKS = [
  { range: [1, 7],  title: "WEEK 1 · 데일리 동작" },
  { range: [8, 14], title: "WEEK 2 · 일상생활" },
  { range: [15, 21],title: "WEEK 3 · 상태 표현" },
  { range: [22, 28],title: "WEEK 4 · 문장 패턴" },
  { range: [29, 30],title: "WEEK 5 · 종합 실전" },
];

export function AxisDay() {
  const level = useStore(s => s.currentCourseLevel ?? "beginner");
  if (level === "intermediate") return <IntermediateAxisDay />;
  if (level === "advanced") return <AdvancedAxisDay />;
  return <BeginnerAxisDay />;
}

function BeginnerAxisDay() {
  const nav = useNavigate();
  const progress = useStore(s => s.lessonProgress);

  return (
    <div className="px-5 pt-6 pb-4 flex flex-col gap-4">
      <AxisHeader title="📅 30일 트랙" level="Stage 1 · 초급" />

      {WEEKS.map(w => (
        <section key={w.title}>
          <h2 className="text-xs text-text-muted font-semibold mb-2">{w.title}</h2>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: w.range[1] - w.range[0] + 1 }, (_, i) => {
              const day = w.range[0] + i;
              const lesson = LESSONS.find(l => l.day === day);
              const done = lesson && progress[lesson.id]?.completed;
              const exists = !!lesson;
              return (
                <button
                  key={day}
                  disabled={!exists}
                  onClick={() => lesson && nav(`/lesson/${lesson.id}`)}
                  className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center text-sm font-semibold transition-all ${
                    !exists      ? "border-border bg-surface-2 opacity-40" :
                    done         ? "border-success bg-success/15 text-success" :
                                   "border-accent/40 bg-accent/10 hover:bg-accent/20"
                  }`}
                >
                  <span>{day}</span>
                  <span className="text-xs">{!exists ? "🔒" : done ? "✅" : "▶"}</span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function IntermediateAxisDay() {
  const nav = useNavigate();
  const dialogueProgress = useStore(s => s.dialogueProgress ?? {});
  const readingProgress = useStore(s => s.intermediateReadingProgress ?? {});
  const insight = useStore(s => s.learnerProfile?.journalInsight);
  const topics = activeAxisTopics(insight);

  const dialogueItems = useMemo(() => sortByPersonalization(DIALOGUE_LESSONS, dialogue =>
    axisTopicScore(`${dialogue.title} ${dialogue.subtitle} ${dialogue.situation} ${dialogue.targetFunctions.join(" ")}`, topics),
  ), [topics]);

  const readingItems = useMemo(() => sortByPersonalization(INTERMEDIATE_READING_LESSONS, lesson =>
    axisTopicScore(`${lesson.title} ${lesson.subtitle} ${lesson.topicTags.join(" ")} ${lesson.sourceUseNoteKo}`, topics),
  ), [topics]);

  const groups = [
    {
      title: "Step 1 · A/B 대화 암송",
      note: "상황을 듣고 역할을 바꿔 말합니다.",
      items: dialogueItems.map(dialogue => ({
        id: dialogue.id,
        emoji: dialogue.emoji ?? "💬",
        title: dialogue.title,
        subtitle: dialogue.subtitle,
        route: `/dialogue/${dialogue.id}`,
        status: progressStatus(dialogueProgress[dialogue.id]?.completed, dialogueProgress[dialogue.id]?.practiceCount ?? 0),
        meta: `${dialogue.turns.length}턴 · 연습 ${dialogueProgress[dialogue.id]?.practiceCount ?? 0}회`,
        personalized: axisTopicScore(`${dialogue.title} ${dialogue.subtitle} ${dialogue.situation}`, topics) > 0,
      })),
    },
    {
      title: "Step 2 · 뉴스형 리딩·리스닝",
      note: "요지, 어휘, 쉐도잉, 짧은 말하기로 확장합니다.",
      items: readingItems.map(lesson => ({
        id: lesson.id,
        emoji: lesson.emoji ?? "📰",
        title: lesson.title,
        subtitle: lesson.subtitle,
        route: `/intermediate-reading/${lesson.id}`,
        status: progressStatus(readingProgress[lesson.id]?.completed, readingProgress[lesson.id]?.listenCount ?? 0),
        meta: `${INTERMEDIATE_SOURCE_PROFILE_BY_ID[lesson.sourceProfileId]?.label ?? "중급 리딩"} · ${lesson.estimatedMinutes}분`,
        personalized: axisTopicScore(`${lesson.title} ${lesson.subtitle} ${lesson.topicTags.join(" ")}`, topics) > 0,
      })),
    },
  ];

  return (
    <div className="px-5 pt-6 pb-4 flex flex-col gap-4">
      <AxisHeader title="📅 중급 학습 순서" level={axisLevelTitle("intermediate")} />
      <TopicNotice topics={topics} fallback="낙서장 관심사에 맞춰 대화와 리딩 순서가 바뀝니다." />
      {groups.map(group => (
        <section key={group.title} className="rounded-2xl border border-border bg-surface p-4">
          <h2 className="font-semibold">{group.title}</h2>
          <p className="mt-0.5 text-sm text-text-muted">{group.note}</p>
          <div className="mt-3 grid gap-2">
            {group.items.map(item => (
              <AxisItemButton key={item.id} item={item} onOpen={() => nav(item.route)} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function AdvancedAxisDay() {
  const nav = useNavigate();
  const progress = useStore(s => s.advancedArticleProgress ?? {});
  const generated = useStore(s => s.generatedAdvancedArticles ?? []);
  const insight = useStore(s => s.learnerProfile?.journalInsight);
  const articles = useMemo(() => mergeAdvancedArticles(generated, ADVANCED_ARTICLES), [generated]);
  const plan = buildPersonalizedAdvancedPlan(articles, insight);
  const topics = activeAxisTopics(insight);
  const orderedArticles = [...plan.personalizedArticles, ...plan.generalArticles].filter((article, index, arr) =>
    arr.findIndex(item => item.id === article.id) === index,
  );

  const groups = [
    { id: "read", title: "Step 1 · 긴 글 읽기", note: "요약과 고급 표현을 먼저 잡습니다." },
    { id: "debate", title: "Step 2 · 토론 관점 만들기", note: "찬반 입장과 유용한 프레임을 정리합니다." },
    { id: "write-speak", title: "Step 3 · 작문·발화 평가", note: "내 의견을 쓰고 1분 발화로 바꿉니다." },
  ];

  return (
    <div className="px-5 pt-6 pb-4 flex flex-col gap-4">
      <AxisHeader title="📅 상급 학습 순서" level={axisLevelTitle("advanced")} />
      <TopicNotice topics={topics} fallback="낙서장 관심사에 따라 글과 토론 순서가 바뀝니다." />
      {groups.map((group, groupIndex) => (
        <section key={group.id} className="rounded-2xl border border-border bg-surface p-4">
          <h2 className="font-semibold">{group.title}</h2>
          <p className="mt-0.5 text-sm text-text-muted">{group.note}</p>
          <div className="mt-3 grid gap-2">
            {orderedArticles.slice(0, groupIndex === 0 ? 4 : 3).map(article => {
              const itemProgress = progress[article.id];
              const personalized = plan.personalizedArticles.some(item => item.id === article.id);
              const status = advancedStatus(itemProgress);
              return (
                <AxisItemButton
                  key={`${group.id}-${article.id}`}
                  item={{
                    id: article.id,
                    emoji: categoryEmoji(article.category),
                    title: article.title,
                    subtitle: article.subtitle,
                    route: `/advanced/article/${article.id}`,
                    status,
                    meta: `${categoryLabel(article.category)} · ${article.estimatedMinutes}분`,
                    personalized,
                  }}
                  onOpen={() => nav(`/advanced/article/${article.id}`)}
                />
              );
            })}
          </div>
        </section>
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

function AxisItemButton({
  item,
  onOpen,
}: {
  item: {
    id: string;
    emoji: string;
    title: string;
    subtitle: string;
    route: string;
    status: { label: string; className: string };
    meta: string;
    personalized?: boolean;
  };
  onOpen: () => void;
}) {
  return (
    <button
      onClick={onOpen}
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
  );
}
