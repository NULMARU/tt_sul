import { useNavigate } from "react-router-dom";
import {
  INTERMEDIATE_READING_LESSONS,
  INTERMEDIATE_SOURCE_PROFILE_BY_ID,
  INTERMEDIATE_SOURCE_PROFILES,
} from "@shared/data/intermediate-readings.seed";
import { intermediateReadingQuizIds } from "@shared/data/intermediate-reading-quizzes";
import { useStore } from "../lib/store";

export function IntermediateReadings() {
  const nav = useNavigate();
  const progress = useStore(s => s.intermediateReadingProgress ?? {});
  const attempts = useStore(s => s.quizAttempts ?? {});

  const completed = INTERMEDIATE_READING_LESSONS.filter(lesson => progress[lesson.id]?.completed).length;
  const pct = Math.round((completed / Math.max(1, INTERMEDIATE_READING_LESSONS.length)) * 100);

  return (
    <div className="px-5 pt-6 pb-4 flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <button onClick={() => nav("/intermediate")} className="w-9 h-9 rounded-full hover:bg-surface-2">←</button>
        <div>
          <div className="text-xs text-text-muted">Stage 2 · 중급 과정</div>
          <h1 className="text-xl font-bold">📰 리딩·리스닝 랩</h1>
        </div>
      </header>

      <section className="rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">소스 기반 원본 콘텐츠</div>
            <p className="mt-1 text-sm text-text-muted">
              {INTERMEDIATE_SOURCE_PROFILES.length}개 소스를 검토해 중급자용 B1-B2 글, 어휘, 요지 퀴즈, 말하기 프롬프트로 재구성했습니다.
            </p>
          </div>
          <div className="text-right text-sm">
            <div className="font-bold">{pct}%</div>
            <div className="text-xs text-text-muted">{completed}/{INTERMEDIATE_READING_LESSONS.length}</div>
          </div>
        </div>
        <div className="mt-3 h-2 rounded-full bg-surface-2 overflow-hidden">
          <div className="h-full bg-accent transition-[width]" style={{ width: `${pct}%` }} />
        </div>
      </section>

      <section className="grid gap-3">
        {INTERMEDIATE_READING_LESSONS.map(lesson => {
          const source = INTERMEDIATE_SOURCE_PROFILE_BY_ID[lesson.sourceProfileId];
          const itemProgress = progress[lesson.id];
          const quizIds = intermediateReadingQuizIds(lesson.id);
          const attemptedQuizCount = quizIds.filter(quizId => attempts[quizId]).length;
          return (
            <article key={lesson.id} className="rounded-2xl border border-border bg-surface p-4">
              <button
                onClick={() => nav(`/intermediate-reading/${lesson.id}`)}
                className="w-full text-left active:scale-[0.99] transition-transform"
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{lesson.emoji ?? "📘"}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold truncate">{lesson.title}</h2>
                      {itemProgress?.completed && <span className="text-xs text-success">완료</span>}
                    </div>
                    <p className="text-sm text-text-muted mt-0.5">{lesson.subtitle}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[11px] text-text-muted">
                        {lesson.difficulty}
                      </span>
                      <span className="rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[11px] text-text-muted">
                        {source?.label ?? "Source"}
                      </span>
                      {lesson.topicTags.slice(0, 2).map(tag => (
                        <span key={tag} className="rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[11px] text-text-muted">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-text-muted mt-2">
                      듣기 {itemProgress?.listenCount ?? 0}회 · 쉐도잉 {itemProgress?.shadowingCount ?? 0}회 · 퀴즈 {attemptedQuizCount}/{quizIds.length}
                    </div>
                  </div>
                  <div className="text-text-muted">→</div>
                </div>
              </button>
            </article>
          );
        })}
      </section>

      <section className="rounded-2xl border border-border bg-surface p-4">
        <div className="font-semibold">검토한 소스</div>
        <div className="mt-3 grid gap-2">
          {INTERMEDIATE_SOURCE_PROFILES.map(source => (
            <a
              key={source.id}
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-surface-2 px-3 py-2 text-sm"
            >
              <div className="font-medium">{source.label}</div>
              <div className="mt-0.5 text-xs text-text-muted">{source.suitabilityKo}</div>
            </a>
          ))}
        </div>
      </section>

      <button
        onClick={() => nav("/review?practice=1&source=intermediate-readings&n=5")}
        className="rounded-2xl border border-accent/50 bg-accent/10 px-4 py-3 text-sm font-medium"
      >
        리딩 퀴즈 1분복습으로 풀기 →
      </button>
    </div>
  );
}
