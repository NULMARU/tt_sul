import type {
  LearnerProfile,
  LearningSignal,
  LearningStep,
  QuizAttempt,
  TimeBand,
  UserState,
} from "@shared/types/schema";
import { buildJournalInsight } from "./journal-insights";

const BANDS: TimeBand[] = ["dawn", "morning", "midday", "afternoon", "evening", "night"];
const STEPS: LearningStep[] = ["understand", "absorb", "read", "produce", "imprint"];

export function buildLearnerProfile(state: Pick<UserState, "learningSignals" | "quizAttempts" | "recallSpeedMs" | "journal" | "writingMistakes">): LearnerProfile {
  const signals = recentSignals(state.learningSignals ?? [], 14);
  const preferredTimeBands = topKeys(scoreBands(signals), 3, BANDS);
  const { bestModes, fragileModes } = scoreSteps(signals);
  const weakPhraseIds = weakPhrases(state.quizAttempts ?? {}, state.recallSpeedMs ?? {});
  const averageSessionSecondsByBand = averageDurations(signals);
  const journalInsight = buildJournalInsight(state.journal ?? [], state.writingMistakes ?? []);
  const recommendationAffinity = Object.fromEntries(BANDS.flatMap(b => {
    const seenAtBand = signals.some(s => s.timeBand === b);
    if (!seenAtBand) return [];
    const avg = averageSessionSecondsByBand[b] ?? 0;
    const fragileAtBand = signals.some(s => s.timeBand === b && s.result === "abandon");
    const value = avg > 0 && avg <= 180 ? "quick" : fragileAtBand ? "audio-only" : "full";
    return [[b, value]];
  })) as LearnerProfile["recommendationAffinity"];

  return {
    updatedAt: new Date().toISOString(),
    preferredTimeBands,
    weakPhraseIds,
    weakTags: weakPhraseIds.length > 0 ? ["needs-review"] : [],
    strongTags: preferredTimeBands.length > 0 ? ["consistent-routine"] : [],
    bestModes,
    fragileModes,
    averageSessionSecondsByBand,
    recommendationAffinity,
    journalInsight,
  };
}

function recentSignals(signals: LearningSignal[], days: number): LearningSignal[] {
  const cutoff = Date.now() - days * 86_400_000;
  return signals.filter(s => new Date(s.at).getTime() >= cutoff);
}

function scoreBands(signals: LearningSignal[]): Record<TimeBand, number> {
  const scores = Object.fromEntries(BANDS.map(b => [b, 0])) as Record<TimeBand, number>;
  for (const s of signals) {
    if (s.result === "success" || s.result === "correct") scores[s.timeBand] += 2;
    else if (s.result === "wrong" || s.result === "abandon") scores[s.timeBand] -= 1;
    else scores[s.timeBand] += 0.5;
  }
  return scores;
}

function scoreSteps(signals: LearningSignal[]): { bestModes: LearningStep[]; fragileModes: LearningStep[] } {
  const score = Object.fromEntries(STEPS.map(s => [s, 0])) as Record<LearningStep, number>;
  for (const s of signals) {
    if (!s.step) continue;
    if (s.result === "success" || s.result === "correct") score[s.step] += 2;
    if (s.result === "skip" || s.result === "abandon" || s.result === "wrong") score[s.step] -= 2;
  }
  return {
    bestModes: topKeys(score, 2, STEPS).filter(step => score[step] > 0),
    fragileModes: [...STEPS].sort((a, b) => score[a] - score[b]).filter(step => score[step] < 0).slice(0, 2),
  };
}

function weakPhrases(attempts: Record<string, QuizAttempt>, recallSpeedMs: Record<string, number[]>): string[] {
  return Object.values(attempts)
    .filter(a => {
      const total = a.totalCorrect + a.totalWrong;
      const wrongRate = total > 0 ? a.totalWrong / total : 0;
      const samples = recallSpeedMs[a.quizId] ?? [];
      const avgRecall = samples.length ? samples.reduce((sum, n) => sum + n, 0) / samples.length : 0;
      return a.totalWrong > 0 && (wrongRate >= 0.4 || avgRecall >= 5_000);
    })
    .map(a => phraseIdFromQuizId(a.quizId))
    .filter((id): id is string => !!id)
    .slice(0, 12);
}

function phraseIdFromQuizId(quizId: string): string | null {
  const match = quizId.match(/^q-(?:mc|fill|arrange|ox|tr|match)-(.+)$/);
  return match?.[1] ?? null;
}

function averageDurations(signals: LearningSignal[]): Partial<Record<TimeBand, number>> {
  const grouped = new Map<TimeBand, number[]>();
  for (const s of signals) {
    if (!s.durationMs || s.durationMs <= 0) continue;
    const arr = grouped.get(s.timeBand) ?? [];
    arr.push(s.durationMs / 1000);
    grouped.set(s.timeBand, arr);
  }
  return Object.fromEntries([...grouped.entries()].map(([band, values]) => [
    band,
    Math.round(values.reduce((sum, n) => sum + n, 0) / values.length),
  ]));
}

function topKeys<T extends string>(scores: Record<T, number>, n: number, fallback: readonly T[]): T[] {
  const ranked = [...fallback].sort((a, b) => scores[b] - scores[a]);
  return ranked.filter(k => scores[k] > 0).slice(0, n);
}
