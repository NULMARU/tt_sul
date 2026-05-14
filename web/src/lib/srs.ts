import type { SRSState, QuizAttempt } from "@shared/types/schema";

const INTERVALS_DAYS = [0.25, 1, 3, 7, 16, 30, 60];

export function defaultSRS(): SRSState {
  return { consecutiveCorrect: 0, nextReviewAt: new Date().toISOString(), lapses: 0 };
}

export function updateSRS(prev: SRSState | undefined, correct: boolean): SRSState {
  const cur = prev ?? defaultSRS();
  if (correct) {
    const cc = cur.consecutiveCorrect + 1;
    const days = INTERVALS_DAYS[Math.min(cc - 1, INTERVALS_DAYS.length - 1)];
    return {
      consecutiveCorrect: cc,
      nextReviewAt: new Date(Date.now() + days * 86_400_000).toISOString(),
      lapses: cur.lapses,
      lastResult: "correct",
    };
  }
  return {
    consecutiveCorrect: 0,
    nextReviewAt: new Date(Date.now() + 0.25 * 86_400_000).toISOString(),
    lapses: cur.lapses + 1,
    lastResult: "wrong",
  };
}

export function isDueNow(state: SRSState, now = Date.now()): boolean {
  return new Date(state.nextReviewAt).getTime() <= now;
}

export function updateAttempt(prev: QuizAttempt | undefined, quizId: string, lessonId: string | undefined, correct: boolean): QuizAttempt {
  const srs = updateSRS(prev ? { consecutiveCorrect: prev.consecutiveCorrect, nextReviewAt: prev.nextReviewAt, lapses: 0 } : undefined, correct);
  return {
    quizId,
    lessonId,
    consecutiveCorrect: srs.consecutiveCorrect,
    nextReviewAt: srs.nextReviewAt,
    totalCorrect: (prev?.totalCorrect ?? 0) + (correct ? 1 : 0),
    totalWrong:   (prev?.totalWrong ?? 0)   + (correct ? 0 : 1),
    lastAttemptAt: new Date().toISOString(),
  };
}

/**
 * 복습 큐 정렬: consecutiveCorrect ASC, nextReviewAt ASC.
 * wrongOnly=true 면 lastResult==="wrong" 만.
 */
export function buildReviewQueue(attempts: Record<string, QuizAttempt>, opts: { n?: number; wrongOnly?: boolean } = {}): string[] {
  const arr = Object.values(attempts).filter(a => isDueNow({
    consecutiveCorrect: a.consecutiveCorrect, nextReviewAt: a.nextReviewAt, lapses: 0,
  }));
  const filtered = opts.wrongOnly ? arr.filter(a => a.consecutiveCorrect === 0) : arr;
  filtered.sort((a, b) =>
    a.consecutiveCorrect - b.consecutiveCorrect ||
    new Date(a.nextReviewAt).getTime() - new Date(b.nextReviewAt).getTime()
  );
  return filtered.slice(0, opts.n ?? 50).map(a => a.quizId);
}

/**
 * Phrase Memory Map 강도 (0..1)
 */
export function memoryStrength(state: SRSState | undefined, now = Date.now()): number {
  if (!state) return 0;
  const fromCorrect = Math.min(1, state.consecutiveCorrect / 5);
  const daysSince = Math.max(0, (now - (new Date(state.nextReviewAt).getTime() - 0.25 * 86_400_000)) / 86_400_000);
  const decay = Math.exp(-daysSince / 7);
  return Math.max(0, Math.min(1, fromCorrect * decay));
}
