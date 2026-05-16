import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../lib/store";
import { diaryToQuiz, gradeWriting, llmAvailable, translateKoreanNote } from "../lib/llm";
import type { GradeResult } from "../lib/llm";
import type { WritingMistakeNote } from "@shared/types/schema";

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

type CorrectionDraft = {
  original: string;
  corrected: string;
  score?: number;
  why?: string;
  alt?: string;
  quizSentence: string;
  quizAnswer: string;
  quizAccept?: string[];
};

export function Journal() {
  const nav = useNavigate();
  const journal = useStore(s => s.journal);
  const writingMistakes = useStore(s => s.writingMistakes ?? []);
  const add = useStore(s => s.addJournal);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [pendingCorrection, setPendingCorrection] = useState<CorrectionDraft | null>(null);
  const [koText, setKoText] = useState("");
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState("");
  const [listening, setListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [speechError, setSpeechError] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const speechSupported = !!speechRecognitionCtor();

  async function save(finalText?: string, writingMistake?: WritingMistakeNote) {
    const entryText = (finalText ?? text).trim();
    if (!entryText) return;
    setLoading(true);
    setSaveError("");
    let derivedIds: string[] | undefined;
    let derivedQuizzes: Array<{ id: string; sentence: string; answer: string; accept?: string[] }> | undefined;
    if (llmAvailable()) {
      const quizzes = await diaryToQuiz(entryText);
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
    add(new Date().getDate(), entryText, derivedIds, derivedQuizzes, writingMistake);
    setText("");
    setPendingCorrection(null);
    setLoading(false);
  }

  async function checkAndSave() {
    if (pendingCorrection) {
      await save(pendingCorrection.corrected, makeWritingMistake(pendingCorrection));
      return;
    }

    const original = text.trim();
    if (!original) return;
    if (!llmAvailable()) {
      await save(original);
      return;
    }

    setLoading(true);
    setSaveError("");
    const grade = await gradeWriting(original, "journal-save-v2");
    setLoading(false);
    if (!grade) {
      setSaveError("문장검사를 완료하지 못해 원문 그대로 저장했어요.");
      await save(original);
      return;
    }

    const correction = buildCorrectionDraft(original, grade);
    if (!correction) {
      await save(original);
      return;
    }

    setPendingCorrection(correction);
    setText(formatCorrectionPreview(correction));
  }

  async function addKoreanTranslation() {
    if (!koText.trim()) return;
    if (!llmAvailable()) {
      setTranslateError("LLM 프록시가 설정되어야 한국어 번역을 사용할 수 있어요.");
      return;
    }
    setTranslating(true);
    setTranslateError("");
    const translated = await translateKoreanNote(koText);
    if (translated?.trim()) {
      setText(prev => appendText(prev, translated.trim()));
      setKoText("");
    } else {
      setTranslateError("번역하지 못했어요. 잠시 후 다시 시도해주세요.");
    }
    setTranslating(false);
  }

  function toggleDictation() {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      setInterimText("");
      return;
    }

    const Ctor = speechRecognitionCtor();
    if (!Ctor) {
      setSpeechError("이 브라우저는 음성 받아쓰기를 지원하지 않아요. 키보드 입력을 사용해주세요.");
      return;
    }

    const recognition = new Ctor();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = event => {
      let finalText = "";
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const transcript = event.results[i]?.[0]?.transcript ?? "";
        if (event.results[i]?.isFinal) finalText += transcript;
        else interim += transcript;
      }
      if (finalText.trim()) {
        setText(prev => appendDictation(prev, finalText.trim()));
        setInterimText("");
      } else {
        setInterimText(interim.trim());
      }
    };
    recognition.onerror = event => {
      setSpeechError(event?.error === "not-allowed" ? "마이크 권한이 필요해요." : "받아쓰기를 계속할 수 없어요. 다시 시도해주세요.");
      setListening(false);
    };
    recognition.onend = () => {
      setListening(false);
      setInterimText("");
    };

    try {
      setSpeechError("");
      setInterimText("");
      recognition.start();
      setListening(true);
    } catch {
      setSpeechError("받아쓰기를 시작하지 못했어요. 잠시 후 다시 시도해주세요.");
      setListening(false);
    }
  }

  return (
    <div className="px-5 pt-6 pb-4 flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <button onClick={() => nav("/")} className="w-9 h-9 rounded-full hover:bg-surface-2">←</button>
        <h1 className="text-xl font-bold">📓 낙서장</h1>
      </header>

      <p className="text-xs text-text-muted">
        낙서장은 오늘 말하고 싶은 내용을 영어 학습자료로 바꾸는 공간입니다. 영어로 직접 쓰거나 마이크로 받아쓰고,
        한국어 메모는 영어로 번역해 추가할 수 있어요. 저장할 때 AI가 문법과 단어를 확인하고, 틀린 문장은 오답노트와 복습 퀴즈로 자동 등록됩니다.
        {!llmAvailable() && " (LLM 프록시 미설정 — 텍스트만 저장됨)"}
      </p>

      <div className="rounded-xl border border-border bg-surface p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">영어 받아쓰기</div>
            <div className="text-xs text-text-muted">마이크로 말하면 아래 낙서장에 자동 입력됩니다.</div>
          </div>
          <button
            onClick={toggleDictation}
            disabled={!speechSupported}
            className={`rounded-xl px-3 py-2 text-sm font-medium disabled:opacity-40 ${listening ? "bg-error text-white" : "bg-accent text-[#2A2522]"}`}
          >
            {listening ? "중지" : "시작"}
          </button>
        </div>
        {!speechSupported && (
          <div className="text-xs text-text-muted">
            현재 브라우저는 받아쓰기를 지원하지 않아요. Chrome/Safari 등 지원 브라우저에서 사용할 수 있습니다.
          </div>
        )}
        {interimText && <div className="text-xs text-text-muted en">듣는 중: {interimText}</div>}
        {speechError && <div className="text-xs text-error">{speechError}</div>}
      </div>

      <div className="rounded-xl border border-border bg-surface p-3 flex flex-col gap-2">
        <div>
          <div className="text-sm font-semibold">한국어로 먼저 쓰기</div>
          <div className="text-xs text-text-muted">한국어로 생각을 적고 `영어로 추가`를 누르면 아래 영어 낙서장에 번역문이 이어 붙습니다.</div>
        </div>
        <textarea
          value={koText}
          onChange={e => setKoText(e.target.value)}
          rows={3}
          placeholder="예: 오늘은 너무 피곤해서 커피를 두 잔 마셨다. 이 내용을 영어로 추가해보세요."
          className="rounded-xl border-2 border-border bg-surface-2 p-3 outline-none focus:border-accent"
        />
        <button
          onClick={addKoreanTranslation}
          disabled={!koText.trim() || translating || !llmAvailable()}
          className="rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm font-medium disabled:opacity-40"
        >
          {translating ? "번역 중…" : "영어로 추가"}
        </button>
        {!llmAvailable() && <div className="text-xs text-text-muted">LLM 프록시가 설정되면 한국어 번역을 사용할 수 있어요.</div>}
        {translateError && <div className="text-xs text-error">{translateError}</div>}
      </div>

      <textarea
        value={text}
        onChange={e => {
          setText(e.target.value);
          setPendingCorrection(null);
          setSaveError("");
        }}
        rows={4}
        readOnly={!!pendingCorrection}
        placeholder="English scratchpad: Today I... "
        className={`en rounded-xl border-2 border-border bg-surface-2 p-3 outline-none focus:border-accent ${pendingCorrection ? "cursor-default" : ""}`}
      />
      {pendingCorrection && (
        <div className="rounded-xl border border-accent/40 bg-accent/10 p-3 text-sm flex flex-col gap-2">
          <div className="font-semibold text-accent-strong">문장검사 결과를 확인해주세요.</div>
          <div className="text-text-muted">
            위 영어창에 수정 전/후를 표시했어요. 체크완료 후 저장하면 수정문은 낙서장에 저장되고, 원래 오류 문장은 오답노트 퀴즈로 복습에 들어갑니다.
          </div>
          {pendingCorrection.why && <div className="text-text-muted">{pendingCorrection.why}</div>}
          {pendingCorrection.alt && <div>대안 표현: <span className="en">{pendingCorrection.alt}</span></div>}
          <button
            onClick={() => {
              setText(pendingCorrection.original);
              setPendingCorrection(null);
            }}
            className="self-start rounded-lg border border-border bg-surface px-3 py-1.5 text-xs"
          >
            다시 쓰기
          </button>
        </div>
      )}
      {saveError && <div className="text-xs text-error">{saveError}</div>}
      <button onClick={checkAndSave} disabled={!text.trim() || loading} className="rounded-xl bg-accent text-[#2A2522] py-2.5 font-medium disabled:opacity-40">
        {loading ? "처리 중…" : pendingCorrection ? "체크완료 후 저장" : llmAvailable() ? "문장검사 후 저장" : "저장"}
      </button>

      <section className="flex flex-col gap-2 mt-2">
        <h2 className="text-sm text-text-muted">이전 기록</h2>
        {journal.length === 0 && <p className="text-text-muted text-sm">아직 기록이 없어요.</p>}
        {[...journal].reverse().map(j => {
          const mistake = j.writingMistakeId ? writingMistakes.find(m => m.id === j.writingMistakeId) : undefined;
          return (
            <div key={j.id} className="rounded-xl bg-surface border border-border p-3">
              <div className="text-xs text-text-muted">{new Date(j.date).toLocaleDateString("ko-KR")}</div>
              <p className="en text-sm mt-1">{j.text}</p>
              {j.derivedQuizzes && j.derivedQuizzes.length > 0 && (
                <div className="text-xs text-accent-strong mt-1">📝 빈칸 퀴즈 {j.derivedQuizzes.length}개 생성됨 · 복습에서 출제</div>
              )}
              {mistake && (
                <div className="text-xs mt-1 text-text-muted">
                  오답노트: {mistake.status === "completed" ? "학습완료" : "복습 대기"} · <span className="en">{mistake.original}</span>
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}

function speechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function appendDictation(prev: string, addition: string): string {
  return appendText(prev, addition);
}

function appendText(prev: string, addition: string): string {
  if (!prev.trim()) return addition;
  return /\s$/.test(prev) ? `${prev}${addition}` : `${prev} ${addition}`;
}

function buildCorrectionDraft(original: string, grade: GradeResult): CorrectionDraft | null {
  const corrected = cleanCorrection(grade.corrected ?? grade.fix ?? "");
  if (!corrected || isNoChangeText(corrected)) return null;
  const changed = normalizeEnglish(original) !== normalizeEnglish(corrected);
  const hasIssue = grade.hasIssue ?? (changed && (grade.score ?? 10) < 9.5);
  if (!hasIssue || !changed) return null;

  const quizAnswer = cleanCorrection(grade.quizAnswer ?? "") || corrected;
  const quizSentence = ensureQuizSentence(grade.quizSentence, original, corrected, quizAnswer);
  return {
    original,
    corrected,
    score: grade.score,
    why: grade.why,
    alt: cleanCorrection(grade.alt ?? ""),
    quizSentence,
    quizAnswer,
    quizAccept: [],
  };
}

function makeWritingMistake(correction: CorrectionDraft): WritingMistakeNote {
  const stamp = Date.now();
  return {
    id: `wm-${stamp}`,
    createdAt: new Date().toISOString(),
    original: correction.original,
    corrected: correction.corrected,
    explanation: correction.why,
    score: correction.score,
    quizId: `wmq-${stamp}`,
    quizSentence: correction.quizSentence,
    quizAnswer: correction.quizAnswer,
    quizAccept: correction.quizAccept,
    status: "learning",
  };
}

function formatCorrectionPreview(correction: CorrectionDraft): string {
  return `Before:\n${correction.original}\n\nAfter:\n${correction.corrected}`;
}

function ensureQuizSentence(candidate: string | undefined, original: string, corrected: string, answer: string): string {
  const clean = cleanCorrection(candidate ?? "");
  if (clean.includes("___")) return clean;
  if (answer && corrected.includes(answer)) return corrected.replace(answer, "___");
  return `Correct this sentence:\n${original}\n\n___`;
}

function cleanCorrection(value: string): string {
  return value.trim().replace(/^["']|["']$/g, "");
}

function normalizeEnglish(value: string): string {
  return value.toLowerCase().replace(/[“”]/g, "\"").replace(/[‘’]/g, "'").replace(/\s+/g, " ").trim();
}

function isNoChangeText(value: string): boolean {
  return /^(no change|no correction|looks good|correct as is|same as original)/i.test(value.trim());
}
