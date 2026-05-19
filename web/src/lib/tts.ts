import { useStore } from "./store";
import { stopSupertonicAudio, trySpeakWithSupertonic } from "./supertonic-tts";
import type { TtsProvider } from "@shared/types/schema";

let activeToken = 0;
let activeResolve: (() => void) | null = null;
let fallbackTimer: number | null = null;
const listeners = new Set<() => void>();

interface TtsSnapshot {
  speaking: boolean;
  currentText: string;
  startedAt: number | null;
}

export interface SpeakOptions {
  lang?: "en" | "ko";
  rate?: number;
  pitch?: number;
  provider?: TtsProvider;
  onStart?: () => void;
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

export async function speak(text: string, opts: SpeakOptions = {}): Promise<void> {
  if (!text.trim()) return Promise.resolve();
  stopSpeak();
  const token = ++activeToken;
  setSnapshot({ speaking: true, currentText: text, startedAt: Date.now() });
  useStore.getState().recordTtsPlay(text);

  if (effectiveTtsProvider(opts) === "supertonic") {
    const supertonic = await trySpeakWithSupertonic(text, opts);
    if (supertonic.started) {
      finishToken(token);
      return;
    }
  }

  if (!ttsSupported()) {
    finishToken(token);
    return Promise.resolve();
  }

  return new Promise(resolve => {
    activeResolve = resolve;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = opts.lang === "ko" ? "ko-KR" : "en-US";
    u.rate = opts.rate ?? 1;
    u.pitch = opts.pitch ?? 1;
    const v = findVoice(opts.lang ?? "en");
    if (v) u.voice = v;

    const finish = () => finishToken(token);
    u.onstart = () => opts.onStart?.();
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
  stopSupertonicAudio();
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

function effectiveTtsProvider(opts: SpeakOptions): TtsProvider {
  if (opts.provider) return opts.provider;
  const state = useStore.getState();
  if ((state.currentCourseLevel ?? "beginner") === "beginner") return "system";
  return state.prefs.ttsProvider ?? "system";
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
