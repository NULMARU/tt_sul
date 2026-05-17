import { useNavigate } from "react-router-dom";
import { DIALOGUE_LESSONS } from "@shared/data/dialogues.seed";
import { dialogueQuizIds } from "@shared/data/dialogue-quizzes";
import { useStore } from "../lib/store";

export function Dialogues() {
  const nav = useNavigate();
  const progress = useStore(s => s.dialogueProgress ?? {});
  const attempts = useStore(s => s.quizAttempts ?? {});

  const completed = DIALOGUE_LESSONS.filter(dialogue => progress[dialogue.id]?.completed).length;
  const pct = Math.round((completed / Math.max(1, DIALOGUE_LESSONS.length)) * 100);

  return (
    <div className="px-5 pt-6 pb-4 flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <button onClick={() => nav("/intermediate")} className="w-9 h-9 rounded-full hover:bg-surface-2">←</button>
        <div>
          <div className="text-xs text-text-muted">Stage 2 · 중급 과정</div>
          <h1 className="text-xl font-bold">🎭 대화 암송</h1>
        </div>
      </header>

      <section className="rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">역할을 바꿔 말하기</div>
            <p className="text-sm text-text-muted mt-1">
              전체 듣기, 끊어 읽기, 역할 A/B, 한글 힌트로 같은 대화를 여러 방식으로 출력합니다.
            </p>
          </div>
          <div className="text-right text-sm">
            <div className="font-bold">{pct}%</div>
            <div className="text-xs text-text-muted">{completed}/{DIALOGUE_LESSONS.length}</div>
          </div>
        </div>
        <div className="mt-3 h-2 rounded-full bg-surface-2 overflow-hidden">
          <div className="h-full bg-accent transition-[width]" style={{ width: `${pct}%` }} />
        </div>
      </section>

      <section className="grid gap-3">
        {DIALOGUE_LESSONS.map(dialogue => {
          const itemProgress = progress[dialogue.id];
          const quizIds = dialogueQuizIds(dialogue.id);
          const attemptedQuizCount = quizIds.filter(quizId => attempts[quizId]).length;
          return (
            <article
              key={dialogue.id}
              className="rounded-2xl border border-border bg-surface p-4"
            >
              <button
                onClick={() => nav(`/dialogue/${dialogue.id}`)}
                className="w-full text-left active:scale-[0.99] transition-transform"
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{dialogue.emoji ?? "💬"}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold truncate">{dialogue.title}</h2>
                      {itemProgress?.completed && <span className="text-xs text-success">완료</span>}
                    </div>
                    <p className="text-sm text-text-muted mt-0.5">{dialogue.subtitle}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {dialogue.targetFunctions.slice(0, 3).map(tag => (
                        <span key={tag} className="rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[11px] text-text-muted">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-text-muted mt-2">
                      연습 {itemProgress?.practiceCount ?? 0}회 · 퀴즈 {attemptedQuizCount}/{quizIds.length} · {dialogue.turns.length}턴
                    </div>
                  </div>
                  <div className="text-text-muted">→</div>
                </div>
              </button>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <button
                  onClick={() => nav(`/dialogue/${dialogue.id}`)}
                  className="rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs font-medium"
                >
                  암송
                </button>
                <button
                  onClick={() => nav(`/dialogue-quiz/${dialogue.id}`)}
                  className="rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs font-medium"
                >
                  퀴즈
                </button>
                <button
                  onClick={() => nav(`/dialogue-roleplay/${dialogue.id}`)}
                  className="rounded-xl bg-accent text-[#2A2522] px-3 py-2 text-xs font-medium"
                >
                  롤플레잉
                </button>
              </div>
            </article>
          );
        })}
      </section>

      <button
        onClick={() => nav("/review?practice=1&source=dialogues&n=5")}
        className="rounded-2xl border border-accent/50 bg-accent/10 px-4 py-3 text-sm font-medium"
      >
        대화 퀴즈 1분복습으로 풀기 →
      </button>
      <button
        onClick={() => nav("/intermediate-readings")}
        className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-medium"
      >
        중급 리딩·리스닝 랩으로 이동 →
      </button>
    </div>
  );
}
