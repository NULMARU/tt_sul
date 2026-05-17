import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DIALOGUE_BY_ID } from "@shared/data/dialogues.seed";
import { buildDialogueQuizzes } from "@shared/data/dialogue-quizzes";
import { QuizPlayer } from "../components/QuizPlayer";
import { waitForTtsIdle } from "../lib/tts";

export function DialogueQuiz() {
  const { id } = useParams();
  const nav = useNavigate();
  const dialogue = id ? DIALOGUE_BY_ID[id] : undefined;
  const quizzes = useMemo(() => dialogue ? buildDialogueQuizzes(dialogue) : [], [dialogue]);
  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);

  if (!dialogue) {
    return <div className="px-6 py-12 text-center text-text-muted">대화 퀴즈를 찾을 수 없어요.</div>;
  }

  if (idx >= quizzes.length) {
    const correct = results.filter(Boolean).length;
    const pct = Math.round((correct / Math.max(1, quizzes.length)) * 100);
    return (
      <div className="px-6 py-12 flex flex-col items-center gap-4 text-center">
        <div className="text-6xl">{pct >= 80 ? "🎯" : "🧩"}</div>
        <div>
          <div className="text-sm text-text-muted">대화 퀴즈 완료</div>
          <h1 className="text-2xl font-bold">{correct} / {quizzes.length}</h1>
          <p className="text-sm text-text-muted mt-1">
            틀린 문항은 1분복습 큐에 자동으로 연결됩니다.
          </p>
        </div>
        <div className="grid w-full max-w-[360px] grid-cols-2 gap-2">
          <button
            onClick={async () => { await waitForTtsIdle(); nav(`/dialogue/${dialogue.id}`); }}
            className="rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium"
          >
            암송으로
          </button>
          <button
            onClick={async () => { await waitForTtsIdle(); nav(`/dialogue-roleplay/${dialogue.id}`); }}
            className="rounded-xl bg-accent text-[#2A2522] px-4 py-3 text-sm font-medium"
          >
            롤플레잉
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-4 pb-4 flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <button onClick={async () => { await waitForTtsIdle(); nav(`/dialogue/${dialogue.id}`); }} className="w-9 h-9 rounded-full hover:bg-surface-2">←</button>
        <div className="text-center">
          <div className="text-xs text-text-muted">Stage 2 · 대화 퀴즈</div>
          <h1 className="text-base font-bold">{dialogue.emoji} {dialogue.title}</h1>
        </div>
        <div className="w-9 text-right text-xs text-text-muted">{idx + 1}/{quizzes.length}</div>
      </header>

      <section className="rounded-2xl border border-border bg-surface p-4">
        <div className="text-sm font-semibold">암송 후 확인</div>
        <p className="mt-1 text-sm text-text-muted">
          의미, 다음 대사, 핵심 표현을 짧게 확인합니다.
        </p>
      </section>

      <QuizPlayer
        key={quizzes[idx].id}
        quiz={quizzes[idx]}
        onDone={(ok) => {
          setResults(prev => [...prev, ok]);
          setIdx(prev => prev + 1);
        }}
      />
    </div>
  );
}
