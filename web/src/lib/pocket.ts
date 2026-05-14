import { LESSONS } from "@shared/data/stages.seed";
import type { Lesson, TimeBand } from "@shared/types/schema";
import { currentTimeBand } from "./time";

export interface NowSuggestion {
  lesson: Lesson;
  label: string;          // "Day 1 기상 루틴 (1분 SRS)"
  band: TimeBand;
  reason: string;         // 추천 근거 (UI 디버그용)
  modeHint: "quick" | "full" | "audio-only";
}

/**
 * 현재 시간대 + 사용자 진행률로 단 하나의 Now 추천을 생성.
 * - 진행 안 한 가장 빠른 day, 단 시간대와 day의 time 좌표가 일치하는 것 우선
 */
export function pickNow(completedLessonIds: Set<string>): NowSuggestion {
  const band = currentTimeBand();

  const candidates = LESSONS.filter(l => !completedLessonIds.has(l.id));
  const banded = candidates.filter(l => l.coords.times?.includes(band));

  const pick = banded[0] ?? candidates[0] ?? LESSONS[0];
  const reason = banded[0]
    ? `${band} 시간대 일치, 진행 안 한 가장 빠른 강`
    : `진행 안 한 가장 빠른 강 (시간대 무관)`;

  const modeHint: NowSuggestion["modeHint"] =
    band === "morning" || band === "evening" ? "full" :
    band === "midday" ? "quick" : "audio-only";

  const label = `${pick.title} ${pick.subtitle} (${modeHint === "quick" ? "1분 SRS" : modeHint === "audio-only" ? "오디오 모드" : "회로 시작"})`;

  return { lesson: pick, label, band, reason, modeHint };
}
