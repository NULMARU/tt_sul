import { PHRASE_BY_ID, PHRASES } from "@shared/data/phrases.seed";
import type {
  ContentSuggestion,
  ContentSuggestionPhrase,
  LearnerProfile,
  QuizAttempt,
  SRSState,
} from "@shared/types/schema";
import { memoryStrength } from "./srs";

export interface ContentSuggestionDraft {
  title?: string;
  rationale?: string;
  retirePhraseIds?: string[];
  reinforcePhraseIds?: string[];
  phrases?: {
    en?: string;
    ko?: string;
    reason?: string;
    exampleEn?: string;
    exampleKo?: string;
    tags?: string[];
  }[];
  story?: {
    title?: string;
    body?: string;
    phraseEns?: string[];
  };
}

export interface ContentLabInput {
  srs: Record<string, SRSState>;
  quizAttempts: Record<string, QuizAttempt>;
  learnerProfile: LearnerProfile | null;
  customContentPhrases: ContentSuggestionPhrase[];
}

const MODERN_CANDIDATES: Array<Omit<ContentSuggestionPhrase, "id" | "reason">> = [
  {
    en: "I'm running a bit behind",
    ko: "조금 늦어지고 있어",
    coords: { stages: ["stage-3"], places: ["street", "office"], situations: ["work_start", "meeting"], times: ["morning", "midday"] },
    examples: [{ en: "I'm running a bit behind, but I'll be there soon.", ko: "조금 늦어지고 있지만 곧 도착할게." }],
    tags: ["time", "polite-update"],
  },
  {
    en: "That works for me",
    ko: "저는 괜찮아요 / 그렇게 해도 좋아요",
    coords: { stages: ["stage-3"], places: ["office", "cafe"], situations: ["meeting", "small_talk"], times: ["midday", "afternoon"] },
    examples: [{ en: "Friday at three? That works for me.", ko: "금요일 3시요? 저는 괜찮아요." }],
    tags: ["agreement", "natural-reply"],
  },
  {
    en: "Could you give me a quick rundown?",
    ko: "간단히 요약해 줄 수 있어?",
    coords: { stages: ["stage-4"], places: ["office"], situations: ["meeting", "email"], times: ["morning", "midday"] },
    examples: [{ en: "Could you give me a quick rundown before the meeting?", ko: "회의 전에 간단히 요약해 줄 수 있어?" }],
    tags: ["work", "request"],
  },
  {
    en: "Let's circle back to that",
    ko: "그건 나중에 다시 이야기하자",
    coords: { stages: ["stage-4"], places: ["office"], situations: ["meeting"], times: ["midday", "afternoon"] },
    examples: [{ en: "That's important, but let's circle back to that after lunch.", ko: "중요한데 점심 후에 다시 이야기하자." }],
    tags: ["work", "meeting"],
  },
  {
    en: "I'm trying to cut back on screen time",
    ko: "화면 보는 시간을 줄이려고 해",
    coords: { stages: ["stage-3"], places: ["livingroom", "bedroom"], situations: ["winding_down", "bedtime"], times: ["evening", "night"] },
    examples: [{ en: "I'm trying to cut back on screen time before bed.", ko: "자기 전 화면 보는 시간을 줄이려고 해." }],
    tags: ["habit", "wellbeing"],
  },
  {
    en: "I'm down for that",
    ko: "나 그거 좋아 / 나 할래",
    coords: { stages: ["stage-3"], places: ["cafe", "park"], situations: ["small_talk", "hobby"], times: ["afternoon", "evening"] },
    examples: [{ en: "A walk after work? I'm down for that.", ko: "퇴근 후 산책? 나 좋아." }],
    tags: ["casual", "agreement"],
  },
];

export function buildLocalContentSuggestion(input: ContentLabInput): ContentSuggestion {
  const stats = analyzeContent(input);
  const existingIds = new Set([...PHRASES, ...input.customContentPhrases].map(p => p.id));
  const phrases = MODERN_CANDIDATES
    .map((phrase, index) => toSuggestionPhrase(phrase, undefined, index))
    .filter(p => !existingIds.has(p.id))
    .slice(0, 4);

  return {
    id: `content-local-${Date.now()}`,
    createdAt: new Date().toISOString(),
    source: "local",
    status: "candidate",
    title: "생활 영어 보강팩",
    rationale: stats.weakPhraseIds.length > 0
      ? "현재 약점 표현과 이어지는 자연스러운 생활 표현을 보강합니다."
      : "학습 기록이 적어도 바로 쓸 수 있는 자연스러운 생활 표현을 보강합니다.",
    retirePhraseIds: stats.masteredPhraseIds.slice(0, 8),
    reinforcePhraseIds: stats.weakPhraseIds.slice(0, 8),
    phrases,
    story: {
      title: "A Small Schedule Change",
      body: `I'm running a bit behind, so I send a quick message before the meeting. "Could you give me a quick rundown when I arrive?" My coworker says, "Sure. Three o'clock still works for me." Small update, no panic.`,
      phraseEns: ["I'm running a bit behind", "Could you give me a quick rundown?", "That works for me"],
    },
  };
}

export function buildLlmContentSuggestion(input: ContentLabInput, draft: ContentSuggestionDraft): ContentSuggestion {
  const stats = analyzeContent(input);
  const existingEns = new Set([...PHRASES, ...input.customContentPhrases].map(p => normalizeEn(p.en)));
  const phrases = (draft.phrases ?? [])
    .map((p, i) => toSuggestionPhrase({
      en: String(p.en ?? ""),
      ko: String(p.ko ?? ""),
      coords: { stages: ["stage-3"], places: ["office", "cafe"], situations: ["small_talk", "meeting"], times: ["midday", "evening"] },
      examples: p.exampleEn ? [{ en: p.exampleEn, ko: p.exampleKo ?? p.ko ?? "" }] : undefined,
      tags: p.tags ?? ["llm-suggested"],
    }, p.reason, i))
    .filter(p => p.en && p.ko)
    .filter(p => !existingEns.has(normalizeEn(p.en)))
    .slice(0, 6);

  return {
    id: `content-llm-${Date.now()}`,
    createdAt: new Date().toISOString(),
    source: "llm",
    status: "candidate",
    title: draft.title || "AI 콘텐츠 보강 제안",
    rationale: draft.rationale || "학습 기록을 바탕으로 표현과 짧은 읽기 자료를 제안합니다.",
    retirePhraseIds: normalizePhraseIds(draft.retirePhraseIds ?? stats.masteredPhraseIds).slice(0, 10),
    reinforcePhraseIds: normalizePhraseIds(draft.reinforcePhraseIds ?? stats.weakPhraseIds).slice(0, 10),
    phrases: phrases.length > 0 ? phrases : buildLocalContentSuggestion(input).phrases,
    story: draft.story?.body ? {
      title: draft.story.title || "A Short Everyday Moment",
      body: draft.story.body,
      phraseEns: draft.story.phraseEns ?? phrases.map(p => p.en).slice(0, 3),
    } : undefined,
  };
}

export function contentLabPayload(input: ContentLabInput) {
  const stats = analyzeContent(input);
  return {
    weakPhrases: stats.weakPhraseIds.map(id => phraseLabel(id)).filter(Boolean),
    masteredPhrases: stats.masteredPhraseIds.map(id => phraseLabel(id)).filter(Boolean),
    existingCustomPhrases: input.customContentPhrases.map(p => p.en).slice(-20),
    recentMistakes: Object.values(input.quizAttempts)
      .filter(a => a.totalWrong > 0)
      .sort((a, b) => new Date(b.lastAttemptAt).getTime() - new Date(a.lastAttemptAt).getTime())
      .slice(0, 12)
      .map(a => a.quizId),
  };
}

export function analyzeContent(input: ContentLabInput) {
  const masteredPhraseIds = PHRASES
    .filter(p => isMastered(input.srs, p.id))
    .map(p => p.id);
  const weakPhraseIds = input.learnerProfile?.weakPhraseIds?.length
    ? input.learnerProfile.weakPhraseIds
    : PHRASES.filter(p => memoryStrength(input.srs[`q-mc-${p.id}`]) < 0.35).slice(0, 10).map(p => p.id);
  return { masteredPhraseIds, weakPhraseIds };
}

function isMastered(srs: Record<string, SRSState>, phraseId: string): boolean {
  const keys = [`q-mc-${phraseId}`, `q-fill-${phraseId}`, `q-arrange-${phraseId}`, `q-ox-${phraseId}`];
  const states = keys.map(k => srs[k]).filter(Boolean);
  if (states.length === 0) return false;
  return states.some(s => s.consecutiveCorrect >= 3 && memoryStrength(s) > 0.6);
}

function toSuggestionPhrase(
  phrase: Omit<ContentSuggestionPhrase, "id" | "reason">,
  reason = "기존 콘텐츠와 겹치지 않는 자연스러운 표현입니다.",
  offset = 0,
): ContentSuggestionPhrase {
  return {
    ...phrase,
    id: `custom-${slugify(phrase.en)}-${offset}`,
    reason,
  };
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "phrase";
}

function phraseLabel(id: string): string | null {
  const phraseId = normalizePhraseId(id);
  const p = PHRASE_BY_ID[phraseId];
  return p ? `${p.en} (${p.ko})` : phraseId;
}

function normalizePhraseIds(ids: string[]): string[] {
  return [...new Set(ids.map(normalizePhraseId))];
}

function normalizePhraseId(id: string): string {
  return id.replace(/^q-(?:mc|fill|arrange|ox|tr|match)-/, "");
}

function normalizeEn(en: string): string {
  return en.toLowerCase().replace(/[^\w\s']/g, "").replace(/\s+/g, " ").trim();
}
