let cancelTimer: number | null = null;

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
  return new Promise(resolve => {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = opts.lang === "ko" ? "ko-KR" : "en-US";
    u.rate = opts.rate ?? 1;
    u.pitch = opts.pitch ?? 1;
    const v = findVoice(opts.lang ?? "en");
    if (v) u.voice = v;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    speechSynthesis.speak(u);
  });
}

export function stopSpeak() {
  if (ttsSupported()) speechSynthesis.cancel();
  if (cancelTimer) { window.clearTimeout(cancelTimer); cancelTimer = null; }
}

export function vibrate(ms: number | number[] = 15) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try { navigator.vibrate(ms); } catch { /* ignore */ }
  }
}
