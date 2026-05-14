import type { Quiz } from "@shared/types/schema";

export function isCorrect(quiz: Quiz, answer: unknown): boolean {
  switch (quiz.type) {
    case "multiple_choice": return typeof answer === "string" && answer === quiz.answer;
    case "ox":              return typeof answer === "boolean" && answer === quiz.answer;
    case "fill_blank": {
      if (typeof answer !== "string") return false;
      const norm = answer.trim().toLowerCase().replace(/\s+/g, " ");
      return quiz.answer.some(a => a.trim().toLowerCase() === norm);
    }
    case "word_arrange":
    case "translation": {
      if (!Array.isArray(answer)) return false;
      const eq = (a: string[]) => a.length === answer.length && a.every((v, i) => v === (answer as string[])[i]);
      if (eq(quiz.answer)) return true;
      return quiz.acceptableAnswers?.some(eq) ?? false;
    }
    case "situation_match": return typeof answer === "string" && answer === quiz.answer;
  }
}
