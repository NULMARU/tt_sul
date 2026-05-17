import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  INTERMEDIATE_READING_BY_ID,
  INTERMEDIATE_SOURCE_PROFILE_BY_ID,
} from "@shared/data/intermediate-readings.seed";
import { useStore } from "../lib/store";
import { speak, stopSpeak, waitForTtsIdle } from "../lib/tts";

export function IntermediateReading() {
  const { id } = useParams();
  const nav = useNavigate();
  const lesson = id ? INTERMEDIATE_READING_BY_ID[id] : undefined;
  const source = lesson ? INTERMEDIATE_SOURCE_PROFILE_BY_ID[lesson.sourceProfileId] : undefined;
  const progress = useStore(s => id ? s.intermediateReadingProgress?.[id] : undefined);
  const recordRead = useStore(s => s.recordIntermediateReadingRead);
  const recordListening = useStore(s => s.recordIntermediateListeningPractice);
  const completeReading = useStore(s => s.completeIntermediateReading);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (lesson) recordRead(lesson.id);
  }, [lesson, recordRead]);

  if (!lesson || !source) {
    return <div className="px-6 py-12 text-center text-text-muted">중급 리딩을 찾을 수 없어요.</div>;
  }

  const currentLesson = lesson;
  const currentSource = source;
  const correct = selected === currentLesson.comprehension.answerIndex;

  async function playBody() {
    stopSpeak();
    setPlaying(true);
    recordListening(currentLesson.id);
    await speak(currentLesson.body, { rate: 0.88 });
    setPlaying(false);
  }

  async function playShadowing(sentence: string) {
    recordListening(currentLesson.id, true);
    await speak(sentence, { rate: 0.84 });
  }

  async function complete() {
    await waitForTtsIdle();
    completeReading(currentLesson.id, answered ? correct : undefined);
    nav("/intermediate-readings");
  }

  return (
    <div className="px-5 pt-4 pb-4 flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <button onClick={async () => { await waitForTtsIdle(); nav("/intermediate-readings"); }} className="w-9 h-9 rounded-full hover:bg-surface-2">←</button>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-text-muted">Stage 2 · {currentLesson.difficulty} 리딩</div>
          <h1 className="text-xl font-bold truncate">{currentLesson.emoji} {currentLesson.title}</h1>
        </div>
      </header>

      <section className="rounded-2xl border border-border bg-surface p-4">
        <p className="text-sm text-text-muted">{currentLesson.subtitle}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {currentLesson.skillFocus.map(focus => (
            <span key={focus} className="rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[11px] text-text-muted">
              {focus}
            </span>
          ))}
        </div>
        <div className="mt-3 rounded-xl bg-surface-2 p-3 text-xs text-text-muted">
          <div className="font-semibold text-text">{currentSource.label}</div>
          <div className="mt-1">{currentLesson.sourceUseNoteKo}</div>
          <a href={currentSource.url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-accent-strong font-medium">
            외부 소스 보기 →
          </a>
        </div>
        {progress && (
          <div className="mt-3 text-xs text-text-muted">
            읽음 {progress.read ? "완료" : "대기"} · 듣기 {progress.listenCount}회 · 쉐도잉 {progress.shadowingCount}회
            {progress.completed && " · 학습완료"}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-accent/40 bg-accent/10 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold">1단계 · 먼저 듣고 흐름 잡기</h2>
            <p className="mt-1 text-sm text-text-muted">모르는 단어를 멈춰 찾기보다 전체 흐름을 먼저 잡아보세요.</p>
          </div>
          <button
            onClick={playBody}
            disabled={playing}
            className="shrink-0 rounded-xl bg-accent text-[#2A2522] px-3 py-2 text-sm font-medium disabled:opacity-50"
          >
            {playing ? "재생 중..." : "듣기"}
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold">2단계 · 본문 읽기</h2>
        <p className="en mt-3 whitespace-pre-line leading-7 text-[15px]">{currentLesson.body}</p>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold">3단계 · 핵심 어휘</h2>
        <div className="mt-3 grid gap-2">
          {currentLesson.keyVocabulary.map(item => (
            <div key={item.term} className="rounded-xl bg-surface-2 px-3 py-2">
              <div className="font-semibold en">{item.term}</div>
              <div className="text-xs text-text-muted mt-0.5">{item.ko}</div>
              <div className="text-sm mt-1 en">{item.example}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold">4단계 · 요지 퀴즈</h2>
        <p className="mt-2 text-sm text-text-muted">{currentLesson.gistQuestion}</p>
        <div className="mt-3 grid gap-2">
          {currentLesson.comprehension.choices.map((choice, index) => {
            const isSelected = selected === index;
            const isAnswer = answered && index === currentLesson.comprehension.answerIndex;
            const isWrong = answered && isSelected && !isAnswer;
            return (
              <button
                key={choice}
                onClick={() => {
                  if (!answered) setSelected(index);
                }}
                className={`rounded-xl border px-3 py-2 text-left text-sm ${
                  isAnswer ? "border-success bg-success/10" :
                  isWrong ? "border-danger bg-danger/10" :
                  isSelected ? "border-accent bg-accent/10" :
                  "border-border bg-surface-2"
                }`}
              >
                {choice}
              </button>
            );
          })}
        </div>
        {!answered ? (
          <button
            onClick={() => setAnswered(true)}
            disabled={selected === null}
            className="mt-3 rounded-xl bg-accent text-[#2A2522] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            정답 확인
          </button>
        ) : (
          <div className="mt-3 rounded-xl bg-surface-2 p-3 text-sm">
            <div className={correct ? "text-success font-semibold" : "text-danger font-semibold"}>
              {correct ? "정답입니다." : "다시 읽고 흐름을 확인해보세요."}
            </div>
            <div className="mt-1 text-text-muted">{currentLesson.comprehension.explanationKo}</div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold">5단계 · 쉐도잉 문장</h2>
        <div className="mt-3 grid gap-2">
          {currentLesson.shadowingSentences.map(sentence => (
            <button
              key={sentence}
              onClick={() => playShadowing(sentence)}
              className="rounded-xl bg-surface-2 px-3 py-2 text-left"
            >
              <div className="text-xs text-text-muted">듣고 바로 따라 말하기</div>
              <div className="en text-sm mt-0.5">{sentence}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold">출력 과제</h2>
        <div className="mt-3 grid gap-2 text-sm">
          <div className="rounded-xl bg-surface-2 p-3">
            <div className="text-xs font-semibold text-text-muted">쓰기</div>
            <div className="mt-1">{currentLesson.writingPrompt}</div>
          </div>
          <div className="rounded-xl bg-surface-2 p-3">
            <div className="text-xs font-semibold text-text-muted">말하기</div>
            <div className="mt-1">{currentLesson.speakingPrompt}</div>
          </div>
        </div>
      </section>

      <button
        onClick={complete}
        className="rounded-xl bg-accent text-[#2A2522] px-4 py-3 font-medium"
      >
        중급 리딩 학습완료
      </button>
    </div>
  );
}
