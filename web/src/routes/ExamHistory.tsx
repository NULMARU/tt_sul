import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PROMOTION_EXAM_BY_ID } from "@shared/data/course-levels.seed";
import type { CourseLevelId, PromotionExamAttempt, PromotionExamSectionType } from "@shared/types/schema";
import { useStore } from "../lib/store";

export function ExamHistory() {
  const nav = useNavigate();
  const attempts = useStore(s => s.promotionExamAttempts ?? []);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sortedAttempts = useMemo(() => [...attempts].sort((a, b) =>
    new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  ), [attempts]);
  const selected = sortedAttempts.find(attempt => attempt.id === selectedId) ?? sortedAttempts[0];
  const stats = useMemo(() => buildStats(sortedAttempts), [sortedAttempts]);

  if (sortedAttempts.length === 0) {
    return (
      <div className="px-6 py-12 flex flex-col items-center gap-4 text-center">
        <div className="text-6xl">🧭</div>
        <div>
          <div className="text-xs text-text-muted">레벨 기록</div>
          <h1 className="text-2xl font-bold">아직 저장된 미션 결과가 없어요.</h1>
          <p className="mt-2 text-sm text-text-muted">
            레벨 탐험전이나 승급 미션을 완료하면 점수, 추천 단계, 피드백이 여기에 쌓입니다.
          </p>
        </div>
        <div className="grid w-full max-w-[360px] grid-cols-2 gap-2">
          <button
            onClick={() => nav("/axis/stage")}
            className="rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium"
          >
            Stage 선택
          </button>
          <button
            onClick={() => nav("/promotion-exam/placement-map")}
            className="rounded-xl bg-accent text-[#2A2522] px-4 py-3 text-sm font-medium"
          >
            탐험전 시작
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-4 flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <button onClick={() => nav("/axis/stage")} className="w-9 h-9 rounded-full hover:bg-surface-2">←</button>
        <div>
          <div className="text-xs text-text-muted">시험 결과 저장관리</div>
          <h1 className="text-xl font-bold">🧭 레벨 기록</h1>
        </div>
      </header>

      <section className="rounded-2xl border border-accent/50 bg-accent/10 p-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <Stat label="응시" value={`${stats.count}회`} />
          <Stat label="평균" value={`${stats.average}%`} />
          <Stat label="통과" value={`${stats.passRate}%`} />
        </div>
        <div className="mt-3 rounded-xl bg-surface/70 p-3 text-sm">
          <div className="text-xs text-text-muted">최근 추천 과정</div>
          <div className="mt-0.5 font-semibold">{levelLabel(stats.latestRecommended)}</div>
          <p className="mt-1 text-xs text-text-muted">
            시험은 잠금 장치가 아니라 방향 안내입니다. 결과와 무관하게 모든 과정은 자유롭게 선택할 수 있어요.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">최근 흐름</h2>
          <span className="text-xs text-text-muted">최근 {Math.min(8, sortedAttempts.length)}회</span>
        </div>
        <div className="mt-3 flex h-24 items-end gap-2">
          {sortedAttempts.slice(0, 8).reverse().map(attempt => {
            const pct = percent(attempt);
            return (
              <button
                key={attempt.id}
                onClick={() => setSelectedId(attempt.id)}
                className="flex h-full flex-1 flex-col items-center justify-end gap-1"
                title={`${examTitle(attempt)} ${pct}%`}
              >
                <div className="flex h-16 w-full items-end">
                  <div
                    className={`w-full rounded-t-lg ${attempt.id === selected?.id ? "bg-accent" : "bg-accent/40"}`}
                    style={{ height: `${Math.max(12, pct)}%` }}
                  />
                </div>
                <span className="text-[10px] text-text-muted">{pct}</span>
              </button>
            );
          })}
        </div>
      </section>

      {selected && (
        <section className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs text-text-muted">{formatDate(selected.completedAt)}</div>
              <h2 className="font-semibold">{examTitle(selected)}</h2>
              <p className="mt-1 text-sm text-text-muted">
                {selected.kind === "placement" ? "레벨테스트" : "승급 미션"} · 추천 {levelLabel(selected.recommendedLevel)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{selected.totalScore}/{selected.maxScore}</div>
              <div className={`text-xs font-semibold ${selected.passed ? "text-success" : "text-text-muted"}`}>
                {selected.passed ? "통과" : "연습 방향 확인"}
              </div>
            </div>
          </div>

          <div className="mt-4 h-2 rounded-full bg-surface-2 overflow-hidden">
            <div className="h-full bg-accent" style={{ width: `${percent(selected)}%` }} />
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-semibold">피드백</h3>
            <ul className="mt-2 flex flex-col gap-2 text-sm text-text-muted">
              {selected.feedback.map(item => <li key={item}>{item}</li>)}
            </ul>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-semibold">미션별 결과</h3>
            <div className="mt-2 flex flex-col gap-2">
              {selected.sectionResults.map(result => (
                <div key={result.sectionId} className="rounded-xl bg-surface-2 p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{sectionTypeLabel(result.type)}</span>
                    <span>{result.score}/{result.maxScore}</span>
                  </div>
                  <p className="mt-1 text-xs text-text-muted">{result.feedback}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="grid gap-2">
        <h2 className="font-semibold">전체 기록</h2>
        {sortedAttempts.map(attempt => (
          <button
            key={attempt.id}
            onClick={() => setSelectedId(attempt.id)}
            className={`rounded-2xl border p-3 text-left ${attempt.id === selected?.id ? "border-accent bg-accent/10" : "border-border bg-surface"}`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium">{examTitle(attempt)}</div>
                <div className="mt-0.5 text-xs text-text-muted">{formatDate(attempt.completedAt)} · 추천 {levelLabel(attempt.recommendedLevel)}</div>
              </div>
              <div className="text-right text-sm font-semibold">{percent(attempt)}%</div>
            </div>
          </button>
        ))}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface/70 p-3">
      <div className="text-xs text-text-muted">{label}</div>
      <div className="mt-1 font-bold">{value}</div>
    </div>
  );
}

function buildStats(attempts: PromotionExamAttempt[]) {
  const count = attempts.length;
  const latestRecommended = attempts[0]?.recommendedLevel ?? "beginner";
  const average = count
    ? Math.round(attempts.reduce((sum, attempt) => sum + percent(attempt), 0) / count)
    : 0;
  const passRate = count
    ? Math.round((attempts.filter(attempt => attempt.passed).length / count) * 100)
    : 0;
  return { count, latestRecommended, average, passRate };
}

function percent(attempt: PromotionExamAttempt) {
  return attempt.maxScore ? Math.round((attempt.totalScore / attempt.maxScore) * 100) : 0;
}

function examTitle(attempt: PromotionExamAttempt) {
  return PROMOTION_EXAM_BY_ID[attempt.examId]?.title ?? attempt.examId;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function levelLabel(levelId: CourseLevelId) {
  if (levelId === "beginner") return "초급";
  if (levelId === "intermediate") return "중급";
  return "상급";
}

function sectionTypeLabel(type: PromotionExamSectionType) {
  if (type === "phrase-recall") return "표현 회상";
  if (type === "story-comprehension") return "이해";
  if (type === "dialogue-response") return "대화";
  if (type === "writing") return "작문";
  return "의견";
}
