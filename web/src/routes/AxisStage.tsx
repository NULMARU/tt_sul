import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { ADVANCED_ARTICLES } from "@shared/data/advanced.seed";
import { DIALOGUE_LESSONS } from "@shared/data/dialogues.seed";
import { INTERMEDIATE_READING_LESSONS } from "@shared/data/intermediate-readings.seed";
import { STAGES, LESSON_BY_ID } from "@shared/data/stages.seed";
import { COURSE_LEVELS, PROMOTION_EXAMS } from "@shared/data/course-levels.seed";
import type { CourseLevelId } from "@shared/types/schema";
import { activeAxisTopics, mergeAdvancedArticles } from "../lib/course-axis";
import { useStore } from "../lib/store";

export function AxisStage() {
  const nav = useNavigate();
  const progress = useStore(s => s.lessonProgress);
  const currentCourseLevel = useStore(s => s.currentCourseLevel ?? "beginner");
  const setCurrentCourseLevel = useStore(s => s.setCurrentCourseLevel);
  const attempts = useStore(s => s.promotionExamAttempts ?? []);
  const journalInsight = useStore(s => s.learnerProfile?.journalInsight);
  const dialogueProgress = useStore(s => s.dialogueProgress ?? {});
  const readingProgress = useStore(s => s.intermediateReadingProgress ?? {});
  const advancedProgress = useStore(s => s.advancedArticleProgress ?? {});
  const generatedArticles = useStore(s => s.generatedAdvancedArticles ?? []);
  const topics = activeAxisTopics(journalInsight);
  const advancedArticles = mergeAdvancedArticles(generatedArticles, ADVANCED_ARTICLES);

  function stagePct(lessonIds: string[]) {
    if (lessonIds.length === 0) return 0;
    const done = lessonIds.filter(id => progress[id]?.completed).length;
    return done / lessonIds.length;
  }

  return (
    <div className="px-5 pt-6 pb-4 flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <button onClick={() => nav("/")} className="w-9 h-9 rounded-full hover:bg-surface-2">←</button>
        <div>
          <div className="text-xs text-text-muted">자유 선택형 과정</div>
          <h1 className="text-xl font-bold">🪜 Stage 선택</h1>
        </div>
      </header>

      <section className="rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-accent-strong font-semibold">레벨테스트 안내</div>
            <p className="text-sm text-text-muted mt-1">
              승급 미션은 레벨 확인과 피드백용입니다. 통과 여부와 관계없이 초급, 중급, 상급은 자유롭게 선택할 수 있어요.
            </p>
          </div>
          <button
            onClick={() => nav("/promotion-exam/placement-map")}
            className="shrink-0 rounded-xl bg-accent text-[#2A2522] px-3 py-2 text-sm font-medium"
          >
            탐험전
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => nav("/promotion-exam/placement-map")}
            className="rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm font-medium"
          >
            레벨 점검 시작
          </button>
          <button
            onClick={() => nav("/exam-history")}
            className="rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm font-medium"
          >
            결과 기록 보기
          </button>
        </div>
        {journalInsight && (
          <div className="mt-3 rounded-xl bg-surface-2 p-3 text-xs text-text-muted">
            낙서장 기준 추천: <span className="font-semibold text-text">{levelLabel(journalInsight.suggestedLevel)}</span>
            {journalInsight.preferredTopics.length > 0 && ` · 관심 주제 ${journalInsight.preferredTopics.join(", ")}`}
          </div>
        )}
      </section>

      <section className="grid gap-3">
        {COURSE_LEVELS.map(level => {
          const active = level.id === currentCourseLevel;
          const promotionExam = promotionExamFor(level.id);
          const latest = latestAttempt(attempts, promotionExam?.id ?? "placement-map");
          return (
            <article
              key={level.id}
              className={`rounded-2xl border p-4 ${active ? "border-accent bg-accent/10" : "border-border bg-surface"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-text-muted">{active ? "현재 선택" : "선택 가능"}</div>
                  <h2 className="font-semibold">{level.title}</h2>
                  <p className="text-sm text-text-muted mt-1">{level.description}</p>
                </div>
                <span className="text-3xl">{levelEmoji(level.id)}</span>
              </div>

              <div className="mt-3 rounded-xl bg-surface-2 p-3 text-sm">
                <div className="font-medium">목표</div>
                <div className="text-text-muted mt-0.5">{level.learnerGoal}</div>
              </div>

              {latest && (
                <div className="mt-2 text-xs text-text-muted">
                  최근 미션: {latest.totalScore}/{latest.maxScore} · {latest.passed ? "통과" : "연습 권장"}
                </div>
              )}

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setCurrentCourseLevel(level.id)}
                  className={`rounded-xl px-3 py-2.5 text-sm font-medium ${active ? "bg-accent text-[#2A2522]" : "border border-border bg-surface-2"}`}
                >
                  {active ? "선택됨" : "이 과정 선택"}
                </button>
                {promotionExam ? (
                  <button
                    onClick={() => nav(`/promotion-exam/${promotionExam.id}`)}
                    className="rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm font-medium"
                  >
                    승급 미션
                  </button>
                ) : (
                  <button
                    onClick={() => nav("/promotion-exam/placement-map")}
                    className="rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm font-medium"
                  >
                    레벨 점검
                  </button>
                )}
              </div>
              {level.entryRoute && (
                <button
                  onClick={() => {
                    setCurrentCourseLevel(level.id);
                    nav(level.entryRoute!);
                  }}
                  className="mt-2 w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm font-medium"
                >
                  {level.shortTitle} 학습 시작 →
                </button>
              )}
            </article>
          );
        })}
      </section>

      <section className="flex flex-col gap-3">
        {currentCourseLevel === "beginner" && (
          <BeginnerUnitSection
            progress={progress}
            stagePct={stagePct}
            onOpenLesson={id => nav(`/lesson/${id}`)}
          />
        )}
        {currentCourseLevel === "intermediate" && (
          <IntermediateUnitSection
            dialogueProgress={dialogueProgress}
            readingProgress={readingProgress}
            topics={topics}
            onOpen={route => nav(route)}
          />
        )}
        {currentCourseLevel === "advanced" && (
          <AdvancedUnitSection
            articles={advancedArticles}
            progress={advancedProgress}
            topics={topics}
            onOpen={route => nav(route)}
          />
        )}
      </section>
    </div>
  );
}

function BeginnerUnitSection({
  progress,
  stagePct,
  onOpenLesson,
}: {
  progress: ReturnType<typeof useStore.getState>["lessonProgress"];
  stagePct: (lessonIds: string[]) => number;
  onOpenLesson: (id: string) => void;
}) {
  return (
    <>
      <div>
        <h2 className="font-semibold">초급 내부 Unit</h2>
        <p className="text-xs text-text-muted mt-0.5">기존 30강의 stage-1..5는 초급 과정 안의 단원으로 유지합니다.</p>
      </div>

      {STAGES.map((s) => {
        const pct = stagePct(s.lessonIds);
        return (
          <section
            key={s.id}
            className="rounded-2xl border p-4 bg-surface border-border"
          >
            <div className="flex items-baseline justify-between">
              <h2 className="font-semibold">{s.title.replace("Stage", "Unit")}</h2>
              <span className="text-xs text-text-muted">{Math.round(pct * 100)}%</span>
            </div>
            <p className="text-sm text-text-muted mt-0.5">{s.description}</p>
            <div className="mt-2 h-1.5 rounded-full bg-surface-2 overflow-hidden">
              <div className="h-full bg-accent" style={{ width: `${pct * 100}%` }} />
            </div>
            {s.lessonIds.length > 0 && (
              <ul className="mt-3 flex flex-col">
                {s.lessonIds.map(id => {
                  const l = LESSON_BY_ID[id];
                  if (!l) return null;
                  const done = progress[id]?.completed;
                  return (
                    <li key={id}>
                      <button
                        onClick={() => onOpenLesson(id)}
                        className="w-full flex items-center gap-2 py-2 text-left text-sm border-b border-border/60 last:border-0"
                      >
                        <span className="w-6 text-center text-text-muted">{done ? "✓" : "○"}</span>
                        <span className="flex-1">{l.title} - {l.subtitle}</span>
                        <span className="text-text-muted">→</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}
    </>
  );
}

function IntermediateUnitSection({
  dialogueProgress,
  readingProgress,
  topics,
  onOpen,
}: {
  dialogueProgress: ReturnType<typeof useStore.getState>["dialogueProgress"];
  readingProgress: ReturnType<typeof useStore.getState>["intermediateReadingProgress"];
  topics: string[];
  onOpen: (route: string) => void;
}) {
  const completedDialogues = DIALOGUE_LESSONS.filter(dialogue => dialogueProgress[dialogue.id]?.completed).length;
  const completedReadings = INTERMEDIATE_READING_LESSONS.filter(lesson => readingProgress[lesson.id]?.completed).length;
  const total = DIALOGUE_LESSONS.length + INTERMEDIATE_READING_LESSONS.length;
  const completed = completedDialogues + completedReadings;
  const pct = Math.round((completed / Math.max(1, total)) * 100);

  return (
    <>
      <div>
        <h2 className="font-semibold">중급 내부 Unit</h2>
        <p className="text-xs text-text-muted mt-0.5">A/B 대화 암송과 뉴스형 리딩을 묶어 B1-B2 출력 루프로 운영합니다.</p>
      </div>
      <section className="rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold">Stage 2 진행도</h2>
          <span className="text-xs text-text-muted">{pct}%</span>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-surface-2 overflow-hidden">
          <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Pill>대화 {completedDialogues}/{DIALOGUE_LESSONS.length}</Pill>
          <Pill>리딩 {completedReadings}/{INTERMEDIATE_READING_LESSONS.length}</Pill>
          {topics[0] && <Pill accent>관심 {topics[0]}</Pill>}
        </div>
      </section>
      <UnitCard
        emoji="🎭"
        title="Unit 1 · A/B 대화 암송"
        note="역할을 바꿔 말하고, 한국어 힌트로 문장을 다시 꺼내는 중급 핵심 루프입니다."
        meta={`완료 ${completedDialogues}/${DIALOGUE_LESSONS.length}`}
        onOpen={() => onOpen("/dialogues")}
      />
      <UnitCard
        emoji="📰"
        title="Unit 2 · 뉴스형 리딩·리스닝"
        note="BBC/VOA/Breaking News English식 구조를 앱 내부 원본 글로 익히고 요지를 말합니다."
        meta={`완료 ${completedReadings}/${INTERMEDIATE_READING_LESSONS.length}`}
        onOpen={() => onOpen("/intermediate-readings")}
      />
      <UnitCard
        emoji="⚡"
        title="Unit 3 · 중급 1분 복습"
        note="대화 응답, 리딩 요지, 핵심 어휘를 짧은 퀴즈로 다시 회수합니다."
        meta="복습 큐"
        onOpen={() => onOpen("/review?practice=1&source=intermediate&n=10")}
      />
    </>
  );
}

function AdvancedUnitSection({
  articles,
  progress,
  topics,
  onOpen,
}: {
  articles: ReturnType<typeof mergeAdvancedArticles>;
  progress: ReturnType<typeof useStore.getState>["advancedArticleProgress"];
  topics: string[];
  onOpen: (route: string) => void;
}) {
  const completed = articles.filter(article => progress[article.id]?.completed).length;
  const feedbackCount = articles.reduce((sum, article) =>
    sum + (progress[article.id]?.writingFeedbackHistory?.length ?? 0) + (progress[article.id]?.speakingAttempts?.length ?? 0),
  0);
  const pct = Math.round((completed / Math.max(1, articles.length)) * 100);

  return (
    <>
      <div>
        <h2 className="font-semibold">상급 내부 Unit</h2>
        <p className="text-xs text-text-muted mt-0.5">긴 글을 읽고 토론, 작문, 1분 발화 평가까지 연결합니다.</p>
      </div>
      <section className="rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold">Stage 3 진행도</h2>
          <span className="text-xs text-text-muted">{pct}%</span>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-surface-2 overflow-hidden">
          <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Pill>완료 {completed}/{articles.length}</Pill>
          <Pill>피드백 {feedbackCount}</Pill>
          {topics[0] && <Pill accent>관심 {topics[0]}</Pill>}
        </div>
      </section>
      <UnitCard
        emoji="📚"
        title="Unit 1 · 긴 글 읽기"
        note="업무, 뉴스, 사회 이슈를 긴 문장 구조와 고급 표현으로 읽습니다."
        meta={`${articles.length}개 글`}
        onOpen={() => onOpen("/advanced")}
      />
      <UnitCard
        emoji="⚖️"
        title="Unit 2 · 토론 관점"
        note="찬반 입장, 위험, 조건을 잡아 자신의 의견으로 바꿉니다."
        meta="Debate"
        onOpen={() => onOpen("/advanced")}
      />
      <UnitCard
        emoji="✍️"
        title="Unit 3 · 작문 피드백"
        note="4-5문장 의견문을 쓰고 수정 전/후 피드백을 누적합니다."
        meta={`피드백 ${feedbackCount}`}
        onOpen={() => onOpen("/advanced")}
      />
      <UnitCard
        emoji="🎤"
        title="Unit 4 · 1분 발화 평가"
        note="명확성, 구조, 근거, 전달력을 기준으로 말하기를 점검합니다."
        meta="Speaking"
        onOpen={() => onOpen("/review?practice=1&source=advanced&n=10")}
      />
    </>
  );
}

function UnitCard({
  emoji,
  title,
  note,
  meta,
  onOpen,
}: {
  emoji: string;
  title: string;
  note: string;
  meta: string;
  onOpen: () => void;
}) {
  return (
    <button onClick={onOpen} className="rounded-2xl border border-border bg-surface p-4 text-left active:scale-[0.99]">
      <div className="flex items-start gap-3">
        <span className="text-3xl">{emoji}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-semibold">{title}</h2>
            <span className="shrink-0 text-xs text-text-muted">{meta}</span>
          </div>
          <p className="mt-1 text-sm text-text-muted">{note}</p>
        </div>
        <span className="text-text-muted">→</span>
      </div>
    </button>
  );
}

function Pill({ children, accent = false }: { children: ReactNode; accent?: boolean }) {
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[11px] ${accent ? "border-accent/60 bg-accent/10 text-accent-strong" : "border-border bg-surface-2 text-text-muted"}`}>
      {children}
    </span>
  );
}

function promotionExamFor(levelId: CourseLevelId) {
  return PROMOTION_EXAMS.find(exam => exam.kind === "promotion" && exam.levelId === levelId);
}

function latestAttempt(attempts: ReturnType<typeof useStore.getState>["promotionExamAttempts"], examId: string) {
  return [...(attempts ?? [])]
    .filter(attempt => attempt.examId === examId)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0];
}

function levelLabel(levelId: CourseLevelId) {
  if (levelId === "beginner") return "초급";
  if (levelId === "intermediate") return "중급";
  return "상급";
}

function levelEmoji(levelId: CourseLevelId) {
  if (levelId === "beginner") return "🌱";
  if (levelId === "intermediate") return "🎭";
  return "🛰️";
}
