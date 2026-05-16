import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useStore } from "../lib/store";
import { buildReviewQueue, memoryStrength } from "../lib/srs";
import { LESSONS } from "@shared/data/stages.seed";
import { PHRASES } from "@shared/data/phrases.seed";
import { generateLessonQuizzes, makeArrange, makeFill, makeMC, makeOX } from "@shared/data/quiz-generator";
import { QuizPlayer } from "../components/QuizPlayer";
import { waitForTtsIdle } from "../lib/tts";
import type { Lesson, Quiz, QuizFill } from "@shared/types/schema";

export function Review() {
  const nav = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const attempts = useStore(s => s.quizAttempts);
  const srs = useStore(s => s.srs);
  const journal = useStore(s => s.journal);
  const customContentPhrases = useStore(s => s.customContentPhrases ?? []);
  const limit = Math.min(30, Number(params.get("n") ?? "5") || 5);
  const wrongOnly = params.get("wrong") === "1";
  const practiceMode = params.get("practice") === "1";
  const source = params.get("source") ?? "";

  // 사용자가 푼 적 있는 퀴즈 ID
  const dueIds = useMemo(() => buildReviewQueue(attempts, { n: limit, wrongOnly }), [attempts, limit, wrongOnly]);

  const lessonQuizBank = useMemo(() => [
    ...LESSONS.flatMap(buildLessonQuizBank),
    ...generateLessonQuizzes(customContentPhrases, "content-lab"),
  ], [customContentPhrases]);
  const journalQuizzes = useMemo<QuizFill[]>(() =>
    [...journal].reverse().flatMap(j =>
      (j.derivedQuizzes ?? []).map(q => ({
        id: q.id,
        type: "fill_blank" as const,
        lessonId: "journal",
        prompt: q.sentence,
        promptKo: "내 일기에서 만든 문제",
        inputMode: "keyboard" as const,
        answer: [q.answer, ...(q.accept ?? [])].map(a => a.toLowerCase()),
        explanation: q.sentence.replace("___", q.answer),
      })),
    ),
  [journal]);

  const dueQuizzes = useMemo(() => {
    const byId = new Map<Quiz["id"], Quiz>([...lessonQuizBank, ...journalQuizzes].map(q => [q.id, q]));
    return dueIds.map(id => byId.get(id)).filter(Boolean) as Quiz[];
  }, [dueIds, journalQuizzes, lessonQuizBank]);

  const computedQuizzes = useMemo<Quiz[]>(() => {
    if (dueQuizzes.length > 0) return dueQuizzes.slice(0, limit);
    if (journalQuizzes.length > 0 && !wrongOnly && !practiceMode) return journalQuizzes.slice(0, limit);
    if (!practiceMode) return [];
    if (source === "weak") return buildWeakPracticeQuizzes(srs, limit, customContentPhrases);

    const first = LESSONS[0];
    const phrases = lessonPhrases(first);
    return generateLessonQuizzes(phrases, first.id).slice(0, limit);
  }, [dueQuizzes, journalQuizzes, limit, practiceMode, source, srs, wrongOnly]);

  const computedKey = computedQuizzes.map(q => q.id).join("|");
  const routeKey = `${location.key}:${limit}:${wrongOnly ? "wrong" : "all"}:${practiceMode ? "practice" : "review"}:${source}`;
  const hasUnmatchedDue = dueIds.length > 0 && dueQuizzes.length === 0;
  const computedModeLabel =
    wrongOnly ? "오답만" :
    dueQuizzes.length > 0 ? "복습" :
    journalQuizzes.length > 0 && !practiceMode ? "일기 문제" :
    practiceMode ? "연습" :
    "복습";

  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>(computedQuizzes);
  const [modeLabel, setModeLabel] = useState(computedModeLabel);
  const routeKeyRef = useRef(routeKey);
  const sessionLockedRef = useRef(false);

  useEffect(() => {
    const routeChanged = routeKeyRef.current !== routeKey;
    if (!routeChanged && sessionLockedRef.current) return;

    routeKeyRef.current = routeKey;
    sessionLockedRef.current = false;
    setQuizzes(computedQuizzes);
    setModeLabel(computedModeLabel);
    setIdx(0);
    setResults([]);
  }, [computedKey, computedModeLabel, computedQuizzes, routeKey]);

  if (quizzes.length === 0) {
    return (
      <div className="px-6 py-12 text-center text-text-muted flex flex-col items-center gap-3">
        <div className="text-6xl mb-3">🎉</div>
        <h1 className="text-xl font-bold text-text">
          {wrongOnly ? "오답 복습할 문항이 없어요." : "지금 복습할 문항이 없어요."}
        </h1>
        <p className="max-w-[320px] text-sm">
          {hasUnmatchedDue
            ? "이전 복습 기록이 현재 문제 데이터와 맞지 않아 보여줄 수 있는 문항이 없어요."
            : "틀렸거나 복습 시간이 된 문제가 생기면 여기에 나타나요."}
        </p>
        <div className="mt-2 flex flex-col sm:flex-row gap-2">
          <button onClick={async () => { await waitForTtsIdle(); nav("/"); }} className="rounded-xl bg-accent text-[#2A2522] px-4 py-2.5 font-medium">메인으로</button>
          <button onClick={async () => { await waitForTtsIdle(); nav(`/review?practice=1&n=${limit}`); }} className="rounded-xl border border-border px-4 py-2.5 font-medium text-text">연습 문제 풀기</button>
        </div>
      </div>
    );
  }

  if (idx >= quizzes.length) {
    const correct = results.filter(Boolean).length;
    return (
      <div className="px-6 py-12 text-center flex flex-col items-center gap-3">
        <div className="text-6xl">{correct === quizzes.length ? "🎉" : "💪"}</div>
        <div className="text-2xl font-bold">{correct} / {quizzes.length}</div>
        <p className="text-text-muted">{Math.round((correct / quizzes.length) * 100)}% 정답</p>
        <button onClick={async () => { await waitForTtsIdle(); nav("/"); }} className="mt-3 rounded-xl bg-accent text-[#2A2522] px-4 py-2.5 font-medium">홈</button>
      </div>
    );
  }

  return (
    <div className="px-5 pt-4 pb-4 flex flex-col gap-3">
      <header className="flex items-center justify-between">
        <button onClick={async () => { await waitForTtsIdle(); nav("/"); }} className="w-9 h-9 rounded-full hover:bg-surface-2">✕</button>
        <div className="text-xs text-text-muted">{idx + 1} / {quizzes.length} · {modeLabel}</div>
        <div className="w-9" />
      </header>
      <QuizPlayer
        key={quizzes[idx].id}
        quiz={quizzes[idx]}
        onAnswered={() => { sessionLockedRef.current = true; }}
        onDone={(ok) => { setResults(r => [...r, ok]); setIdx(idx + 1); }}
      />
    </div>
  );
}

function buildLessonQuizBank(lesson: Lesson): Quiz[] {
  const phrases = lessonPhrases(lesson);
  return phrases.flatMap(phrase => [
    makeMC(phrase, phrases, lesson.id),
    makeFill(phrase, lesson.id),
    makeArrange(phrase, lesson.id),
    makeOX(phrase, phrases, lesson.id),
  ]);
}

function lessonPhrases(lesson: Lesson) {
  return Array.from(new Set(lesson.cards.map(c => c.phraseId).filter(Boolean)))
    .map(pid => PHRASES.find(p => p.id === pid)!)
    .filter(Boolean);
}

function buildWeakPracticeQuizzes(srs: ReturnType<typeof useStore.getState>["srs"], limit: number, customPhrases = [] as typeof PHRASES): Quiz[] {
  const phrases = [...PHRASES, ...customPhrases]
    .sort((a, b) => memoryStrength(srs[`q-mc-${a.id}`]) - memoryStrength(srs[`q-mc-${b.id}`]))
    .slice(0, Math.max(8, limit));
  return generateLessonQuizzes(phrases, "memory-map").slice(0, limit);
}
