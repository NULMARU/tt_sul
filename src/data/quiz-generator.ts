// ============================================================
// Phrase 배열 → 6종 퀴즈 자동 생성
// ============================================================
import type { Phrase, Quiz, QuizMC, QuizFill, QuizArrange, QuizOX, QuizTranslate, QuizMatch } from "../types/schema";

function shuffle<T>(arr: T[]): T[] {
  return arr.map(v => [Math.random(), v] as const).sort((a, b) => a[0] - b[0]).map(([, v]) => v);
}

function tokenize(en: string): string[] {
  return en.replace(/[.,!?]/g, "").split(/\s+/).filter(Boolean);
}

// ─── 객관식: 한국어 → 영어 ───
export function makeMC(target: Phrase, pool: Phrase[], lessonId?: string): QuizMC {
  const distractors = shuffle(pool.filter(p => p.id !== target.id)).slice(0, 3);
  const all = shuffle([target, ...distractors]);
  return {
    id: `q-mc-${target.id}`,
    type: "multiple_choice",
    lessonId,
    reference: { lessonId, phraseId: target.id },
    prompt: target.ko,
    promptKo: target.ko,
    choices: all.map((p, i) => ({ id: `c${i}`, text: p.en })),
    answer: `c${all.findIndex(p => p.id === target.id)}`,
    explanation: `${target.ko} → ${target.en}`,
  };
}

// ─── 빈칸: 핵심 동사/명사 한 단어 제거 ───
export function makeFill(target: Phrase, lessonId?: string): QuizFill {
  const tokens = tokenize(target.en);
  // "I" 다음 단어를 빈칸으로 (대부분 동사)
  const idx = tokens[0] === "I" && tokens.length > 1 ? 1 : Math.min(1, tokens.length - 1);
  const answer = tokens[idx];
  const promptArr = [...tokens];
  promptArr[idx] = "___";
  return {
    id: `q-fill-${target.id}`,
    type: "fill_blank",
    lessonId,
    reference: { lessonId, phraseId: target.id },
    prompt: promptArr.join(" "),
    promptKo: target.ko,
    inputMode: "keyboard",
    answer: [answer.toLowerCase()],
    explanation: target.en,
  };
}

// ─── 어순 배열: 토큰 셔플 ───
export function makeArrange(target: Phrase, lessonId?: string): QuizArrange {
  const tokens = tokenize(target.en);
  const ids = tokens.map((_, i) => `t${i}`);
  return {
    id: `q-arrange-${target.id}`,
    type: "word_arrange",
    lessonId,
    reference: { lessonId, phraseId: target.id },
    promptKo: target.ko,
    tokens: tokens.map((text, i) => ({ id: `t${i}`, text })),
    answer: ids,
    explanation: target.en,
  };
}

// ─── OX: 한↔영 매칭의 참/거짓 ───
export function makeOX(target: Phrase, pool: Phrase[], lessonId?: string): QuizOX {
  const flip = Math.random() < 0.5;
  const distractor = pool.find(p => p.id !== target.id);
  const shown = flip && distractor ? distractor.en : target.en;
  return {
    id: `q-ox-${target.id}`,
    type: "ox",
    lessonId,
    reference: { lessonId, phraseId: target.id },
    prompt: `${target.ko} = "${shown}"`,
    answer: !flip,
    explanation: `정답은 ${target.en}`,
  };
}

// ─── 번역 (영어 토큰을 직접 배열) ───
export function makeTranslate(target: Phrase, lessonId?: string): QuizTranslate {
  const tokens = tokenize(target.en);
  return {
    id: `q-tr-${target.id}`,
    type: "translation",
    lessonId,
    reference: { lessonId, phraseId: target.id },
    promptKo: target.ko,
    tokens: tokens.map((text, i) => ({ id: `t${i}`, text })),
    answer: tokens.map((_, i) => `t${i}`),
    explanation: target.en,
  };
}

// ─── 상황 매칭 ───
export function makeMatch(target: Phrase, pool: Phrase[], scenario: string, scenarioEmoji: string, lessonId?: string): QuizMatch {
  const distractors = shuffle(pool.filter(p => p.id !== target.id)).slice(0, 2);
  const all = shuffle([target, ...distractors]);
  return {
    id: `q-match-${target.id}`,
    type: "situation_match",
    lessonId,
    reference: { lessonId, phraseId: target.id },
    scenario,
    scenarioEmoji,
    prompt: scenario,
    choices: all.map((p, i) => ({ id: `c${i}`, en: p.en, ko: p.ko })),
    answer: `c${all.findIndex(p => p.id === target.id)}`,
    explanation: `${scenario} → ${target.en}`,
  };
}

// ─── 한 강(레슨) 전체용 혼합 퀴즈 (6~10문) ───
export function generateLessonQuizzes(phrases: Phrase[], lessonId: string): Quiz[] {
  const pool = phrases.slice();
  const out: Quiz[] = [];
  const picks = shuffle(pool).slice(0, Math.min(8, pool.length));

  picks.forEach((p, i) => {
    const t = i % 4;
    if (t === 0) out.push(makeMC(p, pool, lessonId));
    else if (t === 1) out.push(makeFill(p, lessonId));
    else if (t === 2) out.push(makeArrange(p, lessonId));
    else out.push(makeOX(p, pool, lessonId));
  });

  return out;
}
