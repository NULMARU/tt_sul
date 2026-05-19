import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { get as idbGet, set as idbSet, del as idbDel } from "idb-keyval";
import { PHRASES } from "@shared/data/phrases.seed";
import type {
  AdaptiveUiPatch,
  AdvancedSpeakingAttempt,
  AdvancedWritingFeedback,
  ContentSuggestion,
  CourseLevelId,
  DialoguePracticeMode,
  LearningSignal,
  LearnerProfile,
  PromotionExamAttempt,
  RecommendationFeedback,
  StoryDifficulty,
  UserState,
} from "@shared/types/schema";
import { updateAttempt, updateSRS } from "./srs";
import { currentTimeBand } from "./time";
import { DEFAULT_LANGUAGE_ID, userStateStoreKey } from "./language-storage";

const STORE_KEY = userStateStoreKey(DEFAULT_LANGUAGE_ID);

const idbStorage = {
  getItem: async (name: string) => (await idbGet<string>(name)) ?? null,
  setItem: async (name: string, value: string) => { await idbSet(name, value); },
  removeItem: async (name: string) => { await idbDel(name); },
};

function emptyState(): UserState {
  return {
    targetLanguageId: DEFAULT_LANGUAGE_ID,
    currentCourseLevel: "beginner",
    promotionExamAttempts: [],
    dialogueProgress: {},
    intermediateReadingProgress: {},
    advancedArticleProgress: {},
    generatedAdvancedArticles: [],
    srs: {},
    quizAttempts: {},
    recallSpeedMs: {},
    lessonProgress: {},
    storyProgress: {},
    myPhrases: [],
    journal: [],
    writingMistakes: [],
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
      ttsProvider: "system",
      audioPrebuildAutoEnabled: false,
      audioPrebuildTime: "07:00",
      audioPrebuildScope: "today",
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
  setTargetLanguage: (languageId: UserState["targetLanguageId"]) => void;
  setCurrentCourseLevel: (levelId: CourseLevelId) => void;
  recordPromotionExamAttempt: (attempt: PromotionExamAttempt) => void;
  addGeneratedAdvancedArticle: (article: UserState["generatedAdvancedArticles"][number]) => void;
  recordDialoguePractice: (dialogueId: string, mode: DialoguePracticeMode) => void;
  completeDialogue: (dialogueId: string) => void;
  recordIntermediateReadingRead: (lessonId: string) => void;
  recordIntermediateListeningPractice: (lessonId: string, shadowing?: boolean) => void;
  completeIntermediateReading: (lessonId: string, quizCorrect?: boolean) => void;
  recordAdvancedArticleRead: (articleId: string) => void;
  recordAdvancedListeningPractice: (articleId: string, shadowing?: boolean) => void;
  saveAdvancedDebateNote: (articleId: string, debate: { debateStance?: "A" | "B" | "balanced"; debateNote?: string }) => void;
  saveAdvancedArticleDraft: (articleId: string, draft: { summaryDraft?: string; opinionDraft?: string }) => void;
  saveAdvancedWritingFeedback: (articleId: string, feedback: Omit<AdvancedWritingFeedback, "id" | "createdAt">) => void;
  recordAdvancedSpeakingPractice: (articleId: string, attempt?: Omit<AdvancedSpeakingAttempt, "id" | "createdAt">) => void;
  completeAdvancedArticle: (articleId: string) => void;
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
    writingMistake?: UserState["writingMistakes"][number],
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

      setTargetLanguage: (languageId) => set({ targetLanguageId: languageId }),

      setCurrentCourseLevel: (levelId) => set({ currentCourseLevel: levelId }),

      addGeneratedAdvancedArticle: (article) => set(s => ({
        generatedAdvancedArticles: [
          article,
          ...(s.generatedAdvancedArticles ?? []).filter(existing => existing.id !== article.id),
        ].slice(0, 20),
      })),

      recordPromotionExamAttempt: (attempt) => set(s => ({
        promotionExamAttempts: [...(s.promotionExamAttempts ?? []), attempt].slice(-30),
        learningSignals: [
          ...(s.learningSignals ?? []).slice(-499),
          createSignal({
            type: "promotion_exam_complete",
            result: attempt.passed ? "success" : "skip",
            metadata: {
              promotionExamId: attempt.examId,
              score: attempt.totalScore,
              maxScore: attempt.maxScore,
              passed: attempt.passed,
              recommendedLevel: attempt.recommendedLevel,
            },
          }),
        ],
      })),

      recordDialoguePractice: (dialogueId, mode) => set(s => {
        const prev = s.dialogueProgress?.[dialogueId] ?? {
          completed: false,
          practiceCount: 0,
          modeCounts: {},
        };
        return {
          dialogueProgress: {
            ...(s.dialogueProgress ?? {}),
            [dialogueId]: {
              ...prev,
              practiceCount: prev.practiceCount + 1,
              lastMode: mode,
              modeCounts: {
                ...prev.modeCounts,
                [mode]: (prev.modeCounts[mode] ?? 0) + 1,
              },
              lastPracticedAt: new Date().toISOString(),
            },
          },
        };
      }),

      completeDialogue: (dialogueId) => set(s => {
        const prev = s.dialogueProgress?.[dialogueId] ?? {
          completed: false,
          practiceCount: 0,
          modeCounts: {},
        };
        return {
          dialogueProgress: {
            ...(s.dialogueProgress ?? {}),
            [dialogueId]: {
              ...prev,
              completed: true,
              completedAt: new Date().toISOString(),
            },
          },
        };
      }),

      recordIntermediateReadingRead: (lessonId) => set(s => {
        const prev = s.intermediateReadingProgress?.[lessonId] ?? emptyIntermediateReadingProgress();
        if (prev.read) return {};
        return {
          intermediateReadingProgress: {
            ...(s.intermediateReadingProgress ?? {}),
            [lessonId]: {
              ...prev,
              read: true,
              readAt: new Date().toISOString(),
              lastPracticedAt: new Date().toISOString(),
            },
          },
          learningSignals: [
            ...(s.learningSignals ?? []).slice(-499),
            createSignal({
              type: "intermediate_reading_read",
              result: "success",
              metadata: { lessonId },
            }),
          ],
        };
      }),

      recordIntermediateListeningPractice: (lessonId, shadowing = false) => set(s => {
        const prev = s.intermediateReadingProgress?.[lessonId] ?? emptyIntermediateReadingProgress();
        return {
          intermediateReadingProgress: {
            ...(s.intermediateReadingProgress ?? {}),
            [lessonId]: {
              ...prev,
              listenCount: prev.listenCount + 1,
              shadowingCount: prev.shadowingCount + (shadowing ? 1 : 0),
              lastPracticedAt: new Date().toISOString(),
            },
          },
          learningSignals: [
            ...(s.learningSignals ?? []).slice(-499),
            createSignal({
              type: "intermediate_listening_practice",
              result: "success",
              metadata: { lessonId, shadowing },
            }),
          ],
        };
      }),

      completeIntermediateReading: (lessonId, quizCorrect) => set(s => {
        const prev = s.intermediateReadingProgress?.[lessonId] ?? emptyIntermediateReadingProgress();
        return {
          intermediateReadingProgress: {
            ...(s.intermediateReadingProgress ?? {}),
            [lessonId]: {
              ...prev,
              read: true,
              readAt: prev.readAt ?? new Date().toISOString(),
              completed: true,
              completedAt: new Date().toISOString(),
              quizCorrect,
              lastPracticedAt: new Date().toISOString(),
            },
          },
          learningSignals: [
            ...(s.learningSignals ?? []).slice(-499),
            createSignal({
              type: "intermediate_reading_complete",
              result: quizCorrect === false ? "skip" : "success",
              metadata: { lessonId, quizCorrect: quizCorrect ?? false },
            }),
          ],
        };
      }),

      recordAdvancedArticleRead: (articleId) => set(s => {
        const prev = s.advancedArticleProgress?.[articleId] ?? emptyAdvancedArticleProgress();
        return {
          advancedArticleProgress: {
            ...(s.advancedArticleProgress ?? {}),
            [articleId]: {
              ...prev,
              read: true,
              readAt: prev.readAt ?? new Date().toISOString(),
            },
          },
          learningSignals: [
            ...(s.learningSignals ?? []).slice(-499),
            createSignal({
              type: "advanced_article_read",
              result: "success",
              metadata: { articleId },
            }),
          ],
        };
      }),

      recordAdvancedListeningPractice: (articleId, shadowing = false) => set(s => {
        const prev = s.advancedArticleProgress?.[articleId] ?? emptyAdvancedArticleProgress();
        return {
          advancedArticleProgress: {
            ...(s.advancedArticleProgress ?? {}),
            [articleId]: {
              ...prev,
              listenCount: (prev.listenCount ?? 0) + 1,
              shadowingCount: (prev.shadowingCount ?? 0) + (shadowing ? 1 : 0),
              lastPracticedAt: new Date().toISOString(),
            },
          },
          learningSignals: [
            ...(s.learningSignals ?? []).slice(-499),
            createSignal({
              type: "advanced_listening_practice",
              result: "success",
              metadata: { articleId, shadowing },
            }),
          ],
        };
      }),

      saveAdvancedArticleDraft: (articleId, draft) => set(s => {
        const prev = s.advancedArticleProgress?.[articleId] ?? emptyAdvancedArticleProgress();
        return {
          advancedArticleProgress: {
            ...(s.advancedArticleProgress ?? {}),
            [articleId]: {
              ...prev,
              ...draft,
            },
          },
        };
      }),

      saveAdvancedDebateNote: (articleId, debate) => set(s => {
        const prev = s.advancedArticleProgress?.[articleId] ?? emptyAdvancedArticleProgress();
        return {
          advancedArticleProgress: {
            ...(s.advancedArticleProgress ?? {}),
            [articleId]: {
              ...prev,
              ...debate,
            },
          },
        };
      }),

      saveAdvancedWritingFeedback: (articleId, feedback) => set(s => {
        const prev = s.advancedArticleProgress?.[articleId] ?? emptyAdvancedArticleProgress();
        const nextFeedback: AdvancedWritingFeedback = {
          ...feedback,
          id: `awf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          createdAt: new Date().toISOString(),
        };
        return {
          advancedArticleProgress: {
            ...(s.advancedArticleProgress ?? {}),
            [articleId]: {
              ...prev,
              writingFeedbackHistory: [nextFeedback, ...(prev.writingFeedbackHistory ?? [])].slice(0, 10),
            },
          },
          learningSignals: [
            ...(s.learningSignals ?? []).slice(-499),
            createSignal({
              type: "advanced_writing_feedback",
              result: "success",
              metadata: {
                articleId,
                source: nextFeedback.source,
                score: nextFeedback.score ?? -1,
                wordCount: nextFeedback.wordCount,
              },
            }),
          ],
        };
      }),

      recordAdvancedSpeakingPractice: (articleId, attempt) => set(s => {
        const prev = s.advancedArticleProgress?.[articleId] ?? emptyAdvancedArticleProgress();
        const nextAttempt = attempt ? {
          ...attempt,
          id: `asa-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          createdAt: new Date().toISOString(),
        } satisfies AdvancedSpeakingAttempt : undefined;
        return {
          advancedArticleProgress: {
            ...(s.advancedArticleProgress ?? {}),
            [articleId]: {
              ...prev,
              speakingPracticeCount: (prev.speakingPracticeCount ?? 0) + 1,
              speakingAttempts: nextAttempt
                ? [nextAttempt, ...(prev.speakingAttempts ?? [])].slice(0, 10)
                : (prev.speakingAttempts ?? []),
              lastPracticedAt: new Date().toISOString(),
            },
          },
          learningSignals: [
            ...(s.learningSignals ?? []).slice(-499),
            createSignal({
              type: "advanced_speaking_practice",
              result: "success",
              metadata: { articleId },
            }),
          ],
        };
      }),

      completeAdvancedArticle: (articleId) => set(s => {
        const prev = s.advancedArticleProgress?.[articleId] ?? emptyAdvancedArticleProgress();
        return {
          advancedArticleProgress: {
            ...(s.advancedArticleProgress ?? {}),
            [articleId]: {
              ...prev,
              read: true,
              completed: true,
              completedAt: new Date().toISOString(),
            },
          },
          learningSignals: [
            ...(s.learningSignals ?? []).slice(-499),
            createSignal({
              type: "advanced_article_complete",
              result: "success",
              metadata: { articleId },
            }),
          ],
        };
      }),

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
        const writingMistake = (s.writingMistakes ?? []).find(m => m.quizId === quizId);
        const next = updateAttempt(s.quizAttempts[quizId], quizId, lessonId, correct);
        const srsNext = updateSRS(s.srs[quizId], correct);
        const completedMistake = !!writingMistake && correct;
        const finalAttempt = completedMistake
          ? { ...next, consecutiveCorrect: Math.max(next.consecutiveCorrect, 5), nextReviewAt: farFutureDate() }
          : next;
        const finalSrs = completedMistake
          ? { ...srsNext, consecutiveCorrect: Math.max(srsNext.consecutiveCorrect, 5), nextReviewAt: farFutureDate(), lastResult: "correct" as const }
          : srsNext;
        const recall = recallMs ? { ...s.recallSpeedMs, [quizId]: [...(s.recallSpeedMs[quizId] ?? []).slice(-9), recallMs] } : s.recallSpeedMs;
        return {
          quizAttempts: { ...s.quizAttempts, [quizId]: finalAttempt },
          srs:          { ...s.srs, [quizId]: finalSrs },
          recallSpeedMs: recall,
          writingMistakes: (s.writingMistakes ?? []).map(m =>
            completedMistake && m.quizId === quizId
              ? { ...m, status: "completed" as const, completedAt: new Date().toISOString() }
              : m,
          ),
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

      addJournal: (day, text, derivedQuizIds, derivedQuizzes, writingMistake) => set(s => {
        const now = new Date().toISOString();
        const journalId = `j-${Date.now()}`;
        const mistake = writingMistake ? { ...writingMistake, sourceJournalId: journalId } : undefined;
        const seededAttempt = mistake ? {
          quizId: mistake.quizId,
          lessonId: "writing-mistake",
          consecutiveCorrect: 0,
          nextReviewAt: now,
          totalCorrect: 0,
          totalWrong: 1,
          lastAttemptAt: now,
        } : undefined;
        const seededSrs = mistake ? {
          consecutiveCorrect: 0,
          nextReviewAt: now,
          lapses: 1,
          lastResult: "wrong" as const,
        } : undefined;
        return {
          journal: [...s.journal, {
            id: journalId,
            day,
            date: now,
            text,
            derivedQuizIds,
            derivedQuizzes,
            writingMistakeId: mistake?.id,
            correction: mistake ? {
              original: mistake.original,
              corrected: mistake.corrected,
              why: mistake.explanation,
              score: mistake.score,
            } : undefined,
          }],
          writingMistakes: mistake ? [...(s.writingMistakes ?? []), mistake] : (s.writingMistakes ?? []),
          quizAttempts: seededAttempt ? { ...s.quizAttempts, [seededAttempt.quizId]: seededAttempt } : s.quizAttempts,
          srs: seededSrs ? { ...s.srs, [mistake!.quizId]: seededSrs } : s.srs,
          learningSignals: [
            ...(s.learningSignals ?? []).slice(-499),
            createSignal({
              type: "journal_add",
              result: "success",
              metadata: { day, derivedQuizCount: derivedQuizIds?.length ?? 0, writingMistake: !!mistake },
            }),
          ],
          stats: { ...s.stats, journalEntries: s.stats.journalEntries + 1 },
        };
      }),

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

function emptyIntermediateReadingProgress(): UserState["intermediateReadingProgress"][string] {
  return {
    read: false,
    completed: false,
    listenCount: 0,
    shadowingCount: 0,
  };
}

function emptyAdvancedArticleProgress(): UserState["advancedArticleProgress"][string] {
  return {
    read: false,
    completed: false,
    writingFeedbackHistory: [],
    listenCount: 0,
    shadowingCount: 0,
    speakingPracticeCount: 0,
    speakingAttempts: [],
  };
}

function normalizeEn(en: string): string {
  return en.toLowerCase().replace(/[^\w\s']/g, "").replace(/\s+/g, " ").trim();
}

function farFutureDate(): string {
  return "2099-12-31T00:00:00.000Z";
}
