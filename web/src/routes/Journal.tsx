import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../lib/store";
import { diaryToQuiz, llmAvailable, translateKoreanNote } from "../lib/llm";

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

export function Journal() {
  const nav = useNavigate();
  const journal = useStore(s => s.journal);
  const add = useStore(s => s.addJournal);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [koText, setKoText] = useState("");
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState("");
  const [listening, setListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [speechError, setSpeechError] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const speechSupported = !!speechRecognitionCtor();

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
        오늘 학습한 표현으로 한 문장을 영어로 써보세요. {llmAvailable() ? "AI가 다음날 빈칸 퀴즈로 변환해줍니다." : "(LLM 프록시 미설정 — 텍스트만 저장됨)"}
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
        onChange={e => setText(e.target.value)}
        rows={4}
        placeholder="English scratchpad: Today I... "
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
