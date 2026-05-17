import type { IntermediateReadingLesson, Quiz, QuizFill, QuizMC } from "../types/schema";
import { INTERMEDIATE_READING_LESSONS } from "./intermediate-readings.seed";

export function buildIntermediateReadingQuizzes(lesson: IntermediateReadingLesson): Quiz[] {
  return [
    makeGistQuiz(lesson),
    makeVocabularyQuiz(lesson),
  ];
}

let intermediateReadingQuizBankCache: Quiz[] | null = null;

export function getIntermediateReadingQuizBank(): Quiz[] {
  if (!intermediateReadingQuizBankCache) {
    intermediateReadingQuizBankCache = INTERMEDIATE_READING_LESSONS.flatMap(buildIntermediateReadingQuizzes);
  }
  return intermediateReadingQuizBankCache;
}

export function intermediateReadingQuizIds(lessonId: string): string[] {
  return [
    `q-int-read-${lessonId}-gist`,
    `q-int-read-${lessonId}-vocab`,
  ];
}

function makeGistQuiz(lesson: IntermediateReadingLesson): QuizMC {
  const question = lesson.comprehension;
  return {
    id: `q-int-read-${lesson.id}-gist`,
    type: "multiple_choice",
    lessonId: lesson.id,
    prompt: question.question,
    promptKo: lesson.gistQuestion,
    choices: question.choices.map((choice, index) => ({ id: `c${index}`, text: choice })),
    answer: `c${question.answerIndex}`,
    explanation: question.explanationKo,
    tags: ["stage-2", "intermediate-reading", "gist"].concat(lesson.topicTags),
  };
}

function makeVocabularyQuiz(lesson: IntermediateReadingLesson): QuizFill {
  const vocab = lesson.keyVocabulary[0];
  const sentence = vocab.example.replace(vocab.term, "___");
  return {
    id: `q-int-read-${lesson.id}-vocab`,
    type: "fill_blank",
    lessonId: lesson.id,
    prompt: sentence.includes("___") ? sentence : `${vocab.example} (${vocab.ko}: ___)`,
    promptKo: `중급 리딩 어휘: ${vocab.ko}`,
    inputMode: "keyboard",
    answer: [vocab.term.toLowerCase()],
    explanation: `${vocab.term}: ${vocab.ko}`,
    tags: ["stage-2", "intermediate-reading", "vocabulary"].concat(lesson.topicTags),
  };
}
