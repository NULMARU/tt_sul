import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LESSON_BY_ID } from "@shared/data/stages.seed";
import { SCENARIO_BY_ID } from "@shared/data/scenarios.seed";
import { PHRASE_BY_ID, PHRASES } from "@shared/data/phrases.seed";
import { generateLessonQuizzes } from "@shared/data/quiz-generator";
import { useStore } from "../lib/store";
import { speak } from "../lib/tts";
import { QuizPlayer } from "../components/QuizPlayer";
import { gradeWriting, llmAvailable } from "../lib/llm";

type Step = "intro" | "understand" | "absorb" | "read" | "produce" | "imprint" | "done";
const STEPS: Step[] = ["understand", "absorb", "read", "produce", "imprint"];
const STEP_META: Record<Step, { emoji: string; label: string }> = {
  intro:      { emoji: "📘", label: "시작" },
  understand: { emoji: "🧠", label: "이해" },
  absorb:     { emoji: "👂", label: "흡수" },
  read:       { emoji: "📖", label: "독해" },
  produce:    { emoji: "🗣️", label: "출력" },
  imprint:    { emoji: "🔁", label: "각인" },
  done:       { emoji: "✅", label: "완료" },
};

export function Lesson() {
  const { id } = useParams();
  const nav = useNavigate();
  const lesson = id ? LESSON_BY_ID[id] : undefined;
  const completeLesson = useStore(s => s.completeLesson);
  const bumpStreak = useStore(s => s.bumpStreak);
  const [step, setStep] = useState<Step>("intro");

  if (!lesson) return <div className="px-6 py-12 text-center text-text-muted">레슨을 찾을 수 없어요.</div>;

  const phrases = useMemo(
    () => Array.from(new Set(lesson.cards.map(c => c.phraseId).filter(Boolean))).map(pid => PHRASE_BY_ID[pid!]).filter(Boolean),
    [lesson.id]
  );

  const quizzes = useMemo(() => generateLessonQuizzes(phrases.length ? phrases : PHRASES.slice(0, 6), lesson.id), [phrases, lesson.id]);

  function next() {
    if (step === "intro") return setStep("understand");
    const i = STEPS.indexOf(step as any);
    if (i < 0) return;
    if (i === STEPS.length - 1) {
      completeLesson(lesson!.id);
      bumpStreak();
      setStep("done");
      return;
    }
    setStep(STEPS[i + 1]);
  }

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <header className="px-4 pt-3 pb-2 flex items-center gap-2 sticky top-0 bg-bg/95 backdrop-blur z-10">
        <button onClick={() => nav("/")} className="w-9 h-9 rounded-full hover:bg-surface-2">✕</button>
        <div className="flex-1">
          <div className="text-xs text-text-muted">{lesson.title}</div>
          <div className="font-semibold leading-tight">{lesson.subtitle}</div>
        </div>
      </header>

      {step !== "intro" && step !== "done" && <StepBar current={step as any} />}

      <main className="flex-1 px-5 py-4 flex flex-col gap-4">
        {step === "intro" && <Intro lesson={lesson} onStart={next} />}
        {step === "understand" && <Understand lesson={lesson} onDone={next} />}
        {step === "absorb"     && <Absorb phrases={phrases} onDone={next} />}
        {step === "read"       && <Read lesson={lesson} onDone={next} />}
        {step === "produce"    && <Produce lesson={lesson} onDone={next} />}
        {step === "imprint"    && <Imprint quizzes={quizzes} onDone={next} />}
        {step === "done"       && <Done lesson={lesson} />}
      </main>
    </div>
  );
}

function StepBar({ current }: { current: typeof STEPS[number] }) {
  return (
    <div className="flex items-center gap-1.5 px-5 py-2">
      {STEPS.map(s => {
        const active = s === current;
        const done = STEPS.indexOf(s) < STEPS.indexOf(current);
        return (
          <div key={s} className="flex-1 flex flex-col items-center gap-0.5">
            <div className={`h-1.5 w-full rounded-full ${done ? "bg-success" : active ? "bg-accent" : "bg-surface-2"}`} />
            <div className={`text-[10px] ${active ? "text-text" : "text-text-muted"}`}>{STEP_META[s].emoji}</div>
          </div>
        );
      })}
    </div>
  );
}

function Intro({ lesson, onStart }: { lesson: any; onStart: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-8">
      <div className="text-6xl">{lesson.emoji ?? "📘"}</div>
      <h2 className="text-2xl font-bold">{lesson.title}</h2>
      <p className="text-text-muted">{lesson.subtitle}</p>
      <p className="text-sm text-text-muted max-w-xs leading-relaxed">
        🧠 이해 → 👂 흡수 → 📖 독해 → 🗣️ 출력 → 🔁 각인의 5스텝 회로를 돕니다.
      </p>
      <button onClick={onStart} className="mt-4 rounded-xl bg-accent text-[#2A2522] px-6 py-3 font-medium">시작하기 →</button>
    </div>
  );
}

function Understand({ lesson, onDone }: { lesson: any; onDone: () => void }) {
  const cards = lesson.cards.filter((c: any) => c.type !== "example");
  const [idx, setIdx] = useState(0);
  if (cards.length === 0) {
    onDone();
    return null;
  }
  const card = cards[idx];
  function nextCard() { idx < cards.length - 1 ? setIdx(idx + 1) : onDone(); }

  return (
    <div className="flex-1 flex flex-col gap-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={card.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          className="rounded-2xl border-2 border-accent/40 bg-accent/10 p-6 flex flex-col items-center text-center gap-3"
        >
          {card.emoji && <div className="text-6xl">{card.emoji}</div>}
          <p className="text-lg leading-relaxed">{card.text}</p>
        </motion.div>
      </AnimatePresence>
      <div className="text-center text-xs text-text-muted">{idx + 1} / {cards.length}</div>
      <button onClick={nextCard} className="rounded-xl bg-accent text-[#2A2522] px-4 py-3 font-medium">다음 →</button>
    </div>
  );
}

function Absorb({ phrases, onDone }: { phrases: any[]; onDone: () => void }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  if (phrases.length === 0) { onDone(); return null; }
  const p = phrases[idx];

  function nextCard() {
    if (idx < phrases.length - 1) { setIdx(idx + 1); setFlipped(false); }
    else onDone();
  }

  return (
    <div className="flex-1 flex flex-col gap-4">
      <div className="text-center text-xs text-text-muted">{idx + 1} / {phrases.length} · 탭하여 영어 확인</div>
      <button
        onClick={() => setFlipped(!flipped)}
        className="rounded-2xl border-2 border-border bg-surface p-8 min-h-[200px] flex flex-col items-center justify-center text-center gap-2 active:scale-[0.99]"
      >
        {!flipped ? (
          <div className="text-2xl font-semibold">{p.ko}</div>
        ) : (
          <>
            <div className="en text-2xl font-semibold text-accent-strong">{p.en}</div>
            {p.past && <div className="text-sm text-text-muted">과거형: {p.past}</div>}
            <button
              onClick={(e) => { e.stopPropagation(); speak(p.en); }}
              className="mt-2 w-11 h-11 rounded-full border border-border bg-surface-2"
              aria-label="발음 듣기"
            >🔊</button>
          </>
        )}
      </button>
      <div className="flex gap-2">
        <button
          onClick={() => setFlipped(false) /* mark mode */}
          className="flex-1 rounded-xl border-2 border-error/40 text-error py-2.5 text-sm font-medium"
          disabled={!flipped}
        >😅 모르겠어요</button>
        <button
          onClick={() => nextCard()}
          className="flex-1 rounded-xl border-2 border-success/40 text-success py-2.5 text-sm font-medium"
          disabled={!flipped}
        >😊 알겠어요</button>
      </div>
      <button onClick={nextCard} className="rounded-xl bg-accent text-[#2A2522] px-4 py-3 font-medium">다음 →</button>
    </div>
  );
}

function Read({ lesson, onDone }: { lesson: any; onDone: () => void }) {
  const nav = useNavigate();
  if (!lesson.storyId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-8">
        <div className="text-4xl">📖</div>
        <p className="text-text-muted">이 강에는 연결된 스토리가 아직 없어요.</p>
        <button onClick={onDone} className="rounded-xl bg-accent text-[#2A2522] px-4 py-2.5 font-medium">건너뛰기 →</button>
      </div>
    );
  }
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-8">
      <div className="text-4xl">📖</div>
      <h3 className="font-semibold">오늘의 스토리</h3>
      <p className="text-sm text-text-muted">학습한 표현이 실제 글 속에서 어떻게 쓰이는지 봅니다.</p>
      <div className="flex gap-2 mt-2">
        <button onClick={() => nav(`/story/${lesson.storyId}`)} className="rounded-xl bg-accent text-[#2A2522] px-4 py-2.5 font-medium">읽기 →</button>
        <button onClick={onDone} className="rounded-xl border border-border px-4 py-2.5 text-sm text-text-muted">건너뛰기</button>
      </div>
    </div>
  );
}

function Produce({ lesson, onDone }: { lesson: any; onDone: () => void }) {
  const scIds: string[] = lesson.scenarioIds ?? [];
  const [scIdx, setScIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [free, setFree] = useState("");
  const [grade, setGrade] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  if (scIds.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-text-muted">자유 작문 — 학습한 표현으로 한 문장 써보세요.</p>
        <FreeWrite free={free} setFree={setFree} loading={loading} grade={grade}
          onSubmit={async () => { setLoading(true); const r = await gradeWriting(free); setGrade(r); setLoading(false); }} />
        <button onClick={onDone} className="rounded-xl bg-accent text-[#2A2522] px-4 py-3 font-medium">다음 →</button>
      </div>
    );
  }

  const sc = SCENARIO_BY_ID[scIds[scIdx]];
  const step = sc?.steps[stepIdx];
  if (!sc || !step) { onDone(); return null; }

  function nextStep() {
    setRevealed(false);
    if (stepIdx < sc!.steps.length - 1) setStepIdx(stepIdx + 1);
    else if (scIdx < scIds.length - 1) { setScIdx(scIdx + 1); setStepIdx(0); }
    else onDone();
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl bg-surface-2 border border-border p-3 text-center">
        <div className="text-3xl">{sc.emoji}</div>
        <div className="text-sm">{sc.prompt}</div>
      </div>
      <div className="flex gap-1">
        {sc.steps.map((_, i) => (
          <div key={i} className={`flex-1 h-1.5 rounded-full ${i < stepIdx ? "bg-success" : i === stepIdx ? "bg-accent" : "bg-surface-2"}`} />
        ))}
      </div>
      <div className="rounded-2xl bg-surface border border-border p-4">
        <div className="text-xs text-accent-strong font-semibold mb-1">{step.label}</div>
        <p className="text-sm">{step.instruction}</p>
        {!revealed ? (
          <button onClick={() => setRevealed(true)} className="mt-3 w-full rounded-xl border-2 border-accent bg-accent/10 py-2.5 text-sm font-semibold">💡 정답 확인</button>
        ) : (
          <div className="mt-3 rounded-xl bg-success/15 border border-success p-3 text-center">
            <div className="en text-lg font-semibold">{step.answer}</div>
            <div className="text-xs text-text-muted mt-1">{step.answerKo}</div>
            <button onClick={() => speak(step.answer)} className="mt-2 w-10 h-10 rounded-full border border-success/30">🔊</button>
          </div>
        )}
      </div>
      {revealed && (
        <button onClick={nextStep} className="rounded-xl bg-accent text-[#2A2522] px-4 py-3 font-medium">다음 →</button>
      )}
    </div>
  );
}

function FreeWrite({ free, setFree, loading, grade, onSubmit }: any) {
  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={free}
        onChange={e => setFree(e.target.value)}
        rows={3}
        placeholder="자기 영어로 한 문장…"
        className="en rounded-xl border-2 border-border bg-surface-2 p-3 outline-none focus:border-accent"
      />
      <button
        onClick={onSubmit}
        disabled={!free.trim() || loading}
        className="rounded-xl bg-accent text-[#2A2522] px-4 py-2.5 font-medium disabled:opacity-40"
      >
        {loading ? "채점 중…" : llmAvailable() ? "AI 채점" : "저장 (LLM 미설정 — proxy URL 필요)"}
      </button>
      {grade && (
        <div className="text-sm rounded-xl bg-surface-2 border border-border p-3 flex flex-col gap-1">
          <div>점수: <b>{grade.score}/10</b></div>
          {grade.fix && <div>📝 수정: <span className="en">{grade.fix}</span></div>}
          {grade.alt && <div>✨ 대안: <span className="en">{grade.alt}</span></div>}
          {grade.why && <div className="text-text-muted">{grade.why}</div>}
        </div>
      )}
    </div>
  );
}

function Imprint({ quizzes, onDone }: { quizzes: any[]; onDone: () => void }) {
  const [idx, setIdx] = useState(0);
  if (idx >= quizzes.length) { onDone(); return null; }
  const q = quizzes[idx];
  return (
    <div className="flex flex-col gap-3">
      <div className="text-center text-xs text-text-muted">{idx + 1} / {quizzes.length}</div>
      <QuizPlayer key={q.id} quiz={q} onDone={() => setIdx(idx + 1)} />
    </div>
  );
}

function Done({ lesson }: { lesson: any }) {
  const nav = useNavigate();
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-12">
      <div className="text-6xl">🎉</div>
      <h2 className="text-2xl font-bold">{lesson.title} 완료!</h2>
      <p className="text-text-muted">틀린 문항은 복습 큐에 자동으로 추가됐어요.</p>
      <div className="flex gap-2 mt-2">
        <button onClick={() => nav("/review")} className="rounded-xl bg-accent text-[#2A2522] px-4 py-2.5 font-medium">복습 큐로</button>
        <button onClick={() => nav("/")} className="rounded-xl border border-border px-4 py-2.5 text-sm">홈</button>
      </div>
    </div>
  );
}
