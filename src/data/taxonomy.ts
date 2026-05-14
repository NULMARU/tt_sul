// ============================================================
// 5축 좌표 메타데이터 (라벨·이모지·한글명)
// ============================================================
import type { PlaceTag, SituationTag, TimeBand, StageId } from "../types/schema";

export const PLACE_META: Record<PlaceTag, { ko: string; emoji: string; group: "home" | "city" }> = {
  bedroom:    { ko: "침실",   emoji: "🛏️",  group: "home" },
  bathroom:   { ko: "욕실",   emoji: "🛁",  group: "home" },
  kitchen:    { ko: "주방",   emoji: "🍳",  group: "home" },
  livingroom: { ko: "거실",   emoji: "🛋️",  group: "home" },
  entrance:   { ko: "현관",   emoji: "🚪",  group: "home" },
  balcony:    { ko: "베란다", emoji: "🪟",  group: "home" },
  street:     { ko: "길거리", emoji: "🛣️",  group: "city" },
  bus_stop:   { ko: "정류장", emoji: "🚏",  group: "city" },
  subway:     { ko: "지하철", emoji: "🚇",  group: "city" },
  taxi:       { ko: "택시",   emoji: "🚕",  group: "city" },
  cafe:       { ko: "카페",   emoji: "☕",  group: "city" },
  office:     { ko: "사무실", emoji: "🏢",  group: "city" },
  store:      { ko: "마트",   emoji: "🛒",  group: "city" },
  restaurant: { ko: "식당",   emoji: "🍽️",  group: "city" },
  park:       { ko: "공원",   emoji: "🌳",  group: "city" },
  gym:        { ko: "헬스장", emoji: "💪",  group: "city" },
  elevator:   { ko: "엘리베이터", emoji: "🛗", group: "city" },
};

export const SITUATION_META: Record<SituationTag, { ko: string; emoji: string; group: string }> = {
  alarm_off:        { ko: "알람 끄기",      emoji: "⏰", group: "morning" },
  morning_routine:  { ko: "아침 루틴",      emoji: "🌅", group: "morning" },
  skincare:         { ko: "스킨케어",       emoji: "🧴", group: "morning" },
  get_dressed:      { ko: "옷 입기",        emoji: "👔", group: "morning" },
  breakfast:        { ko: "아침 식사",      emoji: "🍳", group: "morning" },
  commute_bus:      { ko: "버스 통근",      emoji: "🚌", group: "transit" },
  commute_subway:   { ko: "지하철 통근",    emoji: "🚇", group: "transit" },
  arrive_office:    { ko: "출근 도착",      emoji: "🏢", group: "transit" },
  work_start:       { ko: "업무 시작",      emoji: "💼", group: "work" },
  meeting:          { ko: "회의",           emoji: "🗓️", group: "work" },
  email:            { ko: "이메일",         emoji: "✉️", group: "work" },
  phone_call:       { ko: "전화",           emoji: "📞", group: "work" },
  lunch:            { ko: "점심",           emoji: "🍱", group: "midday" },
  coffee_order:     { ko: "카페 주문",      emoji: "☕", group: "midday" },
  small_talk:       { ko: "잡담",           emoji: "💬", group: "midday" },
  apology:          { ko: "사과",           emoji: "🙏", group: "midday" },
  thanks:           { ko: "감사",           emoji: "🙌", group: "midday" },
  afternoon_break:  { ko: "휴식",           emoji: "☕", group: "midday" },
  leave_work:       { ko: "퇴근",           emoji: "🚪", group: "evening" },
  grocery:          { ko: "장보기",         emoji: "🛒", group: "evening" },
  shopping:         { ko: "쇼핑",           emoji: "🛍️", group: "evening" },
  evening_chores:   { ko: "저녁 집안일",    emoji: "🧹", group: "evening" },
  dinner:           { ko: "저녁 식사",      emoji: "🍽️", group: "evening" },
  hobby:            { ko: "취미",           emoji: "🎮", group: "evening" },
  winding_down:     { ko: "휴식·정리",      emoji: "😌", group: "night" },
  bedtime:          { ko: "취침 준비",      emoji: "🌙", group: "night" },
};

export const TIME_META: Record<TimeBand, { ko: string; emoji: string; range: [number, number] }> = {
  dawn:      { ko: "새벽", emoji: "🌌", range: [4, 6] },
  morning:   { ko: "아침", emoji: "🌅", range: [6, 11] },
  midday:    { ko: "낮",   emoji: "☀️", range: [11, 14] },
  afternoon: { ko: "오후", emoji: "🌤️", range: [14, 18] },
  evening:   { ko: "저녁", emoji: "🌆", range: [18, 22] },
  night:     { ko: "밤",   emoji: "🌙", range: [22, 4] },
};

export const STAGE_META: Record<StageId, { title: string; description: string; emoji: string }> = {
  "stage-1": { title: "Stage 1 · 데일리 동작", description: "아침부터 점심까지의 기본 동작",        emoji: "🌅" },
  "stage-2": { title: "Stage 2 · 일상생활",    description: "퇴근 후·집에서·이동·휴식",             emoji: "🏠" },
  "stage-3": { title: "Stage 3 · 상태 표현",   description: "감정·컨디션·평가 'I am ~'",            emoji: "💬" },
  "stage-4": { title: "Stage 4 · 문장 패턴",   description: "going to / used to / if / should have", emoji: "🧩" },
  "stage-5": { title: "Stage 5 · 종합 실전",   description: "30일 종합 + 자유 작문",                emoji: "🏆" },
};

export const TIME_COLORS = {
  dawn:      { bg: "#0F172A", surface: "#1E293B", text: "#E2E8F0", accent: "#A78BFA", textMuted: "#94A3B8" },
  morning:   { bg: "#FFFBF2", surface: "#FFFFFF", text: "#2A2522", accent: "#F5C842", textMuted: "#8A8270" },
  midday:    { bg: "#F4F6FF", surface: "#FFFFFF", text: "#1F1B3A", accent: "#4F46E5", textMuted: "#6B7280" },
  afternoon: { bg: "#FFF7ED", surface: "#FFFFFF", text: "#27220F", accent: "#F97316", textMuted: "#78716C" },
  evening:   { bg: "#1F1B2E", surface: "#2A2540", text: "#F1E9FF", accent: "#A78BFA", textMuted: "#A89BC4" },
  night:     { bg: "#0F172A", surface: "#1E293B", text: "#E2E8F0", accent: "#94A3B8", textMuted: "#64748B" },
} as const;

export function getTimeBand(hour: number): TimeBand {
  if (hour >= 4 && hour < 6) return "dawn";
  if (hour >= 6 && hour < 11) return "morning";
  if (hour >= 11 && hour < 14) return "midday";
  if (hour >= 14 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 22) return "evening";
  return "night";
}
