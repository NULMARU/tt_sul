import { useNavigate } from "react-router-dom";
import { STAGES, LESSON_BY_ID } from "@shared/data/stages.seed";
import { COURSE_LEVELS, PROMOTION_EXAMS } from "@shared/data/course-levels.seed";
import type { CourseLevelId } from "@shared/types/schema";
import { useStore } from "../lib/store";

export function AxisStage() {
  const nav = useNavigate();
  const progress = useStore(s => s.lessonProgress);
  const currentCourseLevel = useStore(s => s.currentCourseLevel ?? "beginner");
  const setCurrentCourseLevel = useStore(s => s.setCurrentCourseLevel);
  const attempts = useStore(s => s.promotionExamAttempts ?? []);
  const journalInsight = useStore(s => s.learnerProfile?.journalInsight);

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
        <div>
          <h2 className="font-semibold">초급 내부 Unit</h2>
          <p className="text-xs text-text-muted mt-0.5">기존 30강의 `stage-1..5`는 초급 과정 안의 단원으로 유지합니다.</p>
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
                        onClick={() => nav(`/lesson/${id}`)}
                        className="w-full flex items-center gap-2 py-2 text-left text-sm border-b border-border/60 last:border-0"
                      >
                        <span className="w-6 text-center text-text-muted">{done ? "✓" : "○"}</span>
                        <span className="flex-1">{l.title} — {l.subtitle}</span>
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
      </section>
    </div>
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
