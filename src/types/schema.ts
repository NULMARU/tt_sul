// ============================================================
// Sulsul + Tt — Unified Data Model
// "회로(Circuit) 학습 모델" 기반의 5축 좌표 표현 카드
// ============================================================

// ─── 5축 좌표 태그 ──────────────────────────────────────────
export type LanguageId = "en" | "vi" | "ja";

export interface LanguageConfig {
  id: LanguageId;
  nameKo: string;
  nameNative: string;
  targetLocale: string;
  nativeLocale: "ko-KR";
  script: "latin" | "vietnamese" | "japanese";
  developmentOrder: number;
  status: "active" | "planned";
  defaultCourseLevel: CourseLevelId;
  supportsWordArrange: boolean;
  supportsDictation: boolean;
  supportsRomanization: boolean;
  notes: string[];
}

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
  languageId?: LanguageId;  // 미지정 시 현재 영어 콘텐츠(en)로 간주
  ko: string;               // 한국어
  en: string;               // 영어
  romanization?: string;    // 베트남어/일본어 확장용
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

// ─── Course Level: 초급/중급/상급 상위 과정 ───────────────
export type CourseLevelId = "beginner" | "intermediate" | "advanced";

export interface CourseLevel {
  id: CourseLevelId;
  title: string;
  shortTitle: string;
  description: string;
  learnerGoal: string;
  primaryLoop: "phrase-circuit" | "dialogue-recitation" | "article-debate";
  recommendedFor: string[];
  entryRoute?: string;
}

export type PromotionExamKind = "placement" | "promotion";

export type PromotionExamSectionType =
  | "phrase-recall"
  | "story-comprehension"
  | "dialogue-response"
  | "writing"
  | "opinion";

export interface PromotionExamSectionBlueprint {
  id: string;
  type: PromotionExamSectionType;
  title: string;
  instruction: string;
  points: number;
}

export interface PromotionExamBlueprint {
  id: string;
  kind: PromotionExamKind;
  levelId: CourseLevelId;
  targetLevelId?: CourseLevelId;
  title: string;
  description: string;
  gameTheme: string;
  passingScore: number;
  sections: PromotionExamSectionBlueprint[];
}

export interface PromotionExamAttempt {
  id: string;
  examId: string;
  kind: PromotionExamKind;
  levelId: CourseLevelId;
  targetLevelId?: CourseLevelId;
  startedAt: string;
  completedAt: string;
  seed: number;
  totalScore: number;
  maxScore: number;
  passed: boolean;
  recommendedLevel: CourseLevelId;
  sectionResults: {
    sectionId: string;
    type: PromotionExamSectionType;
    score: number;
    maxScore: number;
    feedback: string;
  }[];
  feedback: string[];
}

// ─── Dialogue Lesson: 중급 암송 과정 ────────────────────────
export type DialoguePracticeMode = "realtime" | "pause-repeat" | "role-a" | "role-b" | "korean-hint";

export interface DialogueTurn {
  id: string;
  speaker: "A" | "B";
  en: string;
  ko: string;
  hintKo?: string;
  phraseIds?: string[];
  functionTags?: string[];
}

export interface DialogueLesson {
  id: string;
  languageId: LanguageId;
  levelId: CourseLevelId;
  unitId: string;
  title: string;
  subtitle: string;
  situation: string;
  emoji?: string;
  targetFunctions: string[];
  recitationModes: DialoguePracticeMode[];
  turns: DialogueTurn[];
}

// ─── Intermediate Reading: 중급 뉴스·문화 리딩/리스닝 ────────
export type IntermediateSourceCategory =
  | "global-learning"
  | "asia-news"
  | "culture-society"
  | "community-explainer";

export interface IntermediateSourceProfile {
  id: string;
  label: string;
  url: string;
  category: IntermediateSourceCategory;
  suitabilityKo: string;
  usePolicyKo: string;
}

export interface IntermediateVocabularyItem {
  term: string;
  ko: string;
  example: string;
}

export interface IntermediateComprehensionQuestion {
  question: string;
  choices: string[];
  answerIndex: number;
  explanationKo: string;
}

export interface IntermediateReadingLesson {
  id: string;
  languageId: LanguageId;
  levelId: "intermediate";
  unitId: string;
  sourceProfileId: string;
  title: string;
  subtitle: string;
  emoji?: string;
  difficulty: "B1" | "B1-B2" | "B2";
  estimatedMinutes: number;
  topicTags: string[];
  skillFocus: ("gist" | "vocabulary" | "listening" | "summary" | "speaking")[];
  sourceUseNoteKo: string;
  body: string;
  keyVocabulary: IntermediateVocabularyItem[];
  gistQuestion: string;
  comprehension: IntermediateComprehensionQuestion;
  shadowingSentences: string[];
  writingPrompt: string;
  speakingPrompt: string;
}

// ─── Advanced Article: 상급 읽기·토론·발화 평가 ─────────────
export type AdvancedArticleCategory = "work" | "news" | "society";

export interface AdvancedExpression {
  en: string;
  ko: string;
  usage: string;
}

export interface DebatePrompt {
  question: string;
  stanceA: string;
  stanceB: string;
  usefulFrames: string[];
}

export interface SpeakingRubricItem {
  criterion: "clarity" | "structure" | "evidence" | "delivery";
  label: string;
  description: string;
}

export interface AdvancedArticle {
  id: string;
  languageId: LanguageId;
  levelId: "advanced";
  category: AdvancedArticleCategory;
  generatedAt?: string;
  isGenerated?: boolean;
  interestTags?: string[];
  trendLabelKo?: string;
  sourceNoteKo?: string;
  sourceItems?: AdvancedSourceItem[];
  title: string;
  subtitle: string;
  summaryKo: string;
  estimatedMinutes: number;
  body: string;
  keyExpressions: AdvancedExpression[];
  debate: DebatePrompt;
  writingPrompt: string;
  speakingPrompt: string;
  sampleAnswer: string;
  rubric: SpeakingRubricItem[];
}

export interface AdvancedSourceItem {
  source: string;
  title: string;
  url: string;
  publishedAt?: string;
}

export interface AdvancedWritingFeedback {
  id: string;
  createdAt: string;
  source: "local" | "llm";
  prompt: string;
  score?: number;
  feedback: string;
  corrected?: string;
  wordCount: number;
}

export interface AdvancedSpeakingAttempt {
  id: string;
  createdAt: string;
  prompt: string;
  rubricScores: Partial<Record<SpeakingRubricItem["criterion"], number>>;
  note?: string;
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
  writingMistakeId?: string; // 저장 중 발견된 작문 오답노트
  correction?: {
    original: string;
    corrected: string;
    why?: string;
    score?: number;
  };
}

export interface WritingMistakeNote {
  id: string;
  createdAt: string;
  sourceJournalId?: string;
  original: string;
  corrected: string;
  explanation?: string;
  score?: number;
  quizId: string;
  quizSentence: string;
  quizAnswer: string;
  quizAccept?: string[];
  status: "learning" | "completed";
  completedAt?: string;
}

export interface MyPhrase {
  id: string;
  phraseId: string;         // 원본
  userEn: string;           // 본인 변형
  note?: string;
  createdAt: string;
}

export interface ContentSuggestionPhrase extends Phrase {
  reason: string;
}

export interface ContentSuggestionStory {
  title: string;
  body: string;
  phraseEns: string[];
}

export interface ContentSuggestion {
  id: string;
  createdAt: string;
  source: "local" | "llm";
  status: "candidate" | "accepted" | "rejected";
  title: string;
  rationale: string;
  retirePhraseIds: string[];
  reinforcePhraseIds: string[];
  phrases: ContentSuggestionPhrase[];
  story?: ContentSuggestionStory;
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
  | "promotion_exam_complete"
  | "intermediate_reading_read"
  | "intermediate_listening_practice"
  | "intermediate_reading_complete"
  | "advanced_article_read"
  | "advanced_writing_feedback"
  | "advanced_speaking_practice"
  | "advanced_article_complete"
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
  journalInsight?: JournalInsight;
}

export interface JournalInsight {
  updatedAt: string;
  entryCount: number;
  averageWordsPerEntry: number;
  correctionRate: number;
  connectorUse: number;
  preferredTopics: string[];
  dailyPatternTags: string[];
  suggestedLevel: CourseLevelId;
  notes: string[];
}

export interface RecommendationFeedback {
  suggestionId: string;
  shown: number;
  clicked: number;
  dismissed: number;
  lastActionAt?: string;
}

export type AdaptiveUiLevel = "off" | "safe" | "suggested" | "experimental";
export type TtsProvider = "system" | "supertonic";

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
  targetLanguageId: LanguageId;
  currentCourseLevel: CourseLevelId;
  promotionExamAttempts: PromotionExamAttempt[];
  dialogueProgress: Record<string, {
    completed: boolean;
    completedAt?: string;
    practiceCount: number;
    lastMode?: DialoguePracticeMode;
    modeCounts: Partial<Record<DialoguePracticeMode, number>>;
    lastPracticedAt?: string;
  }>;
  intermediateReadingProgress: Record<string, {
    read: boolean;
    readAt?: string;
    completed: boolean;
    completedAt?: string;
    listenCount: number;
    shadowingCount: number;
    quizCorrect?: boolean;
    lastPracticedAt?: string;
  }>;
  advancedArticleProgress: Record<string, {
    read: boolean;
    readAt?: string;
    completed: boolean;
    completedAt?: string;
    summaryDraft?: string;
    opinionDraft?: string;
    debateStance?: "A" | "B" | "balanced";
    debateNote?: string;
    writingFeedbackHistory?: AdvancedWritingFeedback[];
    speakingPracticeCount: number;
    speakingAttempts?: AdvancedSpeakingAttempt[];
    lastPracticedAt?: string;
  }>;
  generatedAdvancedArticles: AdvancedArticle[];
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
  writingMistakes: WritingMistakeNote[];
  bookmarks: string[];      // phraseId 또는 cardId
  notes: Record<string, string>;
  learningSignals: LearningSignal[];
  learnerProfile: LearnerProfile | null;
  recommendationFeedback: Record<string, RecommendationFeedback>;
  adaptiveUiPatches: AdaptiveUiPatch[];
  contentSuggestions: ContentSuggestion[];
  customContentPhrases: ContentSuggestionPhrase[];
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
    ttsProvider: TtsProvider;
    supertonicTtsAcceptedAt?: string;
    supertonicTtsConsentVersion?: string;
    supertonicTtsAssetsCachedAt?: string;
    supertonicTtsLastError?: string;
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
