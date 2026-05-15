import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../lib/store";
import { diaryToQuiz, llmAvailable } from "../lib/llm";

export function Journal() {
  const nav = useNavigate();
  const journal = useStore(s => s.journal);
  const add = useStore(s => s.addJournal);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function save() {
    if (!text.trim()) return;
    setLoading(true);
    let derivedIds: string[] | undefined;
    let derivedQuizzes: Array<{ id: string; sentence: string; answer: string; accept?: string[] }> | undefined;
    if (llmAvailable()) {
      const quizzes = await diaryToQuiz(text);
      if (quizzes && Array.isArray(quizzes)) {
        const stamp = Date.now();
        derivedQuizzes = quizzes.map((q, i) => ({
          id: `dq-${stamp}-${i}`,
          sentence: q.sentence,
          answer: q.answer,
          accept: q.accept,
        }));
        derivedIds = derivedQuizzes.map(q => q.id);
      }
    }
    add(new Date().getDate(), text, derivedIds, derivedQuizzes);
    setText("");
    setLoading(false);
  }

  return (
    <div className="px-5 pt-6 pb-4 flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <button onClick={() => nav("/")} className="w-9 h-9 rounded-full hover:bg-surface-2">←</button>
        <h1 className="text-xl font-bold">📓 일기</h1>
      </header>

      <p className="text-xs text-text-muted">
        오늘 학습한 표현으로 한 문장을 영어로 써보세요. {llmAvailable() ? "AI가 다음날 빈칸 퀴즈로 변환해줍니다." : "(LLM 프록시 미설정 — 텍스트만 저장됨)"}
      </p>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={4}
        placeholder="Today I... "
        className="en rounded-xl border-2 border-border bg-surface-2 p-3 outline-none focus:border-accent"
      />
      <button onClick={save} disabled={!text.trim() || loading} className="rounded-xl bg-accent text-[#2A2522] py-2.5 font-medium disabled:opacity-40">
        {loading ? "처리 중…" : "저장"}
      </button>

      <section className="flex flex-col gap-2 mt-2">
        <h2 className="text-sm text-text-muted">이전 기록</h2>
        {journal.length === 0 && <p className="text-text-muted text-sm">아직 기록이 없어요.</p>}
        {[...journal].reverse().map(j => (
          <div key={j.id} className="rounded-xl bg-surface border border-border p-3">
            <div className="text-xs text-text-muted">{new Date(j.date).toLocaleDateString("ko-KR")}</div>
            <p className="en text-sm mt-1">{j.text}</p>
            {j.derivedQuizzes && j.derivedQuizzes.length > 0 && (
              <div className="text-xs text-accent-strong mt-1">📝 빈칸 퀴즈 {j.derivedQuizzes.length}개 생성됨 · 복습에서 출제</div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
