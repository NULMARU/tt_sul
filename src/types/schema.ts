// ============================================================
// Sulsul + Tt — Unified Data Model
// "회로(Circuit) 학습 모델" 기반의 5축 좌표 표현 카드
// ============================================================

// ─── 5축 좌표 태그 ──────────────────────────────────────────
export type StageId = "stage-1" | "stage-2" | "stage-3" | "stage-4" | "stage-5";

export type PlaceTag =
  | "bedroom" | "bathroom" | "kitchen" | "livingroom" | "entrance" | "balcony"
  | "street" | "bus_stop" | "subway" | "taxi" | "cafe" | "office"
  | "store" | "restaurant" | "park" | "gym" | "elevator";

export type SituationTag =
  | "alarm_off" | "morning_routine" | "skincare" | "get_dressed"
  | "breakfast" | "commute_bus" | "commute_subway" | "arrive_office"
  | "work_start" | "meeting" | "email" | "phone_call" | "lunch"
  | "coffee_order" | "small_talk" | "apology" | "thanks"
  | "afternoon_break" | "leave_work" | "grocery" | "shopping"
  | "evening_chores" | "dinner" | "hobby" | "winding_down" | "bedtime";

export type TimeBand = "dawn" | "morning" | "midday" | "afternoon" | "evening" | "night";

export interface Coords {
  days?: number[];          // 1..30 (tt 호환)
  stages?: StageId[];
  places?: PlaceTag[];
  situations?: SituationTag[];
  times?: TimeBand[];
}

// ─── Phrase: 모든 학습의 최소 단위 ──────────────────────────
export interface Phrase {
  id: string;               // "wake_up"
  ko: string;               // 한국어
  en: string;               // 영어
  past?: string;            // 과거형
  ipa?: string;             // 발음 기호 (선택)
  coords: Coords;
  examples?: Example[];
  tags?: string[];          // 자유 태그 (감정, 문법 패턴 등)
}

export interface Example {
  en: string;
  ko: string;
  ttsRate?: number;
  emoji?: string;
}

// ─── Card: 카드 유형 (sulsul 유지) ──────────────────────────
export type CardType = "hook" | "narration" | "analogy" | "example" | "highlight";

export interface Card {
  id: string;
  type: CardType;
  text: string;
  emoji?: string;
  highlight?: string;       // 강조 키워드
  tip?: string;
  examples?: Example[];
  phraseId?: string;        // 어떤 표현을 가르치는 카드인지
  afterCardQuizId?: string; // 카드 뒤에 끼어드는 미니 퀴즈
}

// ─── Scenario: tt의 3단계 누적 작문 ──────────────────────────
export interface ScenarioStep {
  label: string;            // "1단계 - 동작"
  instruction: string;
  answer: string;
  answerKo: string;
}

export interface Scenario {
  id: string;
  emoji: string;
  situation: SituationTag;
  prompt: string;
  steps: ScenarioStep[];    // 3개
}

// ─── Quiz: sulsul 6종 ──────────────────────────
export type QuizType =
  | "multiple_choice" | "ox" | "fill_blank"
  | "word_arrange" | "situation_match" | "translation";

export interface QuizBase {
  id: string;
  type: QuizType;
  lessonId?: string;
  reference?: { lessonId?: string; cardId?: string; phraseId?: string };
  tags?: string[];
  explanation?: string;
}

export interface QuizMC extends QuizBase {
  type: "multiple_choice";
  prompt: string;
  promptKo?: string;
  choices: { id: string; text: string }[];
  answer: string;           // choice id
}

export interface QuizOX extends QuizBase {
  type: "ox";
  prompt: string;
  answer: boolean;
}

export interface QuizFill extends QuizBase {
  type: "fill_blank";
  prompt: string;           // 'I ___ at 7' 또는 '{blank}'
  promptKo?: string;
  inputMode: "choices" | "keyboard";
  choices?: string[];
  answer: string[];         // 1개 이상 정답
}

export interface QuizArrange extends QuizBase {
  type: "word_arrange";
  promptKo: string;
  tokens: { id: string; text: string }[];
  answer: string[];         // token id 순서
  acceptableAnswers?: string[][];
}

export interface QuizMatch extends QuizBase {
  type: "situation_match";
  scenario: string;
  scenarioEmoji?: string;
  prompt: string;
  choices: { id: string; en: string; ko?: string }[];
  answer: string;           // choice id
}

export interface QuizTranslate extends QuizBase {
  type: "translation";
  promptKo: string;
  tokens: { id: string; text: string }[];
  answer: string[];
  acceptableAnswers?: string[][];
}

export type Quiz = QuizMC | QuizOX | QuizFill | QuizArrange | QuizMatch | QuizTranslate;

// ─── Lesson ──────────────────────────────────────────────
export interface Lesson {
  id: string;               // "lesson-1"
  stageId: StageId;
  day?: number;             // 1..30 (tt와 매핑)
  title: string;
  subtitle: string;
  emoji?: string;
  cards: Card[];
  scenarioIds: string[];    // tt의 시나리오 (3단계 작문)
  finalQuizIds: string[];
  storyId?: string;         // 이 강과 연결된 Daily Story
  coords: Coords;
}

// ─── Stage ──────────────────────────────────────────────
export interface Stage {
  id: StageId;
  title: string;
  description: string;
  lessonIds: string[];
  bossQuizId?: string;
  unlockThreshold: number;  // 0..1, 직전 단계 진척률
}

// ─── Daily Story (장문 독해) ──────────────────────────────
export type StoryGenre = "diary" | "dialogue" | "column";
export type StoryDifficulty = "easy" | "natural" | "challenge";

export interface StoryComprehension {
  summary: { question: string; answer: string };
  fill: { sentence: string; answer: string };
  inference: { question: string; choices: string[]; answer: number };
}

export interface Story {
  id: string;               // "story-day-1"
  day: number;              // 1..30
  title: string;
  genre: StoryGenre;
  place: PlaceTag;
  time: TimeBand;
  situations: SituationTag[];
  phraseIds: string[];      // 등장하는 학습 표현
  body: Partial<Record<StoryDifficulty, string>>; // 3난이도 본문 (challenge는 LLM 생성 가능)
  comprehension?: StoryComprehension;
}

// ─── User State (영구 저장) ──────────────────────────────
export interface SRSState {
  consecutiveCorrect: number;
  nextReviewAt: string;     // ISO
  lapses: number;
  lastResult?: "correct" | "wrong";
}

export interface QuizAttempt {
  quizId: string;
  lessonId?: string;
  consecutiveCorrect: number;
  nextReviewAt: string;
  totalCorrect: number;
  totalWrong: number;
  lastAttemptAt: string;
}

export interface JournalEntry {
  id: string;
  day: number;
  date: string;             // ISO date
  text: string;             // 사용자가 쓴 영어 한 문장
  phraseIds?: string[];     // 사용한 학습 표현
  derivedQuizIds?: string[]; // LLM이 만든 빈칸 퀴즈 id
  derivedQuizzes?: {
    id: string;
    sentence: string;
    answer: string;
    accept?: string[];
  }[];
  llmFeedback?: string;     // 채점 결과
}

export interface MyPhrase {
  id: string;
  phraseId: string;         // 원본
  userEn: string;           // 본인 변형
  note?: string;
  createdAt: string;
}

export type LearningStep = "understand" | "absorb" | "read" | "produce" | "imprint";

export type LearningSignalType =
  | "lesson_start"
  | "lesson_complete"
  | "step_enter"
  | "step_exit"
  | "quiz_answer"
  | "tts_play"
  | "story_read"
  | "journal_add"
  | "recommendation_shown"
  | "recommendation_clicked"
  | "recommendation_dismissed"
  | "adaptive_ui_applied"
  | "adaptive_ui_reverted";

export interface LearningSignal {
  id: string;
  type: LearningSignalType;
  at: string;
  timeBand: TimeBand;
  lessonId?: string;
  phraseId?: string;
  quizId?: string;
  step?: LearningStep;
  result?: "success" | "skip" | "wrong" | "correct" | "abandon";
  durationMs?: number;
  metadata?: Record<string, string | number | boolean>;
}

export interface LearnerProfile {
  updatedAt: string;
  preferredTimeBands: TimeBand[];
  weakPhraseIds: string[];
  weakTags: string[];
  strongTags: string[];
  bestModes: LearningStep[];
  fragileModes: LearningStep[];
  averageSessionSecondsByBand: Partial<Record<TimeBand, number>>;
  recommendationAffinity: Partial<Record<TimeBand, "quick" | "full" | "audio-only">>;
}

export interface RecommendationFeedback {
  suggestionId: string;
  shown: number;
  clicked: number;
  dismissed: number;
  lastActionAt?: string;
}

export type AdaptiveUiLevel = "off" | "safe" | "suggested" | "experimental";

export interface AdaptiveUiPatch {
  id: string;
  createdAt: string;
  source: "local" | "llm";
  status: "candidate" | "active" | "rejected" | "expired";
  surface: "home" | "lesson" | "review" | "story" | "memory-map" | "toolbelt";
  changeType:
    | "reorder_sections"
    | "change_default_mode"
    | "adjust_density"
    | "show_hint"
    | "hide_optional_section"
    | "change_cta_priority"
    | "change_default_filter";
  reason: string;
  evidence: {
    signals: number;
    windowDays: number;
    metric: string;
    before?: number;
    afterTarget?: number;
  };
  payload: Record<string, string | number | boolean | string[]>;
  expiresAt?: string;
}

export interface UserState {
  srs: Record<string, SRSState>;            // by phraseId or quizId
  quizAttempts: Record<string, QuizAttempt>;
  recallSpeedMs: Record<string, number[]>;  // 인출 속도 샘플
  lessonProgress: Record<string, {
    completed: boolean;
    lastViewedCardOrder: number;
    completedAt?: string;
  }>;
  storyProgress: Record<string, {
    read: boolean;
    difficulty: StoryDifficulty;
    quizScore?: number;
    readAt?: string;
  }>;
  myPhrases: MyPhrase[];
  journal: JournalEntry[];
  bookmarks: string[];      // phraseId 또는 cardId
  notes: Record<string, string>;
  learningSignals: LearningSignal[];
  learnerProfile: LearnerProfile | null;
  recommendationFeedback: Record<string, RecommendationFeedback>;
  adaptiveUiPatches: AdaptiveUiPatch[];
  unlockedStages: StageId[];
  stats: {
    streak: number;
    lastStudyDate?: string;
    totalStudySeconds: number;
    totalCardsViewed: number;
    totalQuizzesAttempted: number;
    ttsPlays: number;
    recordingsMade: number;
    storiesRead: number;
    journalEntries: number;
  };
  prefs: {
    dailyMinutesGoal: 3 | 5 | 10 | 20;
    narrationLevel: "off" | "examples" | "cards" | "all";
    ttsRate: number;
    ttsPitch: number;
    ttsVoiceURI?: string | null;
    ttsKoreanVoiceURI?: string | null;
    timeColorAuto: boolean;
    notificationEnabled: boolean;
    notificationTime?: string; // "07:20"
    darkMode: "system" | "light" | "dark";
    fontSize: "sm" | "md" | "lg";
    unlockAllStages: boolean;
    adaptiveUiLevel: AdaptiveUiLevel;
  };
}

// ─── Pocket Session 추천 ──────────────────────────────────
export interface PocketSession {
  id: string;
  label: string;            // "이동 중", "샤워 후"
  emoji: string;
  durationMinSec: number;
  durationMaxSec: number;
  modes: ("understand" | "absorb" | "produce" | "imprint" | "read")[];
  inferredFrom: {
    time?: TimeBand;
    places?: PlaceTag[];
    situations?: SituationTag[];
  };
}
