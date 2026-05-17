import type { DialogueLesson, DialogueTurn, Quiz, QuizFill, QuizMC, QuizMatch } from "../types/schema";
import { DIALOGUE_LESSONS } from "./dialogues.seed";

export function buildDialogueQuizzes(dialogue: DialogueLesson): Quiz[] {
  const firstTurn = dialogue.turns[0];
  const replyPair = pickReplyPair(dialogue.turns);
  const focusTurn = pickFocusTurn(dialogue.turns);
  const rolePromptTurn = pickRolePromptTurn(dialogue.turns);
  const quizSeed = hash(dialogue.id);

  return [
    makeOpeningQuiz(dialogue, firstTurn, quizSeed),
    makeReplyQuiz(dialogue, replyPair.prompt, replyPair.answer, quizSeed + 1),
    makeBlankQuiz(dialogue, focusTurn),
    makeRoleResponseQuiz(dialogue, rolePromptTurn.prompt, rolePromptTurn.answer, quizSeed + 2),
  ];
}

let dialogueQuizBankCache: Quiz[] | null = null;

export function getDialogueQuizBank(): Quiz[] {
  if (!dialogueQuizBankCache) dialogueQuizBankCache = buildAllDialogueQuizzes();
  return dialogueQuizBankCache;
}

export function dialogueQuizIds(dialogueId: string): string[] {
  return [
    `q-dlg-${dialogueId}-opening`,
    `q-dlg-${dialogueId}-reply-t1`,
    `q-dlg-${dialogueId}-blank-t2`,
    `q-dlg-${dialogueId}-role-t3`,
  ];
}

function buildAllDialogueQuizzes(): Quiz[] {
  const quizzes: Quiz[] = [];
  DIALOGUE_LESSONS.forEach(dialogue => {
    buildDialogueQuizzes(dialogue).forEach(quiz => quizzes.push(quiz));
  });
  return quizzes;
}

function makeOpeningQuiz(dialogue: DialogueLesson, firstTurn: DialogueTurn, seed: number): QuizMatch {
  const choices = choiceObjects(
    firstTurn.en,
    DIALOGUE_LESSONS
      .filter(item => item.id !== dialogue.id)
      .map(item => item.turns[0] ? item.turns[0].en : "")
      .filter(Boolean),
    seed,
    "en",
  );
  return {
    id: `q-dlg-${dialogue.id}-opening`,
    type: "situation_match",
    lessonId: dialogue.id,
    scenario: dialogue.situation,
    scenarioEmoji: dialogue.emoji || undefined,
    prompt: "이 상황을 시작하는 가장 자연스러운 첫 문장은?",
    choices,
    answer: choiceIdByText(choices, firstTurn.en, "en"),
    explanation: `${dialogue.title}의 시작 문장입니다.`,
    tags: ["stage-2", "dialogue", "opening"].concat(dialogue.targetFunctions),
  };
}

function makeReplyQuiz(dialogue: DialogueLesson, promptTurn: DialogueTurn, answerTurn: DialogueTurn, seed: number): QuizMC {
  const choices = choiceObjects(
    answerTurn.en,
    otherTurns(dialogue.id)
      .filter(turn => turn.speaker === answerTurn.speaker)
      .map(turn => turn.en),
    seed,
    "text",
  );
  return {
    id: `q-dlg-${dialogue.id}-reply-${promptTurn.id}`,
    type: "multiple_choice",
    lessonId: dialogue.id,
    prompt: `${promptTurn.speaker}: ${promptTurn.en}\n다음에 이어질 자연스러운 말은?`,
    promptKo: promptTurn.ko,
    choices,
    answer: choiceIdByText(choices, answerTurn.en, "text"),
    explanation: `${answerTurn.ko} → ${answerTurn.en}`,
    tags: ["stage-2", "dialogue", "reply"].concat(dialogue.targetFunctions),
  };
}

function makeBlankQuiz(dialogue: DialogueLesson, turn: DialogueTurn): QuizFill {
  const blank = pickBlank(turn.en);
  const prompt = turn.en.replace(blank.raw, "___");
  const functionTags = turn.functionTags || [];
  return {
    id: `q-dlg-${dialogue.id}-blank-${turn.id}`,
    type: "fill_blank",
    lessonId: dialogue.id,
    prompt,
    promptKo: turn.ko,
    inputMode: "keyboard",
    answer: [blank.answer],
    explanation: turn.en,
    tags: ["stage-2", "dialogue", "recall"].concat(functionTags),
  };
}

function makeRoleResponseQuiz(dialogue: DialogueLesson, promptTurn: DialogueTurn, answerTurn: DialogueTurn, seed: number): QuizMatch {
  const choices = choiceObjects(
    answerTurn.en,
    otherTurns(dialogue.id)
      .filter(turn => turn.speaker === answerTurn.speaker)
      .map(turn => turn.en),
    seed,
    "en",
  );
  return {
    id: `q-dlg-${dialogue.id}-role-${promptTurn.id}`,
    type: "situation_match",
    lessonId: dialogue.id,
    scenario: `${promptTurn.speaker}: ${promptTurn.en}`,
    scenarioEmoji: "🎭",
    prompt: "상대 말에 맞춰 역할 대사로 답해보세요.",
    choices,
    answer: choiceIdByText(choices, answerTurn.en, "en"),
    explanation: `${answerTurn.ko} → ${answerTurn.en}`,
    tags: ["stage-2", "dialogue", "role-response"].concat(dialogue.targetFunctions),
  };
}

function pickReplyPair(turns: DialogueTurn[]): { prompt: DialogueTurn; answer: DialogueTurn } {
  return { prompt: turns[0], answer: turns[1] || turns[0] };
}

function pickFocusTurn(turns: DialogueTurn[]): DialogueTurn {
  return turns.find(turn => turn.en.length > 35) || turns[1] || turns[0];
}

function pickRolePromptTurn(turns: DialogueTurn[]): { prompt: DialogueTurn; answer: DialogueTurn } {
  const index = Math.min(2, Math.max(0, turns.length - 2));
  return { prompt: turns[index], answer: turns[index + 1] || turns[index] };
}

function otherTurns(dialogueId: string): DialogueTurn[] {
  const turns: DialogueTurn[] = [];
  DIALOGUE_LESSONS.forEach(dialogue => {
    if (dialogue.id !== dialogueId) {
      dialogue.turns.forEach(turn => turns.push(turn));
    }
  });
  return turns;
}

function choiceObjects<T extends "text" | "en">(
  answer: string,
  candidates: string[],
  seed: number,
  key: T,
): Array<T extends "text" ? { id: string; text: string } : { id: string; en: string; ko?: string }> {
  const unique = [answer].concat(candidates).filter(Boolean).filter((item, index, arr) =>
    arr.findIndex(other => normalize(other) === normalize(item)) === index,
  ).slice(0, 4);
  const rotated = rotate(unique, seed % unique.length);
  return rotated.map((item, index) => (
    key === "text"
      ? { id: `c${index + 1}`, text: item }
      : { id: `c${index + 1}`, en: item }
  )) as Array<T extends "text" ? { id: string; text: string } : { id: string; en: string; ko?: string }>;
}

function choiceIdByText<T extends "text" | "en">(
  choices: Array<T extends "text" ? { id: string; text: string } : { id: string; en: string; ko?: string }>,
  answer: string,
  key: T,
): string {
  const found = choices.find(choice => {
    const text = key === "text"
      ? (choice as { text: string }).text
      : (choice as { en: string }).en;
    return normalize(text) === normalize(answer);
  });
  return found ? found.id : choices[0].id;
}

function pickBlank(sentence: string): { raw: string; answer: string } {
  const matches: string[] = [];
  const pattern = /\b[A-Za-z][A-Za-z']{3,}\b/g;
  let match = pattern.exec(sentence);
  while (match) {
    matches.push(match[0]);
    match = pattern.exec(sentence);
  }
  const reversed = matches.slice().reverse();
  const raw = reversed.find(word => !COMMON_WORDS.has(word.toLowerCase()))
    || matches[matches.length - 1]
    || sentence.split(/\s+/)[0];
  return { raw, answer: raw.toLowerCase() };
}

function rotate<T>(items: T[], count: number): T[] {
  if (items.length === 0) return items;
  const offset = ((count % items.length) + items.length) % items.length;
  return items.slice(offset).concat(items.slice(0, offset));
}

function hash(value: string): number {
  return Array.from(value).reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^\w\s']/g, "").replace(/\s+/g, " ").trim();
}

const COMMON_WORDS = new Set([
  "about",
  "after",
  "before",
  "could",
  "from",
  "have",
  "need",
  "that",
  "there",
  "this",
  "what",
  "with",
  "would",
  "your",
]);
