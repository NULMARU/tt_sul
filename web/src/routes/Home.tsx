import { useStore } from "../lib/store";
import { useNavigate } from "react-router-dom";
import { NowCard } from "../components/NowCard";
import { CircuitDial } from "../components/CircuitDial";
import { DailyStoryCard } from "../components/DailyStoryCard";
import { AxisChips } from "../components/AxisChips";
import { bandLabel, currentTimeBand } from "../lib/time";
import { APP_VERSION } from "../lib/version";
import { COURSE_LEVEL_BY_ID } from "@shared/data/course-levels.seed";
import { DIALOGUE_LESSONS } from "@shared/data/dialogues.seed";
import { INTERMEDIATE_READING_LESSONS } from "@shared/data/intermediate-readings.seed";
import { ADVANCED_ARTICLES } from "@shared/data/advanced.seed";
import { buildPersonalizedAdvancedPlan } from "../lib/advanced-personalization";
import type { AdvancedArticle } from "@shared/types/schema";

export function Home() {
  const nav = useNavigate();
  const stats = useStore(s => s.stats);
  const goal = useStore(s => s.prefs.dailyMinutesGoal);
  const currentCourseLevel = useStore(s => s.currentCourseLevel ?? "beginner");
  const journalInsight = useStore(s => s.learnerProfile?.journalInsight);
  const todayMin = Math.floor(stats.totalStudySeconds / 60);
  const pct = Math.min(100, Math.round((todayMin / goal) * 100));
  const band = currentTimeBand();
  const currentLevel = COURSE_LEVEL_BY_ID[currentCourseLevel];

  return (
    <div className="px-5 pt-6 pb-4 flex flex-col gap-4">
      {/* 상단 헤더 */}
      <header className="flex items-center justify-between">
        <div>
          <div className="text-sm text-text-muted">{bandLabel(band)} · 환영합니다</div>
          <div className="text-2xl font-bold mt-0.5">Sulsul+ <span className="text-xs align-middle text-text-muted">v{APP_VERSION}</span></div>
          <button
            onClick={() => nav("/axis/stage")}
            className="mt-1 text-xs text-accent-strong"
          >
            현재 과정: {currentLevel?.shortTitle ?? "초급"} →
          </button>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1.5 text-sm bg-accent/15 border border-accent/40 rounded-full px-2.5 py-1">
            🔥 <span className="font-semibold">{stats.streak}</span>일
          </div>
          <div className="mt-1 text-xs text-text-muted">{todayMin}/{goal}분 · {pct}%</div>
        </div>
      </header>

      {/* 목표 진행률 바 */}
      <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
        <div className="h-full bg-accent transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>

      {currentCourseLevel === "beginner" && <BeginnerToday />}
      {currentCourseLevel === "intermediate" && <IntermediateToday />}
      {currentCourseLevel === "advanced" && <AdvancedToday />}

      <button
        onClick={() => nav("/journal")}
        className="w-full text-left rounded-2xl bg-surface border border-border p-4 active:scale-[0.99] transition-transform"
      >
        <div className="flex items-center gap-2 text-xs text-text-muted">
          📓 낙서장 · 다음날 퀴즈 씨앗
        </div>
        <div className="mt-1 font-semibold leading-snug">짧게 쓰거나 말해서 남기기</div>
        <div className="text-sm text-text-muted mt-0.5">
          영어 한 문장을 저장하면 복습 문제와 학습자 인사이트로 이어집니다.
        </div>
        {journalInsight && journalInsight.entryCount > 0 && (
          <div className="mt-2 rounded-xl bg-surface-2 px-3 py-2 text-xs text-text-muted">
            최근 낙서장: {journalInsight.preferredTopics[0] ?? "일상"} 중심 · 추천 {COURSE_LEVEL_BY_ID[journalInsight.suggestedLevel]?.shortTitle}
          </div>
        )}
      </button>

      {/* 5축 칩 */}
      <section className="mt-2">
        <div className="text-sm text-text-muted mb-1.5">다른 축으로 탐색</div>
        <AxisChips />
      </section>
    </div>
  );
}

function BeginnerToday() {
  return (
    <>
      <NowCard />

      <section className="rounded-2xl border border-border bg-surface p-4">
        <div className="text-center text-sm text-text-muted">오늘의 회로 — 4모드 회전 학습</div>
        <CircuitDial />
        <div className="text-center text-xs text-text-muted mt-2">중앙 = 5스텝 풀 코스 · 외곽 = 단일 모드</div>
      </section>

      <DailyStoryCard />
    </>
  );
}

function IntermediateToday() {
  const nav = useNavigate();
  const dialogueProgress = useStore(s => s.dialogueProgress ?? {});
  const readingProgress = useStore(s => s.intermediateReadingProgress ?? {});
  const completedDialogues = DIALOGUE_LESSONS.filter(dialogue => dialogueProgress[dialogue.id]?.completed).length;
  const completedReadings = INTERMEDIATE_READING_LESSONS.filter(lesson => readingProgress[lesson.id]?.completed).length;
  const nextDialogue = DIALOGUE_LESSONS.find(dialogue => !dialogueProgress[dialogue.id]?.completed) ?? DIALOGUE_LESSONS[0];
  const nextReading = INTERMEDIATE_READING_LESSONS.find(lesson => !readingProgress[lesson.id]?.completed) ?? INTERMEDIATE_READING_LESSONS[0];
  const recommendReading = completedReadings <= completedDialogues;
  const title = recommendReading ? nextReading?.title : nextDialogue?.title;
  const subtitle = recommendReading ? nextReading?.subtitle : nextDialogue?.subtitle;
  const path = recommendReading ? `/intermediate-reading/${nextReading?.id}` : `/dialogue/${nextDialogue?.id}`;

  return (
    <>
      <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          🎭 Stage 2 · 오늘 추천
        </div>
        <div className="mt-1 font-semibold text-lg leading-snug">
          지금 추천 · {title}
        </div>
        <p className="mt-0.5 text-sm text-text-muted">{subtitle}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-surface-2 border border-border px-2 py-1 text-[11px] text-text-muted">
            대화 완료 {completedDialogues}/{DIALOGUE_LESSONS.length}
          </span>
          <span className="rounded-full bg-surface-2 border border-border px-2 py-1 text-[11px] text-text-muted">
            리딩 완료 {completedReadings}/{INTERMEDIATE_READING_LESSONS.length}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => nav(path)}
            className="rounded-xl bg-accent text-[#2A2522] px-4 py-2.5 text-sm font-medium"
          >
            시작 →
          </button>
          <button
            onClick={() => nav("/review?practice=1&source=intermediate&n=5")}
            className="rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm font-medium"
          >
            중급 1분학습
          </button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <button
          onClick={() => nav("/dialogues")}
          className="rounded-2xl border border-border bg-surface p-4 text-left"
        >
          <div className="text-2xl">🗣️</div>
          <div className="mt-2 font-semibold">대화 암송</div>
          <p className="mt-1 text-xs text-text-muted">역할 A/B와 한글 힌트로 출력 연습</p>
        </button>
        <button
          onClick={() => nav("/intermediate-readings")}
          className="rounded-2xl border border-border bg-surface p-4 text-left"
        >
          <div className="text-2xl">📰</div>
          <div className="mt-2 font-semibold">리딩·리스닝</div>
          <p className="mt-1 text-xs text-text-muted">뉴스형 글의 요지와 어휘 잡기</p>
        </button>
      </section>
    </>
  );
}

function AdvancedToday() {
  const nav = useNavigate();
  const progress = useStore(s => s.advancedArticleProgress ?? {});
  const journalInsight = useStore(s => s.learnerProfile?.journalInsight);
  const generatedArticles = useStore(s => s.generatedAdvancedArticles ?? []);
  const articles = mergeArticles(generatedArticles, ADVANCED_ARTICLES);
  const personalizedPlan = buildPersonalizedAdvancedPlan(articles, journalInsight);
  const recommended = personalizedPlan.personalizedArticles.find(article => !progress[article.id]?.completed)
    ?? articles.find(article => !progress[article.id]?.completed)
    ?? articles[0];
  const completed = articles.filter(article => progress[article.id]?.completed).length;
  const feedbackCount = articles.reduce((sum, article) =>
    sum + (progress[article.id]?.writingFeedbackHistory?.length ?? 0) + (progress[article.id]?.speakingAttempts?.length ?? 0),
  0);

  return (
    <>
      <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          🛰️ Stage 3 · 오늘 추천
        </div>
        <div className="mt-1 font-semibold text-lg leading-snug">
          지금 추천 · {recommended.title}
        </div>
        <p className="mt-0.5 text-sm text-text-muted">{recommended.subtitle}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-surface-2 border border-border px-2 py-1 text-[11px] text-text-muted">
            완료 {completed}/{articles.length}
          </span>
          <span className="rounded-full bg-surface-2 border border-border px-2 py-1 text-[11px] text-text-muted">
            피드백·발화 {feedbackCount}회
          </span>
          {personalizedPlan.activeTopics[0] && (
            <span className="rounded-full bg-accent/15 border border-accent/40 px-2 py-1 text-[11px] text-accent-strong">
              관심 {personalizedPlan.activeTopics[0]}
            </span>
          )}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => nav(`/advanced/article/${recommended.id}`)}
            className="rounded-xl bg-accent text-[#2A2522] px-4 py-2.5 text-sm font-medium"
          >
            읽고 말하기 →
          </button>
          <button
            onClick={() => nav("/review?practice=1&source=advanced&n=5")}
            className="rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm font-medium"
          >
            상급 1분학습
          </button>
        </div>
      </section>

      <button
        onClick={() => nav("/advanced")}
        className="w-full rounded-2xl border border-accent/50 bg-accent/10 p-4 text-left"
      >
        <div className="text-xs font-semibold text-accent-strong">상급 학습실</div>
        <div className="mt-1 font-semibold">긴 글, 토론, 작문, 발화 평가로 이어가기</div>
        <p className="mt-1 text-sm text-text-muted">
          낙서장 관심 주제와 최신 소스 기반 글은 상급 학습실에서 계속 관리됩니다.
        </p>
      </button>
    </>
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
