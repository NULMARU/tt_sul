/**
 * LLM 클라이언트 — Cloudflare Workers 프록시 호출.
 * VITE_LLM_PROXY_URL 미설정 시 LLM 기능은 비활성화(폴백 로컬 응답).
 * GitHub Pages 배포에서는 repository variable LLM_PROXY_URL이 이 값으로 주입된다.
 */
const PROXY = import.meta.env.VITE_LLM_PROXY_URL?.replace(/\/$/, "") ?? "";

function userId(): string {
  let id = localStorage.getItem("sp:uid");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("sp:uid", id);
  }
  return id;
}

async function callProxy<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T | null> {
  if (!PROXY) return null;
  try {
    const res = await fetch(`${PROXY}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json", "X-User-Id": userId() },
      body: JSON.stringify(body),
      signal,
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export interface GradeResult {
  score: number;
  fix: string;
  alt: string;
  why: string;
}

export async function gradeWriting(sentence: string, target?: string): Promise<GradeResult | null> {
  return callProxy<GradeResult>("/grade", { sentence, target });
}

export interface DerivedQuiz {
  sentence: string;
  blank: string;
  answer: string;
  accept?: string[];
}

export async function diaryToQuiz(diary: string): Promise<DerivedQuiz[] | null> {
  const raw = await callProxy<string | DerivedQuiz[]>("/diary-to-quiz", { diary });
  if (!raw) return null;
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw as string) as DerivedQuiz[]; } catch { return null; }
}

export async function translateKoreanNote(text: string): Promise<string | null> {
  const r = await callProxy<{ text: string }>("/translate-ko", { text });
  return r?.text ?? null;
}

export async function rewriteStory(passage: string, level: "easy" | "natural" | "challenge"): Promise<string | null> {
  const r = await callProxy<{ text: string }>("/story-difficulty", { passage, level });
  return r?.text ?? null;
}

export interface ContentSuggestionDraft {
  title?: string;
  rationale?: string;
  retirePhraseIds?: string[];
  reinforcePhraseIds?: string[];
  phrases?: {
    en?: string;
    ko?: string;
    reason?: string;
    exampleEn?: string;
    exampleKo?: string;
    tags?: string[];
  }[];
  story?: {
    title?: string;
    body?: string;
    phraseEns?: string[];
  };
}

export async function suggestContentUpdate(payload: unknown): Promise<ContentSuggestionDraft | null> {
  return callProxy<ContentSuggestionDraft>("/content-suggestions", payload);
}

export function llmAvailable(): boolean { return !!PROXY; }
export function llmProxyUrl(): string { return PROXY; }

export interface HealthResult {
  ok: boolean;
  time?: string;
  model?: string;
  latency_ms?: number;
  error?: string;
}

/**
 * Probe /health endpoint — checks the proxy is reachable.
 * Cheap (no LLM call), use to verify URL config.
 */
export async function probeHealth(): Promise<HealthResult> {
  if (!PROXY) return { ok: false, error: "proxy_url_not_set" };
  try {
    const t0 = Date.now();
    const res = await fetch(`${PROXY}/health`, { headers: { "X-User-Id": userId() } });
    const dt = Date.now() - t0;
    if (!res.ok) return { ok: false, error: `http_${res.status}`, latency_ms: dt };
    const data = (await res.json()) as any;
    return { ok: true, ...data, latency_ms: dt };
  } catch (e: any) {
    return { ok: false, error: String(e?.message ?? e) };
  }
}

/**
 * Probe /test endpoint — makes a real LLM call.
 * Verifies API key is valid and routing works.
 */
export async function probeTest(): Promise<HealthResult & { sample?: string }> {
  if (!PROXY) return { ok: false, error: "proxy_url_not_set" };
  try {
    const t0 = Date.now();
    const res = await fetch(`${PROXY}/test`, { headers: { "X-User-Id": userId() } });
    const dt = Date.now() - t0;
    const data = (await res.json()) as any;
    if (!res.ok) return { ok: false, error: data?.message ?? `http_${res.status}`, latency_ms: dt };
    return { ok: true, ...data, latency_ms: dt };
  } catch (e: any) {
    return { ok: false, error: String(e?.message ?? e) };
  }
}
