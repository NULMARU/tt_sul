import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ADVANCED_ARTICLES } from "@shared/data/advanced.seed";
import type { AdvancedArticle, AdvancedArticleCategory, SpeakingRubricItem } from "@shared/types/schema";
import { articleMatchesTopics, buildPersonalizedAdvancedPlan } from "../lib/advanced-personalization";
import { generateAdvancedCurrentTopic, llmAvailable } from "../lib/llm";
import { useStore } from "../lib/store";

export function Advanced() {
  const nav = useNavigate();
  const [generating, setGenerating] = useState(false);
  const [generateMessage, setGenerateMessage] = useState("");
  const progress = useStore(s => s.advancedArticleProgress ?? {});
  const journal = useStore(s => s.journal ?? []);
  const journalInsight = useStore(s => s.learnerProfile?.journalInsight);
  const generatedArticles = useStore(s => s.generatedAdvancedArticles ?? []);
  const addGeneratedAdvancedArticle = useStore(s => s.addGeneratedAdvancedArticle);
  const articles = useMemo(() => mergeArticles(generatedArticles, ADVANCED_ARTICLES), [generatedArticles]);
  const personalizedPlan = buildPersonalizedAdvancedPlan(articles, journalInsight);
  const completed = articles.filter(article => progress[article.id]?.completed).length;
  const read = articles.filter(article => progress[article.id]?.read).length;
  const listeningCount = articles.reduce((sum, article) =>
    sum + (progress[article.id]?.listenCount ?? 0), 0);
  const writingFeedbackCount = articles.reduce((sum, article) =>
    sum + (progress[article.id]?.writingFeedbackHistory?.length ?? 0), 0);
  const speakingAttemptCount = articles.reduce((sum, article) =>
    sum + (progress[article.id]?.speakingAttempts?.length ?? 0), 0);
  const recentResults = articles.flatMap(article => {
    const itemProgress = progress[article.id];
    const writing = itemProgress?.writingFeedbackHistory?.[0]
      ? [{
          id: `${article.id}-writing`,
          at: itemProgress.writingFeedbackHistory[0].createdAt,
          title: article.title,
          label: `작문 ${itemProgress.writingFeedbackHistory[0].score ? `${itemProgress.writingFeedbackHistory[0].score}/10` : "피드백"}`,
        }]
      : [];
    const speaking = itemProgress?.speakingAttempts?.[0]
      ? [{
          id: `${article.id}-speaking`,
          at: itemProgress.speakingAttempts[0].createdAt,
          title: article.title,
          label: `발화 ${averageScore(itemProgress.speakingAttempts[0].rubricScores)}`,
        }]
      : [];
    return [...writing, ...speaking];
  }).sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 3);
  const pct = Math.round((completed / Math.max(1, articles.length)) * 100);
  const dynamicTopics = personalizedPlan.activeTopics.length > 0
    ? personalizedPlan.activeTopics
    : ["기술/AI", "업무", "사회"];

  async function generateCurrentTopic() {
    if (!llmAvailable()) {
      setGenerateMessage("LLM 프록시가 연결되면 최신 주제 생성을 사용할 수 있어요.");
      return;
    }
    setGenerating(true);
    setGenerateMessage("");
    const result = await generateAdvancedCurrentTopic({
      topics: dynamicTopics,
      recentJournal: [...journal].slice(-5).map(entry => entry.text),
      existingTitles: articles.map(article => article.title),
    });
    setGenerating(false);
    if (!result?.article?.id) {
      setGenerateMessage("최신 주제를 만들지 못했어요. 잠시 후 다시 시도해주세요.");
      return;
    }
    addGeneratedAdvancedArticle(result.article);
    setGenerateMessage("최신 주제 글을 만들었습니다. 맞춤 추천과 전체 목록에 추가했어요.");
  }

  return (
    <div className="px-5 pt-6 pb-4 flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <button onClick={() => nav("/axis/stage")} className="w-9 h-9 rounded-full hover:bg-surface-2">←</button>
        <div>
          <div className="text-xs text-text-muted">Stage 3 · 상급 과정</div>
          <h1 className="text-xl font-bold">🛰️ Article & Debate</h1>
        </div>
      </header>

      <section className="rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-semibold">긴 글을 내 의견으로 바꾸기</div>
            <p className="mt-1 text-sm text-text-muted">
              업무, 뉴스형 이슈, 사회 주제를 읽고 요약·토론·발화 평가까지 이어갑니다.
            </p>
          </div>
          <div className="text-right text-sm">
            <div className="font-bold">{pct}%</div>
            <div className="text-xs text-text-muted">{completed}/{articles.length}</div>
          </div>
        </div>
        <div className="mt-3 h-2 rounded-full bg-surface-2 overflow-hidden">
          <div className="h-full bg-accent transition-[width]" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-2 text-xs text-text-muted">읽은 글 {read}개 · 듣기 {listeningCount}회 · 완료 {completed}개</div>
        <div className="mt-1 text-xs text-text-muted">작문 피드백 {writingFeedbackCount}회 · 발화 평가 {speakingAttemptCount}회</div>
      </section>

      {recentResults.length > 0 && (
        <section className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-semibold">최근 상급 기록</h2>
            <span className="text-xs text-text-muted">작문/발화</span>
          </div>
          <div className="mt-3 grid gap-2">
            {recentResults.map(item => (
              <div key={item.id} className="rounded-xl bg-surface-2 p-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium truncate">{item.title}</span>
                  <span className="shrink-0 text-xs text-accent-strong">{item.label}</span>
                </div>
                <div className="mt-1 text-[11px] text-text-muted">{formatDateTime(item.at)}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-accent/50 bg-accent/10 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-accent-strong">낙서장 기반 맞춤 추천</div>
            <h2 className="mt-1 font-semibold">관심 있는 주제로 상급 말하기</h2>
            <p className="mt-1 text-sm text-text-muted">{personalizedPlan.reasonKo}</p>
          </div>
          <span className="shrink-0 rounded-full bg-surface/70 px-2 py-1 text-[11px] text-text-muted">
            {personalizedPlan.activeTopics.length > 0 ? "개인화 ON" : "대기 중"}
          </span>
        </div>
        {personalizedPlan.activeTopics.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {personalizedPlan.activeTopics.map(topic => (
              <span key={topic} className="rounded-full border border-accent/40 bg-surface/70 px-2 py-0.5 text-[11px]">
                {topic}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-3 rounded-xl bg-surface/70 p-3 text-xs text-text-muted">
            예: 낙서장에 "I watched a video about satellites and rockets."처럼 적으면 우주산업 글이 추천됩니다.
          </p>
        )}
        {personalizedPlan.personalizedArticles.length > 0 && (
          <div className="mt-3 grid gap-2">
            {personalizedPlan.personalizedArticles.slice(0, 3).map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                progress={progress[article.id]}
                personalized
                onOpen={() => nav(`/advanced/article/${article.id}`)}
              />
            ))}
          </div>
        )}
        <button
          onClick={generateCurrentTopic}
          disabled={generating}
          className="mt-3 w-full rounded-xl bg-accent text-[#2A2522] px-4 py-2.5 text-sm font-medium disabled:opacity-50"
        >
          {generating ? "최신 소스 확인 중..." : "최신 주제로 상급 글 만들기"}
        </button>
        {!llmAvailable() && (
          <p className="mt-2 text-[11px] text-text-muted">
            현재 LLM 프록시가 꺼져 있어 버튼은 안내만 표시합니다.
          </p>
        )}
        {generateMessage && (
          <p className="mt-2 rounded-xl bg-surface/70 p-3 text-xs text-text-muted">
            {generateMessage}
          </p>
        )}
      </section>

      <section className="grid grid-cols-3 gap-2">
        {(["work", "news", "society"] as AdvancedArticleCategory[]).map(category => (
          <div key={category} className="rounded-2xl border border-border bg-surface p-3 text-center">
            <div className="text-2xl">{categoryEmoji(category)}</div>
            <div className="mt-1 text-xs font-medium">{categoryLabel(category)}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-3">
        {articles.map(article => {
          const itemProgress = progress[article.id];
          return (
            <ArticleCard
              key={article.id}
              article={article}
              progress={itemProgress}
              personalized={articleMatchesTopics(article, personalizedPlan.activeTopics)}
              onOpen={() => nav(`/advanced/article/${article.id}`)}
            />
          );
        })}
      </section>
    </div>
  );
}

function mergeArticles(generated: AdvancedArticle[], seeded: AdvancedArticle[]): AdvancedArticle[] {
  const seen = new Set<string>();
  return [...generated, ...seeded].filter(article => {
    if (seen.has(article.id)) return false;
    seen.add(article.id);
    return true;
  });
}

function ArticleCard({
  article,
  progress,
  personalized,
  onOpen,
}: {
  article: AdvancedArticle;
  progress?: ReturnType<typeof useStore.getState>["advancedArticleProgress"][string];
  personalized?: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      onClick={onOpen}
      className={`text-left rounded-2xl border p-4 active:scale-[0.99] transition-transform ${personalized ? "border-accent/60 bg-accent/10" : "border-border bg-surface"}`}
    >
      <div className="flex items-start gap-3">
        <div className="text-3xl">{categoryEmoji(article.category)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold truncate">{article.title}</h2>
            {personalized && <span className="shrink-0 text-xs text-accent-strong">맞춤</span>}
            {progress?.completed && <span className="shrink-0 text-xs text-success">완료</span>}
          </div>
          <p className="mt-0.5 text-sm text-text-muted">{article.subtitle}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[11px] text-text-muted">
              {categoryLabel(article.category)}
            </span>
            {article.trendLabelKo && (
              <span className="rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[11px] text-text-muted">
                {article.trendLabelKo}
              </span>
            )}
            <span className="rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[11px] text-text-muted">
              약 {article.estimatedMinutes}분
            </span>
            <span className="rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[11px] text-text-muted">
              듣기 {progress?.listenCount ?? 0}회
            </span>
            <span className="rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[11px] text-text-muted">
              발화 {progress?.speakingPracticeCount ?? 0}회
            </span>
          </div>
        </div>
        <div className="text-text-muted">→</div>
      </div>
    </button>
  );
}

function categoryLabel(category: AdvancedArticleCategory) {
  if (category === "work") return "업무";
  if (category === "news") return "뉴스형 이슈";
  return "사회";
}

function categoryEmoji(category: AdvancedArticleCategory) {
  if (category === "work") return "💼";
  if (category === "news") return "🗞️";
  return "🌐";
}

function averageScore(scores: Partial<Record<SpeakingRubricItem["criterion"], number>>) {
  const values = Object.values(scores).filter((value): value is number => typeof value === "number");
  if (values.length === 0) return "미입력";
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  return `${average.toFixed(1)}/3`;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
