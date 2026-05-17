import { useMemo } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ADVANCED_ARTICLES } from "@shared/data/advanced.seed";
import { DIALOGUE_LESSONS } from "@shared/data/dialogues.seed";
import { dialogueQuizIds } from "@shared/data/dialogue-quizzes";
import {
  INTERMEDIATE_READING_LESSONS,
  INTERMEDIATE_SOURCE_PROFILE_BY_ID,
} from "@shared/data/intermediate-readings.seed";
import { intermediateReadingQuizIds } from "@shared/data/intermediate-reading-quizzes";
import { PHRASES } from "@shared/data/phrases.seed";
import type { AdvancedArticle, CourseLevelId, JournalInsight } from "@shared/types/schema";
import { activePatch } from "../lib/adaptive-ui";
import { buildPersonalizedAdvancedPlan } from "../lib/advanced-personalization";
import { memoryStrength } from "../lib/srs";
import { useStore } from "../lib/store";
import { speak, waitForTtsIdle } from "../lib/tts";

export function MemoryMap() {
  const currentCourseLevel = useStore(s => s.currentCourseLevel ?? "beginner");

  if (currentCourseLevel === "intermediate") return <IntermediateMemoryMap />;
  if (currentCourseLevel === "advanced") return <AdvancedMemoryMap />;
  return <BeginnerMemoryMap />;
}

function BeginnerMemoryMap() {
  const nav = useNavigate();
  const srs = useStore(s => s.srs);
  const patches = useStore(s => s.adaptiveUiPatches);
  const customContentPhrases = useStore(s => s.customContentPhrases ?? []);
  const weakFirst = !!activePatch(patches, "memory-map", "change_default_filter");
  const allPhrases = [...PHRASES, ...customContentPhrases];
  const phrases = weakFirst ? [...allPhrases].sort((a, b) => {
    const sa = memoryStrength(srs[`q-mc-${a.id}`]);
    const sb = memoryStrength(srs[`q-mc-${b.id}`]);
    return sa - sb;
  }) : allPhrases;

  return (
    <div className="px-5 pt-6 pb-4 flex flex-col gap-3">
      <MemoryHeader title="Phrase Memory Map" level="Stage 1 · 초급" />
      <p className="text-sm text-text-muted">
        {weakFirst ? "복습이 필요한 표현부터 보여줍니다." : "표현 지도를 한눈에 봅니다."} 카드를 탭하면 발음을 들을 수 있어요.
      </p>
      <div className="rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs text-text-muted leading-relaxed">
        <b className="text-text">복습 필요</b>는 아직 맞힌 기록이 없거나 기억 강도가 낮은 표현이에요. 맞힌 기록이 쌓이면 <b className="text-text">익숙해짐</b>, <b className="text-text">기억 선명</b>으로 바뀝니다.
        {customContentPhrases.length > 0 && <div className="mt-1">승인한 보강 표현 {customContentPhrases.length}개도 함께 표시됩니다.</div>}
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {phrases.map(p => {
          const s = srs[`q-mc-${p.id}`];
          const strength = memoryStrength(s);
          const opacity = 0.18 + strength * 0.62;
          const status = memoryLabel(strength);
          return (
            <button
              key={p.id}
              className="min-h-[104px] rounded-xl border border-border flex flex-col items-start justify-between text-left px-3 py-3 active:scale-[0.99] transition-transform"
              style={{ background: `rgba(245,200,66,${opacity})` }}
              title={p.ko}
              onClick={() => speak(p.en)}
            >
              <span className="en text-[15px] leading-snug font-semibold line-clamp-2">{p.en}</span>
              <span className="text-xs text-text-muted line-clamp-2 mt-1">{p.ko}</span>
              <span className={`mt-2 rounded-full border px-2 py-0.5 text-[11px] ${status.className}`}>
                {status.label}
              </span>
            </button>
          );
        })}
      </div>

      <button onClick={async () => { await waitForTtsIdle(); nav("/review?practice=1&source=weak&n=10"); }} className="mt-2 rounded-xl bg-accent text-[#2A2522] px-4 py-3 font-medium">
        복습 필요한 표현 10개 연습 ▸
      </button>
    </div>
  );
}

function IntermediateMemoryMap() {
  const nav = useNavigate();
  const dialogueProgress = useStore(s => s.dialogueProgress ?? {});
  const readingProgress = useStore(s => s.intermediateReadingProgress ?? {});
  const attempts = useStore(s => s.quizAttempts ?? {});
  const insight = useStore(s => s.learnerProfile?.journalInsight);
  const topics = activeTopics(insight);

  const dialogueItems = useMemo(() => DIALOGUE_LESSONS
    .map(dialogue => {
      const progress = dialogueProgress[dialogue.id];
      const quizIds = dialogueQuizIds(dialogue.id);
      const quizCount = quizIds.filter(id => attempts[id]).length;
      const score = topicScore([
        dialogue.title,
        dialogue.subtitle,
        dialogue.situation,
        ...dialogue.targetFunctions,
      ].join(" "), topics);
      return { dialogue, progress, quizCount, score };
    })
    .sort((a, b) => b.score - a.score || progressRank(a.progress?.completed, a.progress?.practiceCount) - progressRank(b.progress?.completed, b.progress?.practiceCount)),
  [attempts, dialogueProgress, topics]);

  const readingItems = useMemo(() => INTERMEDIATE_READING_LESSONS
    .map(lesson => {
      const progress = readingProgress[lesson.id];
      const quizIds = intermediateReadingQuizIds(lesson.id);
      const quizCount = quizIds.filter(id => attempts[id]).length;
      const source = INTERMEDIATE_SOURCE_PROFILE_BY_ID[lesson.sourceProfileId];
      const score = topicScore([
        lesson.title,
        lesson.subtitle,
        lesson.sourceUseNoteKo,
        source?.label,
        ...lesson.topicTags,
      ].join(" "), topics);
      return { lesson, progress, quizCount, score, sourceLabel: source?.label ?? "" };
    })
    .sort((a, b) => b.score - a.score || progressRank(a.progress?.completed, a.progress?.listenCount) - progressRank(b.progress?.completed, b.progress?.listenCount)),
  [attempts, readingProgress, topics]);

  const completedDialogues = dialogueItems.filter(item => item.progress?.completed).length;
  const completedReadings = readingItems.filter(item => item.progress?.completed).length;
  const focus = dialogueItems[0]?.score >= readingItems[0]?.score ? "대화 암송" : "리딩·리스닝";

  return (
    <div className="px-5 pt-6 pb-4 flex flex-col gap-4">
      <MemoryHeader title="Stage 2 Memory Map" level="중급 · 대화 + 리딩" />
      <PersonalizationPanel
        insight={insight}
        fallback="낙서장에 관심 주제와 생활 패턴이 쌓이면 대화와 리딩 카드 순서가 자동으로 바뀝니다."
      />

      <section className="rounded-2xl border border-accent/50 bg-accent/10 p-4">
        <div className="text-xs font-semibold text-accent-strong">오늘 강화할 연결고리</div>
        <h2 className="mt-1 font-semibold">{focus}</h2>
        <p className="mt-1 text-sm text-text-muted">
          낙서장 관심사와 완료 이력을 기준으로 아직 덜 굳은 중급 출력 루프를 먼저 보여줍니다.
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Pill>대화 완료 {completedDialogues}/{DIALOGUE_LESSONS.length}</Pill>
          <Pill>리딩 완료 {completedReadings}/{INTERMEDIATE_READING_LESSONS.length}</Pill>
          {topics[0] && <Pill accent>관심 {topics[0]}</Pill>}
        </div>
      </section>

      <section>
        <SectionTitle title="대화 암송 지도" note="역할 A/B, 힌트, 롤플레잉 기억" />
        <div className="mt-3 grid gap-2.5">
          {dialogueItems.map(item => {
            const status = progressStatus(item.progress?.completed, item.progress?.practiceCount ?? 0);
            return (
              <button
                key={item.dialogue.id}
                onClick={() => nav(`/dialogue/${item.dialogue.id}`)}
                className={`rounded-2xl border p-4 text-left active:scale-[0.99] transition-transform ${item.score > 0 ? "border-accent/60 bg-accent/10" : "border-border bg-surface"}`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{item.dialogue.emoji ?? "💬"}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{item.dialogue.title}</h3>
                      {item.score > 0 && <span className="shrink-0 text-xs text-accent-strong">맞춤</span>}
                    </div>
                    <p className="mt-0.5 text-sm text-text-muted">{item.dialogue.subtitle}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <StatusPill {...status} />
                      <Pill>연습 {item.progress?.practiceCount ?? 0}회</Pill>
                      <Pill>퀴즈 {item.quizCount}/{dialogueQuizIds(item.dialogue.id).length}</Pill>
                    </div>
                  </div>
                  <div className="text-text-muted">→</div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <SectionTitle title="리딩·리스닝 지도" note="요지, 어휘, 쉐도잉 기억" />
        <div className="mt-3 grid gap-2.5">
          {readingItems.map(item => {
            const status = progressStatus(item.progress?.completed, item.progress?.listenCount ?? 0);
            return (
              <button
                key={item.lesson.id}
                onClick={() => nav(`/intermediate-reading/${item.lesson.id}`)}
                className={`rounded-2xl border p-4 text-left active:scale-[0.99] transition-transform ${item.score > 0 ? "border-accent/60 bg-accent/10" : "border-border bg-surface"}`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{item.lesson.emoji ?? "📰"}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{item.lesson.title}</h3>
                      {item.score > 0 && <span className="shrink-0 text-xs text-accent-strong">맞춤</span>}
                    </div>
                    <p className="mt-0.5 text-sm text-text-muted">{item.lesson.subtitle}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <StatusPill {...status} />
                      <Pill>듣기 {item.progress?.listenCount ?? 0}회</Pill>
                      <Pill>쉐도잉 {item.progress?.shadowingCount ?? 0}회</Pill>
                      <Pill>퀴즈 {item.quizCount}/{intermediateReadingQuizIds(item.lesson.id).length}</Pill>
                    </div>
                    <div className="mt-2 text-[11px] text-text-muted">{item.sourceLabel}</div>
                  </div>
                  <div className="text-text-muted">→</div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <button onClick={() => nav("/review?practice=1&source=intermediate&n=10")} className="rounded-xl bg-accent text-[#2A2522] px-4 py-3 font-medium">
        중급 기억 연결 10개 연습 ▸
      </button>
    </div>
  );
}

function AdvancedMemoryMap() {
  const nav = useNavigate();
  const progress = useStore(s => s.advancedArticleProgress ?? {});
  const generatedArticles = useStore(s => s.generatedAdvancedArticles ?? []);
  const insight = useStore(s => s.learnerProfile?.journalInsight);
  const articles = useMemo(() => mergeArticles(generatedArticles, ADVANCED_ARTICLES), [generatedArticles]);
  const plan = buildPersonalizedAdvancedPlan(articles, insight);
  const topics = activeTopics(insight);
  const orderedArticles = useMemo(() => {
    const ids = new Set<string>();
    return [...plan.personalizedArticles, ...plan.generalArticles].filter(article => {
      if (ids.has(article.id)) return false;
      ids.add(article.id);
      return true;
    });
  }, [plan.generalArticles, plan.personalizedArticles]);

  const completed = orderedArticles.filter(article => progress[article.id]?.completed).length;
  const feedbackCount = orderedArticles.reduce((sum, article) =>
    sum + (progress[article.id]?.writingFeedbackHistory?.length ?? 0) + (progress[article.id]?.speakingAttempts?.length ?? 0),
  0);

  return (
    <div className="px-5 pt-6 pb-4 flex flex-col gap-4">
      <MemoryHeader title="Stage 3 Memory Map" level="상급 · Article & Debate" />
      <PersonalizationPanel
        insight={insight}
        fallback="낙서장에 관심 주제와 생활 패턴이 쌓이면 상급 글, 토론 질문, 발화 과제 순서가 자동으로 바뀝니다."
      />

      <section className="rounded-2xl border border-accent/50 bg-accent/10 p-4">
        <div className="text-xs font-semibold text-accent-strong">맞춤 논점 맵</div>
        <h2 className="mt-1 font-semibold">
          {topics.length > 0 ? topics.slice(0, 2).join(" · ") : "긴 글을 의견으로 바꾸기"}
        </h2>
        <p className="mt-1 text-sm text-text-muted">{plan.reasonKo}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Pill>완료 {completed}/{orderedArticles.length}</Pill>
          <Pill>피드백·발화 {feedbackCount}회</Pill>
          {topics.slice(0, 4).map(topic => <Pill key={topic} accent>{topic}</Pill>)}
        </div>
      </section>

      <section>
        <SectionTitle title="상급 글 기억 지도" note="읽기, 토론 메모, 작문 피드백, 발화 평가" />
        <div className="mt-3 grid gap-2.5">
          {orderedArticles.map(article => {
            const itemProgress = progress[article.id];
            const personalized = plan.personalizedArticles.some(item => item.id === article.id);
            const status = advancedStatus(itemProgress);
            return (
              <button
                key={article.id}
                onClick={() => nav(`/advanced/article/${article.id}`)}
                className={`rounded-2xl border p-4 text-left active:scale-[0.99] transition-transform ${personalized ? "border-accent/60 bg-accent/10" : "border-border bg-surface"}`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{categoryEmoji(article.category)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{article.title}</h3>
                      {personalized && <span className="shrink-0 text-xs text-accent-strong">맞춤</span>}
                      {article.isGenerated && <span className="shrink-0 text-xs text-success">생성</span>}
                    </div>
                    <p className="mt-0.5 text-sm text-text-muted">{article.subtitle}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <StatusPill {...status} />
                      <Pill>{article.trendLabelKo ?? categoryLabel(article.category)}</Pill>
                      <Pill>작문 {itemProgress?.writingFeedbackHistory?.length ?? 0}회</Pill>
                      <Pill>발화 {itemProgress?.speakingPracticeCount ?? 0}회</Pill>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {article.keyExpressions.slice(0, 2).map(expression => (
                        <span key={expression.en} className="rounded-full bg-surface-2 border border-border px-2 py-0.5 text-[11px] text-text-muted">
                          {expression.en}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-text-muted">→</div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => nav("/review?practice=1&source=advanced&n=10")} className="rounded-xl bg-accent text-[#2A2522] px-4 py-3 text-sm font-medium">
          상급 표현 10개 연습 ▸
        </button>
        <button onClick={() => nav("/advanced")} className="rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium">
          상급 학습실 →
        </button>
      </div>
    </div>
  );
}

function MemoryHeader({ title, level }: { title: string; level: string }) {
  const nav = useNavigate();
  return (
    <header className="flex items-center gap-3">
      <button onClick={async () => { await waitForTtsIdle(); nav("/"); }} className="w-9 h-9 rounded-full hover:bg-surface-2">←</button>
      <div>
        <div className="text-xs text-text-muted">{level}</div>
        <h1 className="text-xl font-bold">{title}</h1>
      </div>
    </header>
  );
}

function PersonalizationPanel({ insight, fallback }: { insight?: JournalInsight; fallback: string }) {
  const topics = activeTopics(insight);
  return (
    <section className="rounded-2xl border border-border bg-surface p-4">
      <div className="text-xs font-semibold text-text-muted">낙서장·사용패턴 반영</div>
      <p className="mt-1 text-sm text-text-muted">
        {insight?.entryCount ? `낙서장 ${insight.entryCount}개와 최근 학습 패턴을 기준으로 지도 순서를 조정합니다.` : fallback}
      </p>
      {topics.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {topics.map(topic => <Pill key={topic} accent>{topic}</Pill>)}
        </div>
      )}
      {insight?.notes?.[0] && (
        <div className="mt-3 rounded-xl bg-surface-2 p-3 text-xs text-text-muted">
          {insight.notes[0]}
        </div>
      )}
    </section>
  );
}

function SectionTitle({ title, note }: { title: string; note: string }) {
  return (
    <div>
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-0.5 text-sm text-text-muted">{note}</p>
    </div>
  );
}

function Pill({ children, accent = false }: { children: ReactNode; accent?: boolean }) {
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[11px] ${accent ? "border-accent/40 bg-accent/15 text-accent-strong" : "border-border bg-surface-2 text-text-muted"}`}>
      {children}
    </span>
  );
}

function StatusPill({ label, className }: { label: string; className: string }) {
  return <span className={`rounded-full border px-2 py-0.5 text-[11px] ${className}`}>{label}</span>;
}

function memoryLabel(strength: number): { label: string; className: string } {
  if (strength < 0.35) return { label: "복습 필요", className: "border-error/40 bg-error/10 text-error" };
  if (strength < 0.7) return { label: "익숙해짐", className: "border-warn/40 bg-warn/10 text-warn" };
  return { label: "기억 선명", className: "border-success/40 bg-success/10 text-success" };
}

function progressStatus(completed = false, practiceCount = 0): { label: string; className: string } {
  if (completed) return { label: "기억 선명", className: "border-success/40 bg-success/10 text-success" };
  if (practiceCount > 0) return { label: "익숙해짐", className: "border-warn/40 bg-warn/10 text-warn" };
  return { label: "복습 필요", className: "border-error/40 bg-error/10 text-error" };
}

function advancedStatus(progress: ReturnType<typeof useStore.getState>["advancedArticleProgress"][string] | undefined): { label: string; className: string } {
  if (progress?.completed) return { label: "기억 선명", className: "border-success/40 bg-success/10 text-success" };
  if (progress?.read || progress?.writingFeedbackHistory?.length || progress?.speakingPracticeCount) {
    return { label: "익숙해짐", className: "border-warn/40 bg-warn/10 text-warn" };
  }
  return { label: "복습 필요", className: "border-error/40 bg-error/10 text-error" };
}

function progressRank(completed = false, count = 0): number {
  if (!completed && count === 0) return 0;
  if (!completed) return 1;
  return 2;
}

function activeTopics(insight?: JournalInsight): string[] {
  if (!insight) return [];
  return [...new Set([...(insight.preferredTopics ?? []), ...(insight.dailyPatternTags ?? [])])].slice(0, 6);
}

function topicScore(text: string, topics: string[]): number {
  const normalizedText = normalize(text);
  return topics.reduce((score, topic) => {
    const keys = TOPIC_KEYWORDS[topic] ?? [topic];
    return score + keys.filter(key => normalizedText.includes(normalize(key))).length;
  }, 0);
}

function mergeArticles(generated: AdvancedArticle[], seeded: AdvancedArticle[]): AdvancedArticle[] {
  const seen = new Set<string>();
  return [...generated, ...seeded].filter(article => {
    if (seen.has(article.id)) return false;
    seen.add(article.id);
    return true;
  });
}

function categoryLabel(category: AdvancedArticle["category"]) {
  if (category === "work") return "업무";
  if (category === "news") return "뉴스형 이슈";
  return "사회";
}

function categoryEmoji(category: AdvancedArticle["category"]) {
  if (category === "work") return "💼";
  if (category === "news") return "🗞️";
  return "🌐";
}

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, "").trim();
}

const TOPIC_KEYWORDS: Record<string, string[]> = {
  "업무": ["work", "office", "meeting", "update", "business", "task", "feedback"],
  "우주산업": ["space", "satellite", "orbit", "rocket", "infrastructure", "lunar"],
  "기술/AI": ["technology", "tech", "ai", "digital", "data", "media", "battery", "robot"],
  "글로벌 트렌드": ["global", "trend", "news", "world", "media"],
  "아시아": ["asia", "asian", "hong", "singapore", "nikkei", "market"],
  "환경": ["environment", "climate", "rain", "clean", "electric", "pollution"],
  "교육": ["learning", "reading", "teacher", "school", "education"],
  "경제/소비": ["business", "market", "price", "shop", "brand", "commerce"],
  "음식": ["food", "dinner", "restaurant", "cafe", "coffee", "noodle"],
  "이동": ["bus", "train", "airport", "route", "transport", "station"],
  "집": ["home", "sleep", "routine", "rest"],
  "건강": ["health", "exercise", "rest", "wellbeing", "rain"],
  "관계": ["friend", "team", "people", "community", "conversation"],
  "여행": ["travel", "trip", "hotel", "museum", "airport", "city"],
  "취미": ["hobby", "movie", "art", "video", "journal"],
  "아침 루틴": ["routine", "morning", "coffee", "health"],
  "업무일": ["work", "meeting", "update", "feedback"],
  "저녁 회복": ["rest", "health", "wellbeing", "offline"],
  "사람과 대화": ["friend", "conversation", "community", "team"],
  "여행 준비": ["travel", "hotel", "airport", "museum"],
  "시사 토론": ["news", "policy", "global", "society", "debate"],
};
