import { LESSONS } from "@shared/data/stages.seed";
import { getTimeBand } from "@shared/data/taxonomy";
import type {
  LearnerProfile,
  Lesson,
  PlaceTag,
  RecommendationFeedback,
  SituationTag,
  SRSState,
  TimeBand,
  UserState,
} from "@shared/types/schema";
import { currentTimeBand } from "./time";
import { isDueNow } from "./srs";

export interface NowSuggestion {
  id: string;
  type: "lesson" | "review" | "story" | "roleplay";
  lesson: Lesson;
  storyId?: string;
  label: string;
  band: TimeBand;
  reason: string;
  reasons: string[];
  warnings?: string[];
  modeHint: "quick" | "full" | "audio-only";
  durationMin: number;
  score: number;
}

export interface PickNowInput {
  now?: Date;
  completedLessonIds: Set<string>;
  lessonProgress?: UserState["lessonProgress"];
  srs?: Record<string, SRSState>;
  quizAttempts?: UserState["quizAttempts"];
  storyProgress?: UserState["storyProgress"];
  prefs?: UserState["prefs"];
  learnerProfile?: LearnerProfile | null;
  recommendationFeedback?: Record<string, RecommendationFeedback>;
  recentDismissedSuggestionIds?: string[];
  explicitContext?: {
    place?: PlaceTag;
    situation?: SituationTag;
    availableMinutes?: number;
    mode?: "quick" | "full" | "audio-only";
  };
}

type TimeFit = "strong" | "weak" | "neutral" | "mismatch";

const WEAK_MATCH: Record<TimeBand, TimeBand[]> = {
  dawn: ["morning", "night"],
  morning: ["dawn", "midday"],
  midday: ["morning", "afternoon"],
  afternoon: ["midday", "evening"],
  evening: ["afternoon", "night"],
  night: ["evening", "dawn"],
};

const BAD_MATCH: Record<TimeBand, TimeBand[]> = {
  dawn: ["midday", "afternoon", "evening"],
  morning: ["evening", "night"],
  midday: ["night"],
  afternoon: ["dawn", "night"],
  evening: ["morning"],
  night: ["morning", "midday"],
};

export function pickNow(inputOrCompleted: PickNowInput | Set<string>): NowSuggestion {
  const input = inputOrCompleted instanceof Set
    ? { completedLessonIds: inputOrCompleted }
    : inputOrCompleted;
  const now = input.now ?? new Date();
  const band = input.now ? getTimeBand(now.getHours()) : currentTimeBand();
  const prefs = input.prefs;
  const dailyGoal = prefs?.dailyMinutesGoal ?? 5;
  const dueCount = countDue(input.srs);
  const completed = input.completedLessonIds;
  const candidates = LESSONS.filter(l => !completed.has(l.id));
  const pool = candidates.length > 0 ? candidates : LESSONS;
  const scored = pool.map(lesson => scoreLesson(lesson, input, band, dueCount, dailyGoal));
  scored.sort((a, b) => b.score - a.score);
  const best = scored[0] ?? scoreLesson(LESSONS[0], input, band, dueCount, dailyGoal);
  const reviewScore = scoreReview(input, band, dueCount, dailyGoal);

  if (dueCount > 0 && reviewScore.score >= best.score) {
    return {
      id: `review-${band}-${Math.min(dueCount, 10)}`,
      type: "review",
      lesson: best.lesson,
      band,
      label: `복습 ${dueCount}개 대기`,
      modeHint: reviewScore.modeHint,
      durationMin: reviewScore.durationMin,
      score: reviewScore.score,
      reason: reviewScore.reasons[0] ?? "복습할 문항이 있어요",
      reasons: reviewScore.reasons,
    };
  }

  const modeHint = pickMode(band, dailyGoal, input.learnerProfile, input.explicitContext?.mode);
  const warnings = best.fit === "mismatch" ? ["지금 시간대와 강의 맥락이 완전히 맞지는 않아요"] : undefined;
  const type: NowSuggestion["type"] = modeHint === "audio-only" && best.lesson.storyId ? "story" : "lesson";
  const labelPrefix = best.fit === "mismatch" ? "다음에 이어갈 강의" : "지금 추천";
  const durationMin = modeHint === "full" ? Math.max(5, dailyGoal) : modeHint === "quick" ? 2 : 3;

  return {
    id: `${type}-${best.lesson.id}-${band}-${modeHint}`,
    type,
    lesson: best.lesson,
    storyId: type === "story" ? best.lesson.storyId : undefined,
    band,
    label: `${labelPrefix} · ${best.lesson.title}`,
    modeHint,
    durationMin,
    score: best.score,
    reason: best.reasons[0] ?? "진행하기 좋은 강의입니다",
    reasons: best.reasons,
    warnings,
  };
}

function scoreLesson(
  lesson: Lesson,
  input: PickNowInput,
  band: TimeBand,
  dueCount: number,
  dailyGoal: number,
): { lesson: Lesson; score: number; fit: TimeFit; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;
  const fit = timeFit(lesson.coords.times, band);

  if (fit === "strong") {
    score += 40;
    reasons.push("현재 시간대와 잘 맞아요");
  } else if (fit === "weak") {
    score += 15;
    reasons.push("현재 시간대와 가깝게 이어져요");
  } else if (fit === "mismatch") {
    score -= 60;
    reasons.push("시간대가 맞지 않아 점수를 낮췄어요");
  } else {
    reasons.push("시간대 정보가 적어 기본 후보로 봤어요");
  }

  const lp = input.lessonProgress?.[lesson.id];
  if (!lp?.completed) {
    score += 20;
    reasons.push(lp?.lastViewedCardOrder ? "이어서 하기 좋아요" : "아직 완료하지 않은 강의예요");
  }
  if (lp?.lastViewedCardOrder && !lp.completed) score += 15;

  if (dailyGoal <= 5 && lesson.cards.length <= 8) {
    score += 10;
    reasons.push("짧은 목표 시간에 맞아요");
  }

  const profile = input.learnerProfile;
  if (profile?.preferredTimeBands.includes(band)) {
    score += 10;
    reasons.push("평소 이 시간대 학습 흐름이 좋아요");
  }
  const affinity = profile?.recommendationAffinity[band];
  if (affinity === "audio-only" && lesson.storyId) score += 8;
  if (dueCount >= 5) score -= 15;

  const feedback = input.recommendationFeedback?.[`lesson-${lesson.id}-${band}`];
  if (feedback && feedback.dismissed > feedback.clicked) {
    score -= 25;
    reasons.push("최근 비슷한 추천을 건너뛴 기록이 있어요");
  }
  if (input.recentDismissedSuggestionIds?.some(id => id.includes(lesson.id))) {
    score -= 20;
  }

  const ctx = input.explicitContext;
  if (ctx?.place && lesson.coords.places?.includes(ctx.place)) score += 12;
  if (ctx?.situation && lesson.coords.situations?.includes(ctx.situation)) score += 12;
  if (ctx?.availableMinutes && ctx.availableMinutes <= 3 && lesson.cards.length <= 6) score += 8;

  return { lesson, score, fit, reasons };
}

function scoreReview(
  input: PickNowInput,
  band: TimeBand,
  dueCount: number,
  dailyGoal: number,
): { score: number; modeHint: NowSuggestion["modeHint"]; durationMin: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = dueCount >= 5 ? 50 : 35;
  reasons.push(dueCount >= 5 ? "복습 대기 문항이 많아요" : "복습할 문항이 있어요");
  if (dailyGoal <= 5) {
    score += 15;
    reasons.push("짧은 목표 시간에는 복습이 잘 맞아요");
  }
  const affinity = input.learnerProfile?.recommendationAffinity[band];
  if (affinity === "quick") score += 10;
  if (band === "night" || band === "dawn") {
    score += 8;
    reasons.push("늦은 시간에는 짧은 복습이 부담이 적어요");
  }
  return {
    score,
    modeHint: dailyGoal <= 5 || band === "night" || band === "dawn" ? "quick" : "full",
    durationMin: Math.min(5, Math.max(1, Math.ceil(dueCount / 2))),
    reasons,
  };
}

function timeFit(times: TimeBand[] | undefined, band: TimeBand): TimeFit {
  if (!times || times.length === 0) return "neutral";
  if (times.includes(band)) return "strong";
  if (times.some(t => WEAK_MATCH[band].includes(t))) return "weak";
  if (times.some(t => BAD_MATCH[band].includes(t))) return "mismatch";
  return "neutral";
}

function pickMode(
  band: TimeBand,
  dailyGoal: number,
  profile?: LearnerProfile | null,
  explicit?: NowSuggestion["modeHint"],
): NowSuggestion["modeHint"] {
  if (explicit) return explicit;
  const affinity = profile?.recommendationAffinity[band];
  if (affinity) return affinity;
  if (band === "night" || band === "dawn") return "audio-only";
  if (dailyGoal <= 5 || band === "midday") return "quick";
  return "full";
}

function countDue(srs: Record<string, SRSState> | undefined): number {
  if (!srs) return 0;
  return Object.values(srs).filter(s => isDueNow(s)).length;
}
