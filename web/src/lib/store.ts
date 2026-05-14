import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { get as idbGet, set as idbSet, del as idbDel } from "idb-keyval";
import type { UserState, StoryDifficulty } from "@shared/types/schema";
import { updateAttempt, updateSRS } from "./srs";

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
    },
  };
}

interface StoreActions {
  recordCardView: (lessonId: string, cardOrder: number, total: number) => void;
  recordQuizAttempt: (quizId: string, lessonId: string | undefined, correct: boolean, recallMs?: number) => void;
  completeLesson: (lessonId: string) => void;
  setStoryRead: (storyId: string, difficulty: StoryDifficulty, quizScore?: number) => void;
  bumpStreak: () => void;
  toggleBookmark: (id: string) => void;
  saveNote: (id: string, text: string) => void;
  addJournal: (day: number, text: string, derivedQuizIds?: string[]) => void;
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
          stats: { ...s.stats, totalQuizzesAttempted: s.stats.totalQuizzesAttempted + 1 },
        };
      }),

      completeLesson: (lessonId) => set(s => ({
        lessonProgress: {
          ...s.lessonProgress,
          [lessonId]: { ...(s.lessonProgress[lessonId] ?? { lastViewedCardOrder: 0 }), completed: true, completedAt: new Date().toISOString() },
        },
      })),

      setStoryRead: (storyId, difficulty, quizScore) => set(s => ({
        storyProgress: { ...s.storyProgress, [storyId]: { read: true, difficulty, quizScore, readAt: new Date().toISOString() } },
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

      addJournal: (day, text, derivedQuizIds) => set(s => ({
        journal: [...s.journal, {
          id: `j-${Date.now()}`,
          day,
          date: new Date().toISOString(),
          text,
          derivedQuizIds,
        }],
        stats: { ...s.stats, journalEntries: s.stats.journalEntries + 1 },
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
