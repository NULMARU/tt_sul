import { useState } from "react";
import type { Quiz } from "@shared/types/schema";
import { isCorrect } from "../lib/quiz-check";
import { speak, vibrate } from "../lib/tts";
import { useStore } from "../lib/store";

export function QuizPlayer({ quiz, onDone }: { quiz: Quiz; onDone: (correct: boolean) => void }) {
  const [answer, setAnswer] = useState<unknown>(null);
  const [done, setDone] = useState(false);
  const record = useStore(s => s.recordQuizAttempt);

  function submit(a: unknown) {
    if (done) return;
    setAnswer(a);
    setDone(true);
    const ok = isCorrect(quiz, a);
    record(quiz.id, quiz.lessonId, ok);
    vibrate(ok ? 15 : [30, 60, 30]);
    if (quiz.type !== "ox") speak(extractEn(quiz));
    setTimeout(() => onDone(ok), 1200);
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 flex flex-col gap-4">
      {renderPrompt(quiz)}
      {renderInput(quiz, answer, done, submit)}
      {done && !isCorrect(quiz, answer) && quiz.explanation && (
        <div className="text-sm text-text-muted border-l-2 border-warn pl-2">{quiz.explanation}</div>
      )}
    </div>
  );
}

function extractEn(q: Quiz): string {
  if (q.type === "multiple_choice")  return q.choices.find(c => c.id === q.answer)?.text ?? "";
  if (q.type === "situation_match")  return q.choices.find(c => c.id === q.answer)?.en ?? "";
  if (q.type === "fill_blank")       return q.answer.join(" / ");
  if (q.type === "word_arrange" || q.type === "translation")
    return q.answer.map(id => q.tokens.find(t => t.id === id)?.text).join(" ");
  return "";
}

function renderPrompt(quiz: Quiz) {
  if (quiz.type === "multiple_choice")  return <p className="text-lg font-medium">"{quiz.prompt}"</p>;
  if (quiz.type === "ox")               return <p className="text-lg font-medium">{quiz.prompt}</p>;
  if (quiz.type === "fill_blank")       return <><p className="en text-lg">{quiz.prompt}</p>{quiz.promptKo && <p className="text-sm text-text-muted">{quiz.promptKo}</p>}</>;
  if (quiz.type === "word_arrange" || quiz.type === "translation") return <p className="text-base">{quiz.promptKo}</p>;
  if (quiz.type === "situation_match")  return <div className="text-center"><div className="text-3xl mb-1">{quiz.scenarioEmoji}</div><p>{quiz.scenario}</p></div>;
  return null;
}

function renderInput(quiz: Quiz, answer: unknown, done: boolean, submit: (a: unknown) => void) {
  if (quiz.type === "multiple_choice" || quiz.type === "situation_match") {
    const correct = quiz.answer;
    return (
      <div className="flex flex-col gap-2">
        {quiz.choices.map(c => {
          const sel = answer === c.id;
          const isAns = c.id === correct;
          let cls = "border-border bg-surface-2";
          if (done) {
            if (isAns) cls = "border-success bg-success/15";
            else if (sel) cls = "border-error bg-error/15";
          }
          return (
            <button
              key={c.id}
              disabled={done}
              onClick={() => submit(c.id)}
              className={`text-left rounded-xl border-2 px-3 py-3 transition-all active:scale-[0.99] ${cls}`}
            >
              <span className="en">{"text" in c ? c.text : c.en}</span>
              {"ko" in c && c.ko && <div className="text-xs text-text-muted mt-0.5">{c.ko}</div>}
            </button>
          );
        })}
      </div>
    );
  }
  if (quiz.type === "ox") {
    return (
      <div className="flex gap-3">
        {[true, false].map(v => {
          const sel = answer === v;
          const ans = v === quiz.answer;
          let cls = "border-border bg-surface-2";
          if (done) {
            if (ans) cls = "border-success bg-success/15";
            else if (sel) cls = "border-error bg-error/15";
          }
          return (
            <button
              key={String(v)}
              disabled={done}
              onClick={() => submit(v)}
              className={`flex-1 aspect-square rounded-2xl border-2 text-6xl flex items-center justify-center transition-all active:scale-95 ${cls}`}
            >
              {v ? "⭕" : "❌"}
            </button>
          );
        })}
      </div>
    );
  }
  if (quiz.type === "fill_blank") {
    return <FillInput quiz={quiz} done={done} answer={answer as string | null} submit={submit} />;
  }
  if (quiz.type === "word_arrange" || quiz.type === "translation") {
    return <ArrangeInput quiz={quiz} done={done} answer={answer as string[] | null} submit={submit} />;
  }
  return null;
}

function FillInput({ quiz, done, answer, submit }: any) {
  const [v, setV] = useState("");
  if (done) {
    return <div className="text-sm text-text-muted">정답: <span className="en font-medium text-text">{quiz.answer.join(" / ")}</span></div>;
  }
  return (
    <div className="flex gap-2">
      <input
        className="flex-1 en rounded-xl border-2 border-border bg-surface-2 px-3 py-2 outline-none focus:border-accent"
        value={answer ?? v}
        onChange={e => setV(e.target.value)}
        placeholder="답을 입력"
        autoCapitalize="none"
        autoCorrect="off"
      />
      <button onClick={() => submit(v)} disabled={!v.trim()} className="rounded-xl bg-accent text-[#2A2522] px-4 py-2 font-medium disabled:opacity-40">확인</button>
    </div>
  );
}

function ArrangeInput({ quiz, done, answer, submit }: any) {
  const [placed, setPlaced] = useState<string[]>([]);
  const tokenMap = Object.fromEntries(quiz.tokens.map((t: any) => [t.id, t.text]));
  const remaining = quiz.tokens.filter((t: any) => !placed.includes(t.id));

  function add(id: string) { if (!done) setPlaced(p => [...p, id]); }
  function remove(id: string) { if (!done) setPlaced(p => p.filter(x => x !== id)); }

  const display = answer ?? placed;
  return (
    <div className="flex flex-col gap-3">
      <div className="min-h-[56px] rounded-xl border-2 border-dashed border-border p-2 flex flex-wrap gap-1.5 bg-surface-2">
        {display.length === 0 && <span className="text-text-muted text-sm self-center px-2">탭해서 문장을 만드세요</span>}
        {display.map((id: string) => (
          <button key={id} disabled={done} onClick={() => remove(id)} className="en bg-accent/30 border border-accent rounded-lg px-2 py-1 text-sm">
            {tokenMap[id]}
          </button>
        ))}
      </div>
      {!done && (
        <div className="flex flex-wrap gap-1.5">
          {remaining.map((t: any) => (
            <button key={t.id} onClick={() => add(t.id)} className="en bg-surface-2 border border-border rounded-lg px-2 py-1 text-sm hover:bg-accent/20">
              {t.text}
            </button>
          ))}
        </div>
      )}
      {!done && <button onClick={() => submit(placed)} disabled={placed.length === 0} className="rounded-xl bg-accent text-[#2A2522] py-2 font-medium disabled:opacity-40">확인</button>}
      {done && <div className="text-sm text-text-muted">정답: <span className="en font-medium text-text">{quiz.answer.map((id: string) => tokenMap[id]).join(" ")}</span></div>}
    </div>
  );
}
