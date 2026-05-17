import { useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DIALOGUE_BY_ID } from "@shared/data/dialogues.seed";
import type { DialoguePracticeMode, DialogueTurn } from "@shared/types/schema";
import { ShadowingRecorder } from "../components/ShadowingRecorder";
import { useStore } from "../lib/store";
import { speak, stopSpeak, waitForTtsIdle } from "../lib/tts";

const MODES: Array<{ id: DialoguePracticeMode; label: string; short: string }> = [
  { id: "realtime", label: "실시간 대화", short: "전체" },
  { id: "pause-repeat", label: "끊어 읽기", short: "반복" },
  { id: "role-a", label: "A 역할", short: "A" },
  { id: "role-b", label: "B 역할", short: "B" },
  { id: "korean-hint", label: "한글 힌트", short: "힌트" },
];

export function DialogueLesson() {
  const { id } = useParams();
  const nav = useNavigate();
  const dialogue = id ? DIALOGUE_BY_ID[id] : undefined;
  const recordPractice = useStore(s => s.recordDialoguePractice);
  const completeDialogue = useStore(s => s.completeDialogue);
  const progress = useStore(s => id ? s.dialogueProgress?.[id] : undefined);
  const [mode, setMode] = useState<DialoguePracticeMode>("realtime");
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const playTokenRef = useRef(0);

  const modeMeta = useMemo(() => MODES.find(item => item.id === mode) ?? MODES[0], [mode]);

  if (!dialogue) {
    return <div className="px-6 py-12 text-center text-text-muted">대화를 찾을 수 없어요.</div>;
  }

  const currentDialogue = dialogue;
  const turn = currentDialogue.turns[idx];

  async function playAll() {
    const token = ++playTokenRef.current;
    setPlaying(true);
    recordPractice(currentDialogue.id, "realtime");
    for (const item of currentDialogue.turns) {
      if (token !== playTokenRef.current) break;
      await speak(item.en, { rate: 0.95 });
      if (token !== playTokenRef.current) break;
      await delay(250);
    }
    if (token === playTokenRef.current) setPlaying(false);
  }

  async function playTurn(item = turn) {
    recordPractice(currentDialogue.id, mode);
    await speak(item.en, { rate: mode === "pause-repeat" ? 0.85 : 0.95 });
  }

  async function complete() {
    await waitForTtsIdle();
    completeDialogue(currentDialogue.id);
    nav("/dialogues");
  }

  function changeMode(next: DialoguePracticeMode) {
    playTokenRef.current += 1;
    stopSpeak();
    setPlaying(false);
    setMode(next);
    setIdx(0);
    setRevealed(false);
  }

  return (
    <div className="px-5 pt-4 pb-4 flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <button onClick={async () => { await waitForTtsIdle(); nav("/dialogues"); }} className="w-9 h-9 rounded-full hover:bg-surface-2">←</button>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-text-muted">Stage 2 · {modeMeta.label}</div>
          <h1 className="text-xl font-bold truncate">{currentDialogue.emoji} {currentDialogue.title}</h1>
        </div>
      </header>

      <section className="rounded-2xl border border-border bg-surface p-4">
        <p className="text-sm text-text-muted">{currentDialogue.situation}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {currentDialogue.targetFunctions.map(tag => (
            <span key={tag} className="rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[11px] text-text-muted">
              {tag}
            </span>
          ))}
        </div>
        {progress && (
          <div className="mt-3 text-xs text-text-muted">
            연습 {progress.practiceCount}회 · 최근 모드 {progress.lastMode ? modeLabel(progress.lastMode) : "없음"}
            {progress.completed && " · 완료"}
          </div>
        )}
      </section>

      <div className="grid grid-cols-5 gap-1.5">
        {MODES.map(item => (
          <button
            key={item.id}
            onClick={() => changeMode(item.id)}
            className={`rounded-xl border px-2 py-2 text-xs font-medium ${mode === item.id ? "border-accent bg-accent/20 text-text" : "border-border bg-surface text-text-muted"}`}
          >
            {item.short}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => nav(`/dialogue-quiz/${currentDialogue.id}`)}
          className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium"
        >
          대화 퀴즈
        </button>
        <button
          onClick={() => nav(`/dialogue-roleplay/${currentDialogue.id}`)}
          className="rounded-xl bg-accent text-[#2A2522] px-4 py-2.5 text-sm font-medium"
        >
          AI 롤플레잉
        </button>
      </div>

      {mode === "realtime" ? (
        <RealtimePanel turns={currentDialogue.turns} playing={playing} onPlayAll={playAll} onStop={() => { playTokenRef.current += 1; stopSpeak(); setPlaying(false); }} />
      ) : (
        <PracticePanel
          mode={mode}
          turn={turn}
          idx={idx}
          total={currentDialogue.turns.length}
          revealed={revealed}
          setRevealed={setRevealed}
          onPlay={() => playTurn()}
          onPrev={() => { setIdx(i => Math.max(0, i - 1)); setRevealed(false); }}
          onNext={() => { setIdx(i => Math.min(currentDialogue.turns.length - 1, i + 1)); setRevealed(false); }}
        />
      )}

      <section className="rounded-2xl border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold">전체 대화</h2>
        <div className="mt-3 flex flex-col gap-2">
          {currentDialogue.turns.map(item => (
            <button
              key={item.id}
              onClick={() => playTurn(item)}
              className="text-left rounded-xl bg-surface-2 px-3 py-2"
            >
              <div className="text-xs text-text-muted">{item.speaker}</div>
              <div className="en text-sm">{item.en}</div>
              <div className="text-xs text-text-muted mt-0.5">{item.ko}</div>
            </button>
          ))}
        </div>
      </section>

      <button
        onClick={complete}
        className="rounded-xl bg-accent text-[#2A2522] px-4 py-3 font-medium"
      >
        암송 완료로 기록
      </button>
    </div>
  );
}

function RealtimePanel({
  turns,
  playing,
  onPlayAll,
  onStop,
}: {
  turns: DialogueTurn[];
  playing: boolean;
  onPlayAll: () => void;
  onStop: () => void;
}) {
  return (
    <section className="rounded-2xl border border-accent/40 bg-accent/10 p-5 text-center">
      <div className="text-4xl">🎧</div>
      <h2 className="font-semibold mt-2">전체 대화를 자연 속도로 듣기</h2>
      <p className="text-sm text-text-muted mt-1">처음에는 흐름을 듣고, 두 번째부터는 입모양만이라도 같이 따라가세요.</p>
      <div className="mt-4 flex gap-2 justify-center">
        <button
          onClick={onPlayAll}
          disabled={playing}
          className="rounded-xl bg-accent text-[#2A2522] px-4 py-2.5 font-medium disabled:opacity-40"
        >
          {playing ? "재생 중..." : `${turns.length}턴 듣기`}
        </button>
        {playing && (
          <button onClick={onStop} className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm">
            정지
          </button>
        )}
      </div>
    </section>
  );
}

function PracticePanel({
  mode,
  turn,
  idx,
  total,
  revealed,
  setRevealed,
  onPlay,
  onPrev,
  onNext,
}: {
  mode: DialoguePracticeMode;
  turn: DialogueTurn;
  idx: number;
  total: number;
  revealed: boolean;
  setRevealed: (value: boolean) => void;
  onPlay: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const roleMode = mode === "role-a" || mode === "role-b";
  const targetSpeaker = mode === "role-a" ? "A" : mode === "role-b" ? "B" : null;
  const isMyTurn = targetSpeaker === turn.speaker;
  const showEnglish = mode === "pause-repeat" || (!roleMode && revealed) || (roleMode && (!isMyTurn || revealed));

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between text-xs text-text-muted">
        <span>{idx + 1} / {total}</span>
        <span>Speaker {turn.speaker}</span>
      </div>

      <div className="rounded-2xl bg-surface-2 p-5 min-h-[180px] flex flex-col justify-center gap-3">
        {mode === "korean-hint" && (
          <>
            <div className="text-sm text-text-muted">한글 힌트</div>
            <div className="text-xl font-semibold">{turn.hintKo ?? turn.ko}</div>
          </>
        )}

        {roleMode && isMyTurn && !revealed && (
          <>
            <div className="text-sm text-text-muted">내 차례입니다. 먼저 말해보세요.</div>
            <div className="text-xl font-semibold">{turn.ko}</div>
          </>
        )}

        {roleMode && !isMyTurn && (
          <>
            <div className="text-sm text-text-muted">상대 대사</div>
            <div className="en text-xl font-semibold">{turn.en}</div>
            <div className="text-sm text-text-muted">{turn.ko}</div>
          </>
        )}

        {mode === "pause-repeat" && (
          <>
            <div className="en text-xl font-semibold">{turn.en}</div>
            <div className="text-sm text-text-muted">{turn.ko}</div>
          </>
        )}

        {showEnglish && (mode === "korean-hint" || (roleMode && isMyTurn)) && (
          <>
            <div className="text-sm text-text-muted">정답 문장</div>
            <div className="en text-xl font-semibold text-accent-strong">{turn.en}</div>
            <div className="text-sm text-text-muted">{turn.ko}</div>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={onPlay} className="rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm font-medium">
          듣기
        </button>
        {mode !== "pause-repeat" && (
          <button onClick={() => setRevealed(!revealed)} className="rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm font-medium">
            {revealed ? "숨기기" : "정답 보기"}
          </button>
        )}
      </div>

      {roleMode && isMyTurn && (
        <div>
          <div className="mb-2 text-xs text-text-muted">
            내 대사를 먼저 말해보고, 녹음 후 정답 음성과 비교해보세요.
          </div>
          <ShadowingRecorder text={turn.en} title={`${turn.speaker} 역할 녹음`} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button onClick={onPrev} disabled={idx === 0} className="rounded-xl border border-border px-4 py-2.5 text-sm disabled:opacity-40">
          이전
        </button>
        <button onClick={onNext} disabled={idx === total - 1} className="rounded-xl bg-accent text-[#2A2522] px-4 py-2.5 text-sm font-medium disabled:opacity-40">
          다음
        </button>
      </div>
    </section>
  );
}

function modeLabel(mode: DialoguePracticeMode): string {
  return MODES.find(item => item.id === mode)?.label ?? mode;
}

function delay(ms: number) {
  return new Promise(resolve => window.setTimeout(resolve, ms));
}
