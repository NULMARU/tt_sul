import type { AdvancedArticle, AdvancedExpression, Quiz, QuizFill, QuizMC } from "../types/schema";
import { ADVANCED_ARTICLES } from "./advanced.seed";

export function buildAdvancedArticleQuizzes(article: AdvancedArticle, distractorPool = ADVANCED_ARTICLES): Quiz[] {
  const expression = article.keyExpressions[0];
  if (!expression) return [];

  return [
    makeExpressionChoiceQuiz(article, expression, distractorPool),
    makeExpressionFillQuiz(article, expression),
  ];
}

export function getAdvancedQuizBank(articles: AdvancedArticle[] = ADVANCED_ARTICLES): Quiz[] {
  return articles.flatMap(article => buildAdvancedArticleQuizzes(article, articles));
}

export function advancedQuizIds(articleId: string): string[] {
  return [
    `q-adv-${articleId}-expression-choice`,
    `q-adv-${articleId}-expression-fill`,
  ];
}

function makeExpressionChoiceQuiz(
  article: AdvancedArticle,
  expression: AdvancedExpression,
  articles: AdvancedArticle[],
): QuizMC {
  const candidates = articles
    .flatMap(item => item.keyExpressions)
    .filter(item => item.en !== expression.en)
    .map(item => item.en);
  const uniqueChoices = [expression.en]
    .concat(candidates.filter(candidate => normalize(candidate) !== normalize(expression.en)).slice(0, 3));
  const choices = rotateUnique(uniqueChoices, hash(article.id))
    .map((text, index) => ({ id: `c${index + 1}`, text }));

  return {
    id: `q-adv-${article.id}-expression-choice`,
    type: "multiple_choice",
    lessonId: article.id,
    prompt: `Which advanced expression means "${expression.ko}"?`,
    promptKo: `상급 표현: ${expression.usage}`,
    choices,
    answer: choices.find(choice => choice.text === expression.en)?.id ?? choices[0].id,
    explanation: `${expression.en}: ${expression.ko}`,
    tags: ["stage-3", "advanced", "expression", article.category].concat(article.interestTags ?? []),
  };
}

function makeExpressionFillQuiz(article: AdvancedArticle, expression: AdvancedExpression): QuizFill {
  return {
    id: `q-adv-${article.id}-expression-fill`,
    type: "fill_blank",
    lessonId: article.id,
    prompt: "Complete the advanced expression: ___",
    promptKo: `${expression.ko} · ${expression.usage}`,
    inputMode: "keyboard",
    answer: [expression.en.toLowerCase()],
    explanation: `${expression.en}: ${expression.ko}`,
    tags: ["stage-3", "advanced", "expression", article.category].concat(article.interestTags ?? []),
  };
}

function rotateUnique(items: string[], seed: number): string[] {
  const unique = items.filter((item, index, arr) =>
    item && arr.findIndex(other => normalize(other) === normalize(item)) === index,
  );
  if (unique.length === 0) return unique;
  const offset = seed % unique.length;
  return unique.slice(offset).concat(unique.slice(0, offset));
}

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function hash(value: string): number {
  return Array.from(value).reduce((sum, char) => sum + char.charCodeAt(0), 0);
}
