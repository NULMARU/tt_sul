import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useStore } from "../lib/store";
import { buildReviewQueue } from "../lib/srs";
import { LESSONS } from "@shared/data/stages.seed";
import { PHRASES } from "@shared/data/phrases.seed";
import { generateLessonQuizzes } from "@shared/data/quiz-generator";
import { QuizPlayer } from "../components/QuizPlayer";
import { waitForTtsIdle } from "../lib/tts";
import type { QuizFill } from "@shared/types/schema";

export function Review() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const attempts = useStore(s => s.quizAttempts);
  const journal = useStore(s => s.journal);
  const limit = Math.min(30, Number(params.get("n") ?? "5") || 5);
  const wrongOnly = params.get("wrong") === "1";

  // 사용자가 푼 적 있는 퀴즈 ID
  const dueIds = useMemo(() => buildReviewQueue(attempts, { n: limit, wrongOnly }), [attempts, limit, wrongOnly]);

  // 푼 적이 없으면 첫 강의 퀴즈로 채움
  const quizzes = useMemo(() => {
    if (dueIds.length > 0) {
      const all = LESSONS.flatMap(l => {
        const phrases = Array.from(new Set(l.cards.map(c => c.phraseId).filter(Boolean)))
          .map(pid => PHRASES.find(p => p.id === pid)!)
          .filter(Boolean);
        return generateLessonQuizzes(phrases, l.id);
      });
      const byId = new Map(all.map(q => [q.id, q]));
      return dueIds.map(id => byId.get(id)).filter(Boolean) as any[];
    }
    const journalQuizzes: QuizFill[] = [...journal].reverse().flatMap(j =>
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
    );
    if (journalQuizzes.length > 0) return journalQuizzes.slice(0, limit);

    // fallback: 가장 빠른 강의 첫 문항
    const first = LESSONS[0];
    const phrases = Array.from(new Set(first.cards.map(c => c.phraseId).filter(Boolean)))
      .map(pid => PHRASES.find(p => p.id === pid)!)
      .filter(Boolean);
    return generateLessonQuizzes(phrases, first.id).slice(0, limit);
  }, [dueIds, journal, limit]);

  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);

  if (quizzes.length === 0) {
    return (
      <div className="px-6 py-12 text-center text-text-muted">
        <div className="text-6xl mb-3">🎉</div>
        복습할 문항이 없어요.
        <div className="mt-4">
          <button onClick={async () => { await waitForTtsIdle(); nav("/"); }} className="rounded-xl bg-accent text-[#2A2522] px-4 py-2.5 font-medium">메인으로</button>
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
        <div className="text-xs text-text-muted">{idx + 1} / {quizzes.length} · {wrongOnly ? "오답만" : "복습"}</div>
        <div className="w-9" />
      </header>
      <QuizPlayer key={quizzes[idx].id} quiz={quizzes[idx]} onDone={(ok) => { setResults(r => [...r, ok]); setIdx(idx + 1); }} />
    </div>
  );
}
