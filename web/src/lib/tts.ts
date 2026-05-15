import { useStore } from "./store";

let activeToken = 0;
let activeResolve: (() => void) | null = null;
let fallbackTimer: number | null = null;
const listeners = new Set<() => void>();

interface TtsSnapshot {
  speaking: boolean;
  currentText: string;
  startedAt: number | null;
}

let snapshot: TtsSnapshot = {
  speaking: false,
  currentText: "",
  startedAt: null,
};

export function ttsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function loadVoices(): SpeechSynthesisVoice[] {
  if (!ttsSupported()) return [];
  return speechSynthesis.getVoices();
}

export function findVoice(lang: "en" | "ko"): SpeechSynthesisVoice | undefined {
  const voices = loadVoices();
  if (lang === "en") {
    return (
      voices.find(v => v.lang.startsWith("en-US") && /Google/i.test(v.name)) ||
      voices.find(v => v.lang.startsWith("en-US") && /Microsoft/i.test(v.name)) ||
      voices.find(v => v.lang.startsWith("en-US")) ||
      voices.find(v => v.lang.startsWith("en"))
    );
  }
  return voices.find(v => v.lang.startsWith("ko-KR")) || voices.find(v => v.lang.startsWith("ko"));
}

export function speak(text: string, opts: { lang?: "en" | "ko"; rate?: number; pitch?: number } = {}): Promise<void> {
  if (!ttsSupported() || !text.trim()) return Promise.resolve();
  stopSpeak();
  const token = ++activeToken;
  setSnapshot({ speaking: true, currentText: text, startedAt: Date.now() });
  useStore.getState().recordTtsPlay(text);

  return new Promise(resolve => {
    activeResolve = resolve;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = opts.lang === "ko" ? "ko-KR" : "en-US";
    u.rate = opts.rate ?? 1;
    u.pitch = opts.pitch ?? 1;
    const v = findVoice(opts.lang ?? "en");
    if (v) u.voice = v;

    const finish = () => finishToken(token);
    u.onend = finish;
    u.onerror = finish;

    fallbackTimer = window.setTimeout(finish, estimateMaxSpeechMs(text, u.rate));
    speechSynthesis.speak(u);
  });
}

export function stopSpeak() {
  if (fallbackTimer) {
    window.clearTimeout(fallbackTimer);
    fallbackTimer = null;
  }
  if (ttsSupported()) speechSynthesis.cancel();
  activeToken += 1;
  activeResolve?.();
  activeResolve = null;
  setSnapshot({ speaking: false, currentText: "", startedAt: null });
}

export function isSpeaking(): boolean {
  return snapshot.speaking || (ttsSupported() && speechSynthesis.speaking);
}

export function waitForTtsIdle(opts: { timeoutMs?: number } = {}): Promise<void> {
  if (!isSpeaking()) return Promise.resolve();
  const timeoutMs = opts.timeoutMs ?? 120_000;
  return new Promise(resolve => {
    let done = false;
    const unsubscribe = subscribeTts(() => {
      if (!isSpeaking() && !done) {
        done = true;
        window.clearTimeout(timer);
        unsubscribe();
        resolve();
      }
    });
    const timer = window.setTimeout(() => {
      if (done) return;
      done = true;
      unsubscribe();
      stopSpeak();
      resolve();
    }, timeoutMs);
  });
}

export function subscribeTts(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getTtsSnapshot(): TtsSnapshot {
  return snapshot;
}

export function vibrate(ms: number | number[] = 15) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try { navigator.vibrate(ms); } catch { /* ignore */ }
  }
}

function finishToken(token: number) {
  if (token !== activeToken) return;
  if (fallbackTimer) {
    window.clearTimeout(fallbackTimer);
    fallbackTimer = null;
  }
  activeResolve?.();
  activeResolve = null;
  setSnapshot({ speaking: false, currentText: "", startedAt: null });
}

function setSnapshot(next: TtsSnapshot) {
  snapshot = next;
  listeners.forEach(listener => listener());
}

function estimateMaxSpeechMs(text: string, rate: number): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const byWords = (words / Math.max(0.5, rate)) * 650;
  return Math.min(180_000, Math.max(6_000, byWords + 3_000));
}
