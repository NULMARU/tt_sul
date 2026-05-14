/**
 * LLM 클라이언트 — Cloudflare Workers 프록시 호출.
 * VITE_LLM_PROXY_URL 미설정 시 LLM 기능은 비활성화(폴백 로컬 응답).
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

export async function rewriteStory(passage: string, level: "easy" | "natural" | "challenge"): Promise<string | null> {
  const r = await callProxy<{ text: string }>("/story-difficulty", { passage, level });
  return r?.text ?? null;
}

export function llmAvailable(): boolean { return !!PROXY; }
