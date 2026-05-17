import type { AdvancedArticle, AdvancedSourceItem } from "@shared/types/schema";

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
  hasIssue?: boolean;
  corrected?: string;
  quizSentence?: string;
  quizAnswer?: string;
  quizAccept?: string[];
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

export interface AdvancedCurrentTopicResult {
  article: AdvancedArticle;
  sourceItems?: AdvancedSourceItem[];
  cachedSources?: boolean;
  modelSource?: "anthropic" | "gemini" | string;
}

export async function generateAdvancedCurrentTopic(payload: {
  topics: string[];
  recentJournal?: string[];
  existingTitles?: string[];
}): Promise<AdvancedCurrentTopicResult | null> {
  return callProxy<AdvancedCurrentTopicResult>("/advanced-current-topic", payload);
}

export interface RoleplayChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function streamRoleplay(
  payload: {
    scene: string;
    role: string;
    phrases: string[];
    messages: RoleplayChatMessage[];
  },
  onDelta: (delta: string) => void,
  signal?: AbortSignal,
): Promise<string | null> {
  if (!PROXY) return null;
  try {
    const res = await fetch(`${PROXY}/roleplay`, {
      method: "POST",
      headers: { "content-type": "application/json", "X-User-Id": userId() },
      body: JSON.stringify(payload),
      signal,
    });
    if (!res.ok || !res.body) return null;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let text = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";

      for (const event of events) {
        for (const line of event.split("\n")) {
          if (!line.startsWith("data:")) continue;
          const raw = line.replace(/^data:\s*/, "").trim();
          if (!raw || raw === "[DONE]") continue;
          try {
            const parsed = JSON.parse(raw);
            const delta = parsed?.delta?.text;
            if (parsed?.type === "content_block_delta" && typeof delta === "string") {
              text += delta;
              onDelta(delta);
            }
          } catch {
            // Ignore malformed stream fragments and keep reading.
          }
        }
      }
    }

    return text.trim() || null;
  } catch {
    return null;
  }
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
