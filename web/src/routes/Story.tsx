import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { STORY_BY_ID, STORIES } from "@shared/data/stories.seed";
import { PHRASE_BY_ID } from "@shared/data/phrases.seed";
import { PLACE_META, SITUATION_META } from "@shared/data/taxonomy";
import { useStore } from "../lib/store";
import { speak, vibrate } from "../lib/tts";
import { rewriteStory, llmAvailable } from "../lib/llm";
import type { StoryDifficulty } from "@shared/types/schema";

const DIFFS: StoryDifficulty[] = ["easy", "natural", "challenge"];
const DIFF_LABEL: Record<StoryDifficulty, { label: string; color: string }> = {
  easy:      { label: "🟢 단순", color: "bg-success/20 border-success" },
  natural:   { label: "🟡 자연", color: "bg-accent/20 border-accent" },
  challenge: { label: "🔴 도전", color: "bg-error/20 border-error" },
};

export function Story() {
  const { id } = useParams();
  const nav = useNavigate();
  const setRead = useStore(s => s.setStoryRead);

  const story = useMemo(() => {
    if (!id) return undefined;
    if (id === "today") {
      const today = new Date().getDate() % 30 || 1;
      return STORIES.find(s => s.day === today) ?? STORIES[0];
    }
    return STORY_BY_ID[id];
  }, [id]);

  const [diff, setDiff] = useState<StoryDifficulty>("natural");
  const [generated, setGenerated] = useState<Partial<Record<StoryDifficulty, string>>>({});
  const [loading, setLoading] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  if (!story) return <div className="px-6 py-12 text-center text-text-muted">스토리를 찾을 수 없어요.</div>;

  const body = story.body[diff] ?? generated[diff];

  async function loadDifficulty(target: StoryDifficulty) {
    setDiff(target);
    if (story!.body[target] || generated[target]) return;
    const base = story!.body.natural ?? story!.body.easy ?? story!.body.challenge;
    if (!base) return;
    if (!llmAvailable()) return;
    setLoading(true);
    const out = await rewriteStory(base, target);
    if (out) setGenerated(prev => ({ ...prev, [target]: out }));
    setLoading(false);
  }

  useEffect(() => {
    if (body) setRead(story.id, diff);
  }, [body, story.id]);

  const placeMeta = PLACE_META[story.place];

  return (
    <div className="px-5 pt-4 pb-4 flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <button onClick={() => nav(-1)} className="w-9 h-9 rounded-full hover:bg-surface-2">←</button>
        <div className="text-xs text-text-muted">
          Day {story.day} · {placeMeta.emoji} {placeMeta.ko} · {story.situations.map(s => SITUATION_META[s]?.emoji).join("")}
        </div>
      </header>

      <h1 className="text-2xl font-bold leading-tight">"{story.title}"</h1>

      {/* 난이도 슬라이더 */}
      <div className="flex gap-1.5">
        {DIFFS.map(d => (
          <button
            key={d}
            onClick={() => loadDifficulty(d)}
            className={`flex-1 rounded-xl border-2 py-2 text-sm font-medium ${diff === d ? DIFF_LABEL[d].color : "border-border bg-surface"}`}
          >{DIFF_LABEL[d].label}</button>
        ))}
      </div>

      {/* 본문 */}
      <article className="rounded-2xl bg-surface border border-border p-5 leading-relaxed">
        {loading && <div className="text-text-muted text-sm text-center">난이도 변환 중…</div>}
        {!body && !loading && (
          <div className="text-text-muted text-sm text-center">
            이 난이도의 본문은 준비 중이에요.
            {!llmAvailable() && <div className="mt-1 text-xs">VITE_LLM_PROXY_URL 설정 시 자동 변환</div>}
          </div>
        )}
        {body && <HighlightedBody text={body} phraseIds={story.phraseIds} />}
        {body && (
          <div className="mt-4 flex gap-2">
            <button onClick={() => speak(body, { rate: 1 })} className="rounded-xl border border-border px-3 py-2 text-sm">🔊 듣기</button>
            <button onClick={() => speak(body, { rate: 0.85 })} className="rounded-xl border border-border px-3 py-2 text-sm">🐢 천천히</button>
          </div>
        )}
      </article>

      {/* 학습 표현 칩 */}
      {story.phraseIds.length > 0 && (
        <section>
          <div className="text-xs text-text-muted mb-1.5">이 글의 학습 표현</div>
          <div className="flex flex-wrap gap-1.5">
            {story.phraseIds.map(pid => {
              const p = PHRASE_BY_ID[pid];
              if (!p) return null;
              return (
                <button key={pid} onClick={() => speak(p.en)} className="text-xs en rounded-full bg-surface-2 border border-border px-2 py-1">
                  {p.en}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* 이해 퀴즈 */}
      {story.comprehension && body && (
        <button onClick={() => { setShowQuiz(true); vibrate(15); }} className="rounded-xl bg-accent text-[#2A2522] px-4 py-3 font-medium">
          이해 퀴즈 3문항 ▶
        </button>
      )}
      {showQuiz && story.comprehension && (
        <ComprehensionQuiz quiz={story.comprehension} onDone={() => nav(-1)} />
      )}
    </div>
  );
}

function HighlightedBody({ text, phraseIds }: { text: string; phraseIds: string[] }) {
  const phraseTexts = phraseIds.map(pid => PHRASE_BY_ID[pid]?.en).filter(Boolean) as string[];
  // 간단한 하이라이트 (대소문자 무시, 단순 substring)
  let parts: (string | { en: string })[] = [text];
  for (const en of phraseTexts) {
    const next: typeof parts = [];
    for (const p of parts) {
      if (typeof p !== "string") { next.push(p); continue; }
      const re = new RegExp(`(${en.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "i");
      const segs = p.split(re);
      for (const s of segs) {
        if (s.toLowerCase() === en.toLowerCase()) next.push({ en: s });
        else next.push(s);
      }
    }
    parts = next;
  }
  return (
    <p className="en text-base leading-relaxed whitespace-pre-wrap">
      {parts.map((p, i) =>
        typeof p === "string"
          ? <span key={i}>{p}</span>
          : <button key={i} onClick={() => speak(p.en)} className="bg-accent/30 rounded px-0.5 font-medium">{p.en}</button>
      )}
    </p>
  );
}

function ComprehensionQuiz({ quiz, onDone }: { quiz: any; onDone: () => void }) {
  const [idx, setIdx] = useState(0);
  const [sum, setSum] = useState("");
  const [fill, setFill] = useState("");
  const [inf, setInf] = useState<number | null>(null);
  const [results, setResults] = useState<boolean[]>([]);

  function nextQ(ok: boolean) {
    setResults(r => [...r, ok]);
    vibrate(ok ? 15 : [30, 60, 30]);
    setIdx(idx + 1);
  }

  if (idx === 0) {
    return (
      <div className="rounded-2xl bg-surface border border-border p-4 flex flex-col gap-3">
        <div className="text-xs text-text-muted">1/3 · 요약</div>
        <p className="text-base">{quiz.summary.question}</p>
        <input value={sum} onChange={e => setSum(e.target.value)} placeholder="짧게 답하기" className="en rounded-xl border-2 border-border bg-surface-2 p-3 outline-none focus:border-accent" />
        <button onClick={() => nextQ(sum.toLowerCase().includes(quiz.summary.answer.toLowerCase().split(" ")[0]))} disabled={!sum.trim()} className="rounded-xl bg-accent text-[#2A2522] py-2.5 font-medium disabled:opacity-40">확인</button>
      </div>
    );
  }
  if (idx === 1) {
    return (
      <div className="rounded-2xl bg-surface border border-border p-4 flex flex-col gap-3">
        <div className="text-xs text-text-muted">2/3 · 빈칸</div>
        <p className="en">{quiz.fill.sentence}</p>
        <input value={fill} onChange={e => setFill(e.target.value)} placeholder="빈칸 채우기" className="en rounded-xl border-2 border-border bg-surface-2 p-3 outline-none focus:border-accent" />
        <button onClick={() => nextQ(fill.toLowerCase().trim() === quiz.fill.answer.toLowerCase())} disabled={!fill.trim()} className="rounded-xl bg-accent text-[#2A2522] py-2.5 font-medium disabled:opacity-40">확인</button>
      </div>
    );
  }
  if (idx === 2) {
    return (
      <div className="rounded-2xl bg-surface border border-border p-4 flex flex-col gap-3">
        <div className="text-xs text-text-muted">3/3 · 추론</div>
        <p>{quiz.inference.question}</p>
        <div className="flex flex-col gap-2">
          {quiz.inference.choices.map((c: string, i: number) => (
            <button
              key={i}
              onClick={() => setInf(i)}
              className={`text-left rounded-xl border-2 px-3 py-2 ${inf === i ? "border-accent bg-accent/15" : "border-border bg-surface-2"}`}
            >{c}</button>
          ))}
        </div>
        <button onClick={() => nextQ(inf === quiz.inference.answer)} disabled={inf === null} className="rounded-xl bg-accent text-[#2A2522] py-2.5 font-medium disabled:opacity-40">확인</button>
      </div>
    );
  }
  const ok = results.filter(Boolean).length;
  return (
    <div className="rounded-2xl bg-surface border border-border p-6 text-center flex flex-col gap-3">
      <div className="text-5xl">{ok === 3 ? "🎉" : ok >= 2 ? "👏" : "💪"}</div>
      <div className="text-2xl font-bold">{ok} / 3</div>
      <button onClick={onDone} className="rounded-xl bg-accent text-[#2A2522] py-2.5 font-medium">완료</button>
    </div>
  );
}
