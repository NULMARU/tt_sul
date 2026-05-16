import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { get as idbGet, set as idbSet, del as idbDel } from "idb-keyval";
import { PHRASES } from "@shared/data/phrases.seed";
import type {
  AdaptiveUiPatch,
  ContentSuggestion,
  LearningSignal,
  LearnerProfile,
  RecommendationFeedback,
  StoryDifficulty,
  UserState,
} from "@shared/types/schema";
import { updateAttempt, updateSRS } from "./srs";
import { currentTimeBand } from "./time";

const STORE_KEY = "sulsul-plus:user-state";

const idbStorage = {
  getItem: async (name: string) => (await idbGet<string>(name)) ?? null,
  setItem: async (name: string, value: string) => { await idbSet(name, value); },
  removeItem: async (name: string) => { await idbDel(name); },
};

function emptyState(): UserState {
  return {
    srs: {},
    quizAttempts: {},
    recallSpeedMs: {},
    lessonProgress: {},
    storyProgress: {},
    myPhrases: [],
    journal: [],
    bookmarks: [],
    notes: {},
    learningSignals: [],
    learnerProfile: null,
    recommendationFeedback: {},
    adaptiveUiPatches: [],
    contentSuggestions: [],
    customContentPhrases: [],
    unlockedStages: ["stage-1"],
    stats: {
      streak: 0,
      totalStudySeconds: 0,
      totalCardsViewed: 0,
      totalQuizzesAttempted: 0,
      ttsPlays: 0,
      recordingsMade: 0,
      storiesRead: 0,
      journalEntries: 0,
    },
    prefs: {
      dailyMinutesGoal: 5,
      narrationLevel: "examples",
      ttsRate: 1,
      ttsPitch: 1,
      timeColorAuto: true,
      notificationEnabled: false,
      darkMode: "system",
      fontSize: "md",
      unlockAllStages: false,
      adaptiveUiLevel: "safe",
    },
  };
}

interface StoreActions {
  recordCardView: (lessonId: string, cardOrder: number, total: number) => void;
  recordQuizAttempt: (quizId: string, lessonId: string | undefined, correct: boolean, recallMs?: number) => void;
  completeLesson: (lessonId: string) => void;
  setStoryRead: (storyId: string, difficulty: StoryDifficulty, quizScore?: number) => void;
  bumpStreak: () => void;
  recordSignal: (signal: Omit<LearningSignal, "id" | "at" | "timeBand"> & Partial<Pick<LearningSignal, "at" | "timeBand">>) => void;
  recordTtsPlay: (text?: string) => void;
  recordRecordingMade: () => void;
  setLearnerProfile: (profile: LearnerProfile | null) => void;
  recordRecommendationFeedback: (suggestionId: string, action: "shown" | "clicked" | "dismissed") => void;
  upsertAdaptiveUiPatch: (patch: AdaptiveUiPatch) => void;
  rejectAdaptiveUiPatch: (patchId: string) => void;
  expireAdaptiveUiPatch: (patchId: string) => void;
  upsertContentSuggestion: (suggestion: ContentSuggestion) => void;
  acceptContentSuggestion: (suggestionId: string) => void;
  rejectContentSuggestion: (suggestionId: string) => void;
  toggleBookmark: (id: string) => void;
  saveNote: (id: string, text: string) => void;
  addJournal: (
    day: number,
    text: string,
    derivedQuizIds?: string[],
    derivedQuizzes?: UserState["journal"][number]["derivedQuizzes"],
  ) => void;
  resetAll: () => void;
  exportJson: () => string;
  setPrefs: (partial: Partial<UserState["prefs"]>) => void;
  unlockAll: () => void;
}

export const useStore = create<UserState & StoreActions>()(
  persist(
    (set, get) => ({
      ...emptyState(),

      recordCardView: (lessonId, cardOrder, total) => set(s => {
        const lp = s.lessonProgress[lessonId] ?? { completed: false, lastViewedCardOrder: 0 };
        return {
          lessonProgress: {
            ...s.lessonProgress,
            [lessonId]: { ...lp, lastViewedCardOrder: Math.max(lp.lastViewedCardOrder, cardOrder), completed: lp.completed || cardOrder >= total },
          },
          stats: { ...s.stats, totalCardsViewed: s.stats.totalCardsViewed + 1 },
        };
      }),

      recordQuizAttempt: (quizId, lessonId, correct, recallMs) => set(s => {
        const next = updateAttempt(s.quizAttempts[quizId], quizId, lessonId, correct);
        const srsNext = updateSRS(s.srs[quizId], correct);
        const recall = recallMs ? { ...s.recallSpeedMs, [quizId]: [...(s.recallSpeedMs[quizId] ?? []).slice(-9), recallMs] } : s.recallSpeedMs;
        return {
          quizAttempts: { ...s.quizAttempts, [quizId]: next },
          srs:          { ...s.srs, [quizId]: srsNext },
          recallSpeedMs: recall,
          learningSignals: [
            ...(s.learningSignals ?? []).slice(-499),
            createSignal({
              type: "quiz_answer",
              quizId,
              lessonId,
              result: correct ? "correct" : "wrong",
              durationMs: recallMs,
            }),
          ],
          stats: { ...s.stats, totalQuizzesAttempted: s.stats.totalQuizzesAttempted + 1 },
        };
      }),

      completeLesson: (lessonId) => set(s => ({
        lessonProgress: {
          ...s.lessonProgress,
          [lessonId]: { ...(s.lessonProgress[lessonId] ?? { lastViewedCardOrder: 0 }), completed: true, completedAt: new Date().toISOString() },
        },
        learningSignals: [
          ...(s.learningSignals ?? []).slice(-499),
          createSignal({ type: "lesson_complete", lessonId, result: "success" }),
        ],
      })),

      setStoryRead: (storyId, difficulty, quizScore) => set(s => ({
        storyProgress: { ...s.storyProgress, [storyId]: { read: true, difficulty, quizScore, readAt: new Date().toISOString() } },
        learningSignals: [
          ...(s.learningSignals ?? []).slice(-499),
          createSignal({ type: "story_read", result: "success", metadata: { storyId, difficulty, quizScore: quizScore ?? -1 } }),
        ],
        stats: { ...s.stats, storiesRead: s.stats.storiesRead + 1 },
      })),

      bumpStreak: () => set(s => {
        const today = new Date().toISOString().slice(0, 10);
        if (s.stats.lastStudyDate === today) return {};
        const y = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
        const streak = s.stats.lastStudyDate === y ? s.stats.streak + 1 : 1;
        return { stats: { ...s.stats, streak, lastStudyDate: today } };
      }),

      toggleBookmark: (id) => set(s => ({
        bookmarks: s.bookmarks.includes(id) ? s.bookmarks.filter(x => x !== id) : [...s.bookmarks, id],
      })),

      saveNote: (id, text) => set(s => ({ notes: { ...s.notes, [id]: text } })),

      addJournal: (day, text, derivedQuizIds, derivedQuizzes) => set(s => ({
        journal: [...s.journal, {
          id: `j-${Date.now()}`,
          day,
          date: new Date().toISOString(),
          text,
          derivedQuizIds,
          derivedQuizzes,
        }],
        learningSignals: [
          ...(s.learningSignals ?? []).slice(-499),
          createSignal({ type: "journal_add", result: "success", metadata: { day, derivedQuizCount: derivedQuizIds?.length ?? 0 } }),
        ],
        stats: { ...s.stats, journalEntries: s.stats.journalEntries + 1 },
      })),

      recordSignal: (signal) => set(s => ({
        learningSignals: [
          ...(s.learningSignals ?? []).slice(-499),
          createSignal(signal),
        ],
      })),

      recordTtsPlay: (text) => set(s => ({
        stats: { ...s.stats, ttsPlays: s.stats.ttsPlays + 1 },
        learningSignals: [
          ...(s.learningSignals ?? []).slice(-499),
          createSignal({ type: "tts_play", result: "success", metadata: { length: text?.length ?? 0 } }),
        ],
      })),

      recordRecordingMade: () => set(s => ({
        stats: { ...s.stats, recordingsMade: s.stats.recordingsMade + 1 },
      })),

      setLearnerProfile: (profile) => set({ learnerProfile: profile }),

      recordRecommendationFeedback: (suggestionId, action) => set(s => {
        const prev = (s.recommendationFeedback ?? {})[suggestionId] ?? emptyRecommendationFeedback(suggestionId);
        const next: RecommendationFeedback = {
          ...prev,
          shown: prev.shown + (action === "shown" ? 1 : 0),
          clicked: prev.clicked + (action === "clicked" ? 1 : 0),
          dismissed: prev.dismissed + (action === "dismissed" ? 1 : 0),
          lastActionAt: new Date().toISOString(),
        };
        return {
          recommendationFeedback: { ...(s.recommendationFeedback ?? {}), [suggestionId]: next },
          learningSignals: [
            ...(s.learningSignals ?? []).slice(-499),
            createSignal({
              type: action === "shown" ? "recommendation_shown" : action === "clicked" ? "recommendation_clicked" : "recommendation_dismissed",
              result: action === "clicked" ? "success" : action === "dismissed" ? "skip" : undefined,
              metadata: { suggestionId },
            }),
          ],
        };
      }),

      upsertAdaptiveUiPatch: (patch) => set(s => {
        const patches = (s.adaptiveUiPatches ?? []).filter(p => p.id !== patch.id);
        return { adaptiveUiPatches: [...patches, patch].slice(-50) };
      }),

      rejectAdaptiveUiPatch: (patchId) => set(s => ({
        adaptiveUiPatches: (s.adaptiveUiPatches ?? []).map(p => p.id === patchId ? { ...p, status: "rejected" } : p),
        learningSignals: [
          ...(s.learningSignals ?? []).slice(-499),
          createSignal({ type: "adaptive_ui_reverted", result: "skip", metadata: { patchId } }),
        ],
      })),

      expireAdaptiveUiPatch: (patchId) => set(s => ({
        adaptiveUiPatches: (s.adaptiveUiPatches ?? []).map(p => p.id === patchId ? { ...p, status: "expired" } : p),
      })),

      upsertContentSuggestion: (suggestion) => set(s => {
        const suggestions = (s.contentSuggestions ?? []).filter(c => c.id !== suggestion.id);
        return { contentSuggestions: [...suggestions, suggestion].slice(-20) };
      }),

      acceptContentSuggestion: (suggestionId) => set(s => {
        const suggestion = (s.contentSuggestions ?? []).find(c => c.id === suggestionId);
        if (!suggestion) return {};
        const existingIds = new Set([...PHRASES, ...(s.customContentPhrases ?? [])].map(p => p.id));
        const existingEns = new Set([...PHRASES, ...(s.customContentPhrases ?? [])].map(p => normalizeEn(p.en)));
        const acceptedPhrases = suggestion.phrases.filter(p => !existingIds.has(p.id) && !existingEns.has(normalizeEn(p.en)));
        return {
          contentSuggestions: (s.contentSuggestions ?? []).map(c => c.id === suggestionId ? { ...c, status: "accepted" } : c),
          customContentPhrases: [...(s.customContentPhrases ?? []), ...acceptedPhrases].slice(-100),
        };
      }),

      rejectContentSuggestion: (suggestionId) => set(s => ({
        contentSuggestions: (s.contentSuggestions ?? []).map(c => c.id === suggestionId ? { ...c, status: "rejected" } : c),
      })),

      resetAll: () => set(emptyState()),

      exportJson: () => JSON.stringify(get(), null, 2),

      setPrefs: (partial) => set(s => ({ prefs: { ...s.prefs, ...partial } })),

      unlockAll: () => set(s => ({ prefs: { ...s.prefs, unlockAllStages: true } })),
    }),
    {
      name: STORE_KEY,
      storage: createJSONStorage(() => idbStorage),
      version: 1,
    }
  )
);

function createSignal(signal: Omit<LearningSignal, "id" | "at" | "timeBand"> & Partial<Pick<LearningSignal, "at" | "timeBand">>): LearningSignal {
  return {
    ...signal,
    id: `sig-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: signal.at ?? new Date().toISOString(),
    timeBand: signal.timeBand ?? currentTimeBand(),
  };
}

function emptyRecommendationFeedback(suggestionId: string): RecommendationFeedback {
  return { suggestionId, shown: 0, clicked: 0, dismissed: 0 };
}

function normalizeEn(en: string): string {
  return en.toLowerCase().replace(/[^\w\s']/g, "").replace(/\s+/g, " ").trim();
}
