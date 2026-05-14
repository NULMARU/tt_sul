// ============================================================
// Stage / Lesson 시드 — Day와 Stage 매핑
// ============================================================
import type { Stage, Lesson, Card } from "../types/schema";
import { PHRASES, PHRASE_BY_ID } from "./phrases.seed";

// Day별 표현 그룹화
function phrasesByDay(day: number) {
  return PHRASES.filter(p => p.coords.days?.includes(day));
}

// 표현 → example 카드 자동 변환
function phraseToCard(phraseId: string, idx: number): Card {
  const p = PHRASE_BY_ID[phraseId];
  return {
    id: `card-${phraseId}`,
    type: "example",
    text: p.ko,
    highlight: p.en,
    phraseId,
    examples: [{ en: p.en, ko: p.ko, emoji: undefined }],
  };
}

// Day별 hook 카드 (학습 분위기 환기)
const HOOKS: Record<number, { emoji: string; text: string }> = {
  1:  { emoji: "🌅",  text: "아침의 첫 동작들 — 하루는 여기서 시작됩니다." },
  2:  { emoji: "🪞",  text: "거울 앞 5분 — 외출 준비의 모든 것." },
  3:  { emoji: "☕",  text: "주방에서 아침을 차리는 손짓들." },
  4:  { emoji: "🚌",  text: "현관을 나서면 도시가 시작됩니다." },
  5:  { emoji: "💼",  text: "사무실 의자에 앉아 하루의 스위치를 켭니다." },
  6:  { emoji: "🍱",  text: "점심시간 — 잠깐 숨 돌리는 1시간." },
  7:  { emoji: "🔄",  text: "1주차 — 한 줄로 잇는 하루 회상." },
  8:  { emoji: "📱",  text: "손에서 떨어지지 않는 작은 화면." },
  9:  { emoji: "🎬",  text: "퇴근 후의 짧은 자유 시간." },
  10: { emoji: "🏠",  text: "집에 오면 쌓이는 작은 일들." },
  11: { emoji: "😌",  text: "쉼의 동사들 — 가장 어려운 영어." },
  12: { emoji: "🌙",  text: "내일을 위한 마지막 준비." },
  13: { emoji: "🛒",  text: "마트 통로에서 쓰는 말들." },
  14: { emoji: "🔁",  text: "2주차 — 일상이 영어가 되는 순간." },
  15: { emoji: "🤒",  text: "몸이 말해주는 상태들." },
  16: { emoji: "😊",  text: "오늘은 이상하게 다 잘 풀립니다." },
  17: { emoji: "😤",  text: "안 풀리는 날의 감정 어휘." },
  18: { emoji: "☕",  text: "카페에서 친구와 — 평가하는 말들." },
  19: { emoji: "🙏",  text: "사과의 무게 — I'm sorry, really." },
  20: { emoji: "💬",  text: "낯선 이와의 짧은 잡담 — 충분히 따뜻해도 된다." },
  21: { emoji: "🔁",  text: "3주차 — 감정에 이름을 붙이는 법." },
  22: { emoji: "🎯",  text: "I'm going to — 계획을 말로 묶기." },
  23: { emoji: "⏪",  text: "I used to — 지난 자신과의 거리." },
  24: { emoji: "🌧️",  text: "If — 가정의 문을 여는 단어." },
  25: { emoji: "💭",  text: "I should have — 후회의 두 단어." },
  26: { emoji: "🌃",  text: "It's been — 시간이 남긴 자국." },
  27: { emoji: "☂️",  text: "Just in case — 작은 대비의 즐거움." },
  28: { emoji: "🔁",  text: "4주차 — 문법이 방을 갖게 된 주." },
  29: { emoji: "🌀",  text: "하루를 영어로 — 안에서 바깥으로." },
  30: { emoji: "🎓",  text: "30일 — 그리고 내일, 또." },
};

// Day별 강 메타
const LESSON_META: Record<number, { title: string; subtitle: string; stageId: any; storyId?: string }> = {
  1:  { title: "Day 1",  subtitle: "아침 기상 & 화장실",     stageId: "stage-1", storyId: "story-day-1" },
  2:  { title: "Day 2",  subtitle: "스킨케어 & 외출 준비",   stageId: "stage-1", storyId: "story-day-2" },
  3:  { title: "Day 3",  subtitle: "주방 & 아침 식사",       stageId: "stage-1", storyId: "story-day-3" },
  4:  { title: "Day 4",  subtitle: "이동 & 출퇴근",          stageId: "stage-1", storyId: "story-day-4" },
  5:  { title: "Day 5",  subtitle: "일 & 업무",              stageId: "stage-1", storyId: "story-day-5" },
  6:  { title: "Day 6",  subtitle: "점심시간 & 카페",        stageId: "stage-1", storyId: "story-day-6" },
  7:  { title: "Day 7",  subtitle: "1주차 복습",             stageId: "stage-1", storyId: "story-day-7" },
  8:  { title: "Day 8",  subtitle: "전자기기 & 핸드폰",      stageId: "stage-2", storyId: "story-day-8" },
  9:  { title: "Day 9",  subtitle: "여가 & 취미",            stageId: "stage-2", storyId: "story-day-9" },
  10: { title: "Day 10", subtitle: "저녁시간 & 집안일",      stageId: "stage-2", storyId: "story-day-10" },
  11: { title: "Day 11", subtitle: "휴식 & 감정",            stageId: "stage-2", storyId: "story-day-11" },
  12: { title: "Day 12", subtitle: "취침 루틴",              stageId: "stage-2", storyId: "story-day-12" },
  13: { title: "Day 13", subtitle: "쇼핑 & 외출",            stageId: "stage-2", storyId: "story-day-13" },
  14: { title: "Day 14", subtitle: "2주차 복습",             stageId: "stage-2", storyId: "story-day-14" },
  15: { title: "Day 15", subtitle: "상태 & 컨디션",          stageId: "stage-3", storyId: "story-day-15" },
  16: { title: "Day 16", subtitle: "긍정적 감정",            stageId: "stage-3", storyId: "story-day-16" },
  17: { title: "Day 17", subtitle: "부정적 감정",            stageId: "stage-3", storyId: "story-day-17" },
  18: { title: "Day 18", subtitle: "카페에서 평가하기",      stageId: "stage-3", storyId: "story-day-18" },
  19: { title: "Day 19", subtitle: "사과 & 책임",            stageId: "stage-3", storyId: "story-day-19" },
  20: { title: "Day 20", subtitle: "스몰토크 — 낯선 이",     stageId: "stage-3", storyId: "story-day-20" },
  21: { title: "Day 21", subtitle: "3주차 회고",             stageId: "stage-3", storyId: "story-day-21" },
  22: { title: "Day 22", subtitle: "I'm going to (계획)",    stageId: "stage-4", storyId: "story-day-22" },
  23: { title: "Day 23", subtitle: "I used to (과거 습관)",  stageId: "stage-4", storyId: "story-day-23" },
  24: { title: "Day 24", subtitle: "If (조건문)",            stageId: "stage-4", storyId: "story-day-24" },
  25: { title: "Day 25", subtitle: "I should have (후회)",   stageId: "stage-4", storyId: "story-day-25" },
  26: { title: "Day 26", subtitle: "It's been (시간 경험)",  stageId: "stage-4", storyId: "story-day-26" },
  27: { title: "Day 27", subtitle: "Just in case (대비)",    stageId: "stage-4", storyId: "story-day-27" },
  28: { title: "Day 28", subtitle: "4주차 회고",             stageId: "stage-4", storyId: "story-day-28" },
  29: { title: "Day 29", subtitle: "하루를 영어로 살기",     stageId: "stage-5", storyId: "story-day-29" },
  30: { title: "Day 30", subtitle: "30일 졸업",              stageId: "stage-5", storyId: "story-day-30" },
};

// Day 1~7 시나리오 매핑
const SCENARIO_MAP: Record<number, string[]> = {
  1: ["sc-1-1", "sc-1-2"],
  2: ["sc-2-1"],
  3: ["sc-3-1"],
  4: ["sc-4-1"],
  5: ["sc-5-1"],
  6: ["sc-6-1"],
  7: ["sc-7-1"],
  8: ["sc-8-1"],
  10: ["sc-10-1"],
  11: ["sc-11-1"],
  12: ["sc-12-1"],
};

export const LESSONS: Lesson[] = Object.keys(LESSON_META).map(k => {
  const day = parseInt(k, 10);
  const meta = LESSON_META[day];
  const dayPhrases = phrasesByDay(day);
  const hook = HOOKS[day];

  const cards: Card[] = [];
  if (hook) {
    cards.push({ id: `card-hook-${day}`, type: "hook", text: hook.text, emoji: hook.emoji });
  }
  dayPhrases.forEach((p, i) => cards.push(phraseToCard(p.id, i)));

  return {
    id: `lesson-${day}`,
    stageId: meta.stageId,
    day,
    title: meta.title,
    subtitle: meta.subtitle,
    emoji: hook?.emoji,
    cards,
    scenarioIds: SCENARIO_MAP[day] ?? [],
    finalQuizIds: [],          // 자동 생성 (quiz-generator)
    storyId: meta.storyId,
    coords: {
      days: [day],
      stages: [meta.stageId],
      places: Array.from(new Set(dayPhrases.flatMap(p => p.coords.places ?? []))),
      situations: Array.from(new Set(dayPhrases.flatMap(p => p.coords.situations ?? []))),
      times: Array.from(new Set(dayPhrases.flatMap(p => p.coords.times ?? []))),
    },
  };
});

export const LESSON_BY_ID: Record<string, Lesson> = Object.fromEntries(LESSONS.map(l => [l.id, l]));

export const STAGES: Stage[] = [
  {
    id: "stage-1",
    title: "Stage 1 · 데일리 동작",
    description: "아침부터 점심까지의 기본 동작",
    lessonIds: ["lesson-1", "lesson-2", "lesson-3", "lesson-4", "lesson-5", "lesson-6", "lesson-7"],
    unlockThreshold: 0,
  },
  {
    id: "stage-2",
    title: "Stage 2 · 일상생활",
    description: "퇴근 후·집에서·이동·휴식",
    lessonIds: ["lesson-8", "lesson-9", "lesson-10", "lesson-11", "lesson-12", "lesson-13", "lesson-14"],
    unlockThreshold: 0.8,
  },
  {
    id: "stage-3",
    title: "Stage 3 · 상태 표현",
    description: "감정·컨디션·평가 'I am ~'",
    lessonIds: ["lesson-15", "lesson-16", "lesson-17", "lesson-18", "lesson-19", "lesson-20", "lesson-21"],
    unlockThreshold: 0.8,
  },
  {
    id: "stage-4",
    title: "Stage 4 · 문장 패턴",
    description: "going to / used to / if / should have / just in case",
    lessonIds: ["lesson-22", "lesson-23", "lesson-24", "lesson-25", "lesson-26", "lesson-27", "lesson-28"],
    unlockThreshold: 0.8,
  },
  {
    id: "stage-5",
    title: "Stage 5 · 종합 실전",
    description: "30일 종합 + 자유 작문",
    lessonIds: ["lesson-29", "lesson-30"],
    unlockThreshold: 0.8,
  },
];

export const STAGE_BY_ID: Record<string, Stage> = Object.fromEntries(STAGES.map(s => [s.id, s]));
