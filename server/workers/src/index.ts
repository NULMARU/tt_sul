// ============================================================
// Sulsul LLM Proxy — Cloudflare Workers
// Claude Haiku 4.5 (primary) + Gemini 2.5 Flash-Lite (fallback)
// + KV caching + per-user rate limiting + prompt caching
// ============================================================

export interface Env {
  ANTHROPIC_API_KEY: string;
  GEMINI_API_KEY?: string;
  CACHE: KVNamespace;
  RATE: KVNamespace;
}

const ALLOWED_ORIGINS = [
  "https://nulmaru.github.io",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:4173",
];

const DAILY_CALL_QUOTA = 200;
const MODEL = "claude-haiku-4-5";

// ─── System prompts (cached via Anthropic prompt caching) ───
const SYSTEM_PROMPTS = {
  grade_writing: `You are an English coach for Korean learners.
Grade the user's English sentence on:
- naturalness (0-10)
- one concrete smallest fix
- one richer alternative phrasing
- why (under 25 Korean words)
Respond ONLY as JSON: {"score":number,"fix":string,"alt":string,"why":string}`,

  roleplay: `You play the role of {role} in a {scene} scene.
The user is a Korean English learner.
Reply in natural casual English under 30 words.
Use target phrases when possible: {phrases}.
Steer the conversation to use 1-2 target phrases per turn.
End naturally after 5-7 turns.`,

  diary_to_quiz: `Convert the user's English diary into 3 fill-in-the-blank quizzes.
For each: blank ONE important verb/phrase. Provide answer + 2 acceptable variants.
Keep the rest of the sentence intact.
Respond ONLY as JSON array:
[{"sentence":"...","blank":"___","answer":"...","accept":["...","..."]}]`,

  translate_ko: `Translate the Korean note into natural English for a Korean adult learner's short diary.
Requirements:
- Keep it concise and useful for daily speaking/writing.
- Prefer simple natural English over literal translation.
- Preserve first-person intent when present.
- If the Korean has multiple short ideas, produce 1-3 short English sentences.
Respond ONLY as JSON: {"text":"..."}`,

  story_difficulty: `Rewrite the given English passage at the {level} difficulty:
- easy: short sentences, common verbs, present simple
- natural: relaxed native-speaker tone, light idioms
- challenge: rich vocab, idioms, contractions, varied sentence length
Preserve meaning. Keep within 110% of original length.
Respond ONLY with the rewritten text (no preamble, no JSON wrapper).`,

  content_suggestions: `You are a curriculum editor for a Korean adult English-learning PWA.
Create safe, original, modern everyday English learning content.
Do not quote copyrighted articles or real news text. Do not add slang that is too niche or likely to expire quickly.
Use the learner signals to:
- identify expressions that can be shown less often
- reinforce weak areas
- suggest 3-5 practical expressions and one short original reading passage
Respond ONLY as JSON:
{"title":"...","rationale":"...","retirePhraseIds":["..."],"reinforcePhraseIds":["..."],"phrases":[{"en":"...","ko":"...","reason":"...","exampleEn":"...","exampleKo":"...","tags":["..."]}],"story":{"title":"...","body":"...","phraseEns":["..."]}}`,
} as const;

// ─── Helpers ──────────────────────────────────────────────
function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && isAllowedOrigin(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-User-Id",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function isAllowedOrigin(origin: string): boolean {
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  try {
    const url = new URL(origin);
    const localHost = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    return localHost && (url.protocol === "http:" || url.protocol === "https:");
  } catch {
    return false;
  }
}

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

async function checkAndIncrementRate(env: Env, userId: string): Promise<{ ok: boolean; calls: number }> {
  const today = new Date().toISOString().slice(0, 10);
  const key = `rl:${userId}:${today}`;
  const current = parseInt((await env.RATE.get(key)) ?? "0", 10);
  if (current >= DAILY_CALL_QUOTA) return { ok: false, calls: current };
  await env.RATE.put(key, String(current + 1), { expirationTtl: 86_400 });
  return { ok: true, calls: current + 1 };
}

async function callAnthropic(env: Env, body: unknown): Promise<Response> {
  return fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

async function callGemini(env: Env, prompt: string): Promise<{ text: string; ok: boolean }> {
  if (!env.GEMINI_API_KEY) return { text: "", ok: false };
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${env.GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
    }),
  });
  if (!res.ok) return { text: "", ok: false };
  const data = (await res.json()) as any;
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return { text, ok: true };
}

function json(obj: unknown, status: number, origin: string | null, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json", ...corsHeaders(origin), ...extra },
  });
}

function validateInput<T>(value: unknown, validator: (v: any) => v is T, errMsg: string): T | Response {
  if (!validator(value as any)) {
    return json({ error: "invalid_input", message: errMsg }, 400, null);
  }
  return value as T;
}

function normalizeJsonText(text: string, fallback: string): string {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const starts = [trimmed.indexOf("{"), trimmed.indexOf("[")].filter(i => i >= 0);
  const start = starts.length ? Math.min(...starts) : -1;
  if (start < 0) return fallback;
  const endBrace = trimmed.lastIndexOf("}");
  const endBracket = trimmed.lastIndexOf("]");
  const end = Math.max(endBrace, endBracket);
  if (end < start) return fallback;
  const candidate = trimmed.slice(start, end + 1);
  try {
    return JSON.stringify(JSON.parse(candidate));
  } catch {
    return fallback;
  }
}

// ─── Route handlers ──────────────────────────────────────
async function handleGrade(req: Request, env: Env, origin: string | null): Promise<Response> {
  let body: any;
  try { body = await req.json(); }
  catch { return json({ error: "invalid_json" }, 400, origin); }

  const sentence = String(body.sentence ?? "").trim();
  const target = body.target ? String(body.target) : "";
  if (!sentence) return json({ error: "missing_sentence" }, 400, origin);
  if (sentence.length > 600) return json({ error: "sentence_too_long", limit: 600 }, 400, origin);

  const cacheKey = "grade:" + (await sha256Hex(`${target}|${sentence}`));
  const cached = await env.CACHE.get(cacheKey);
  if (cached) {
    return new Response(normalizeJsonText(cached, "{}"), {
      headers: { "content-type": "application/json", "x-cache": "hit", ...corsHeaders(origin) },
    });
  }

  const reqBody = {
    model: MODEL,
    max_tokens: 250,
    system: [
      { type: "text", text: SYSTEM_PROMPTS.grade_writing, cache_control: { type: "ephemeral" } },
    ],
    messages: [
      { role: "user", content: `Target meaning: ${target || "free writing"}\nUser sentence: ${sentence}` },
    ],
  };

  const res = await callAnthropic(env, reqBody);
  if (!res.ok) {
    const fb = await callGemini(env, `${SYSTEM_PROMPTS.grade_writing}\n\nTarget: ${target}\nSentence: ${sentence}`);
    if (fb.ok) {
      return new Response(normalizeJsonText(fb.text, "{}"), {
        headers: { "content-type": "application/json", "x-source": "gemini", ...corsHeaders(origin) },
      });
    }
    return json({ error: "llm_unavailable", anthropic_status: res.status }, 502, origin);
  }

  const data = (await res.json()) as any;
  const text = normalizeJsonText(data?.content?.[0]?.text ?? "{}", "{}");
  await env.CACHE.put(cacheKey, text, { expirationTtl: 86_400 });
  return new Response(text, {
    headers: { "content-type": "application/json", "x-cache": "miss", ...corsHeaders(origin) },
  });
}

async function handleRoleplay(req: Request, env: Env, origin: string | null): Promise<Response> {
  let body: any;
  try { body = await req.json(); }
  catch { return json({ error: "invalid_json" }, 400, origin); }

  const messages = Array.isArray(body.messages) ? body.messages : null;
  if (!messages || messages.length === 0) return json({ error: "missing_messages" }, 400, origin);
  if (messages.length > 14) return json({ error: "too_many_turns", limit: 14 }, 400, origin);

  const phrases = Array.isArray(body.phrases) ? body.phrases : [];
  const scene = String(body.scene ?? "casual chat");
  const role = String(body.role ?? "friendly conversation partner");

  const sys = SYSTEM_PROMPTS.roleplay
    .replace("{role}", role)
    .replace("{scene}", scene)
    .replace("{phrases}", phrases.join(", ") || "(none)");

  const reqBody = {
    model: MODEL,
    max_tokens: 150,
    system: [{ type: "text", text: sys, cache_control: { type: "ephemeral" } }],
    messages,
    stream: true,
  };

  const res = await callAnthropic(env, reqBody);
  if (!res.ok || !res.body) {
    return json({ error: "anthropic_error", status: res.status }, 502, origin);
  }

  return new Response(res.body, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
      ...corsHeaders(origin),
    },
  });
}

async function handleDiaryToQuiz(req: Request, env: Env, origin: string | null): Promise<Response> {
  let body: any;
  try { body = await req.json(); }
  catch { return json({ error: "invalid_json" }, 400, origin); }

  const diary = String(body.diary ?? "").trim();
  if (!diary) return json({ error: "missing_diary" }, 400, origin);
  if (diary.length > 800) return json({ error: "diary_too_long", limit: 800 }, 400, origin);

  const cacheKey = "d2q:" + (await sha256Hex(diary));
  const cached = await env.CACHE.get(cacheKey);
  if (cached) {
    return new Response(normalizeJsonText(cached, "[]"), {
      headers: { "content-type": "application/json", "x-cache": "hit", ...corsHeaders(origin) },
    });
  }

  const reqBody = {
    model: MODEL,
    max_tokens: 500,
    system: [
      { type: "text", text: SYSTEM_PROMPTS.diary_to_quiz, cache_control: { type: "ephemeral" } },
    ],
    messages: [{ role: "user", content: diary }],
  };

  const res = await callAnthropic(env, reqBody);
  if (!res.ok) return json({ error: "anthropic_error", status: res.status }, 502, origin);
  const data = (await res.json()) as any;
  const text = normalizeJsonText(data?.content?.[0]?.text ?? "[]", "[]");
  await env.CACHE.put(cacheKey, text, { expirationTtl: 7 * 86_400 });
  return new Response(text, {
    headers: { "content-type": "application/json", ...corsHeaders(origin) },
  });
}

async function handleTranslateKo(req: Request, env: Env, origin: string | null): Promise<Response> {
  let body: any;
  try { body = await req.json(); }
  catch { return json({ error: "invalid_json" }, 400, origin); }

  const text = String(body.text ?? "").trim();
  if (!text) return json({ error: "missing_text" }, 400, origin);
  if (text.length > 600) return json({ error: "text_too_long", limit: 600 }, 400, origin);

  const cacheKey = "ko2en:" + (await sha256Hex(text));
  const cached = await env.CACHE.get(cacheKey);
  if (cached) {
    return new Response(normalizeJsonText(cached, "{}"), {
      headers: { "content-type": "application/json", "x-cache": "hit", ...corsHeaders(origin) },
    });
  }

  const reqBody = {
    model: MODEL,
    max_tokens: 250,
    system: [{ type: "text", text: SYSTEM_PROMPTS.translate_ko, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: text }],
  };

  const res = await callAnthropic(env, reqBody);
  if (!res.ok) {
    const fb = await callGemini(env, `${SYSTEM_PROMPTS.translate_ko}\n\nKorean note:\n${text}`);
    if (fb.ok) {
      return new Response(normalizeJsonText(fb.text, "{}"), {
        headers: { "content-type": "application/json", "x-source": "gemini", ...corsHeaders(origin) },
      });
    }
    return json({ error: "llm_unavailable", anthropic_status: res.status }, 502, origin);
  }

  const data = (await res.json()) as any;
  const out = normalizeJsonText(data?.content?.[0]?.text ?? "{}", "{}");
  await env.CACHE.put(cacheKey, out, { expirationTtl: 7 * 86_400 });
  return new Response(out, {
    headers: { "content-type": "application/json", "x-cache": "miss", ...corsHeaders(origin) },
  });
}

async function handleStoryDifficulty(req: Request, env: Env, origin: string | null): Promise<Response> {
  let body: any;
  try { body = await req.json(); }
  catch { return json({ error: "invalid_json" }, 400, origin); }

  const passage = String(body.passage ?? "").trim();
  const level = String(body.level ?? "");
  if (!passage) return json({ error: "missing_passage" }, 400, origin);
  if (passage.length > 1500) return json({ error: "passage_too_long", limit: 1500 }, 400, origin);
  if (!["easy", "natural", "challenge"].includes(level)) {
    return json({ error: "invalid_level", allowed: ["easy", "natural", "challenge"] }, 400, origin);
  }

  const cacheKey = `story:${level}:` + (await sha256Hex(passage));
  const cached = await env.CACHE.get(cacheKey);
  if (cached) {
    return new Response(JSON.stringify({ text: cached, cached: true }), {
      headers: { "content-type": "application/json", "x-cache": "hit", ...corsHeaders(origin) },
    });
  }

  const sys = SYSTEM_PROMPTS.story_difficulty.replace("{level}", level);
  const reqBody = {
    model: MODEL,
    max_tokens: 600,
    system: [{ type: "text", text: sys, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: passage }],
  };

  const res = await callAnthropic(env, reqBody);
  if (!res.ok) return json({ error: "anthropic_error", status: res.status }, 502, origin);
  const data = (await res.json()) as any;
  const text = data?.content?.[0]?.text ?? "";
  await env.CACHE.put(cacheKey, text, { expirationTtl: 30 * 86_400 });
  return new Response(JSON.stringify({ text, cached: false }), {
    headers: { "content-type": "application/json", "x-cache": "miss", ...corsHeaders(origin) },
  });
}

async function handleContentSuggestions(req: Request, env: Env, origin: string | null): Promise<Response> {
  let body: any;
  try { body = await req.json(); }
  catch { return json({ error: "invalid_json" }, 400, origin); }

  const weakPhrases = Array.isArray(body.weakPhrases) ? body.weakPhrases.slice(0, 12).map(String) : [];
  const masteredPhrases = Array.isArray(body.masteredPhrases) ? body.masteredPhrases.slice(0, 12).map(String) : [];
  const existingCustomPhrases = Array.isArray(body.existingCustomPhrases) ? body.existingCustomPhrases.slice(0, 20).map(String) : [];
  const recentMistakes = Array.isArray(body.recentMistakes) ? body.recentMistakes.slice(0, 12).map(String) : [];

  const payload = JSON.stringify({ weakPhrases, masteredPhrases, existingCustomPhrases, recentMistakes });
  if (payload.length > 5000) return json({ error: "payload_too_long", limit: 5000 }, 400, origin);

  const cacheKey = "content:" + (await sha256Hex(payload));
  const cached = await env.CACHE.get(cacheKey);
  if (cached) {
    return new Response(normalizeJsonText(cached, "{}"), {
      headers: { "content-type": "application/json", "x-cache": "hit", ...corsHeaders(origin) },
    });
  }

  const reqBody = {
    model: MODEL,
    max_tokens: 900,
    system: [{ type: "text", text: SYSTEM_PROMPTS.content_suggestions, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: payload }],
  };

  const res = await callAnthropic(env, reqBody);
  if (!res.ok) {
    const fb = await callGemini(env, `${SYSTEM_PROMPTS.content_suggestions}\n\nLearner signals JSON:\n${payload}`);
    if (fb.ok) {
      return new Response(normalizeJsonText(fb.text, "{}"), {
        headers: { "content-type": "application/json", "x-source": "gemini", ...corsHeaders(origin) },
      });
    }
    return json({ error: "llm_unavailable", anthropic_status: res.status }, 502, origin);
  }

  const data = (await res.json()) as any;
  const text = normalizeJsonText(data?.content?.[0]?.text ?? "{}", "{}");
  await env.CACHE.put(cacheKey, text, { expirationTtl: 7 * 86_400 });
  return new Response(text, {
    headers: { "content-type": "application/json", "x-cache": "miss", ...corsHeaders(origin) },
  });
}

// ─── /test endpoint — minimum LLM probe ──────────────────
async function handleTest(env: Env, origin: string | null): Promise<Response> {
  const t0 = Date.now();
  const reqBody = {
    model: MODEL,
    max_tokens: 30,
    system: [{ type: "text", text: "Respond with exactly one short English sentence." }],
    messages: [{ role: "user", content: "Say hello." }],
  };
  const res = await callAnthropic(env, reqBody);
  const dt = Date.now() - t0;
  if (!res.ok) {
    return json({
      ok: false,
      anthropic_status: res.status,
      message: res.status === 401 ? "Invalid ANTHROPIC_API_KEY" : "Anthropic API error",
      latency_ms: dt,
    }, 502, origin);
  }
  const data = (await res.json()) as any;
  const text = data?.content?.[0]?.text ?? "";
  return json({
    ok: true,
    model: MODEL,
    sample: text,
    latency_ms: dt,
  }, 200, origin);
}

// ─── Entry ──────────────────────────────────────────────
export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const origin = req.headers.get("Origin");
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(origin) });
    }

    const url = new URL(req.url);

    // ─── Public endpoints (no rate-limit) ───
    if (url.pathname === "/health") {
      return json({ ok: true, time: new Date().toISOString(), model: MODEL }, 200, origin);
    }

    // ─── Validate API key exists ───
    if (!env.ANTHROPIC_API_KEY) {
      return json({
        error: "anthropic_key_missing",
        message: "ANTHROPIC_API_KEY not set. Run: npx wrangler secret put ANTHROPIC_API_KEY",
      }, 500, origin);
    }

    const userId = req.headers.get("X-User-Id") || "anon";
    const rate = await checkAndIncrementRate(env, userId);
    if (!rate.ok) {
      return json({ error: "daily_quota_exceeded", quota: DAILY_CALL_QUOTA, used: rate.calls }, 429, origin);
    }

    try {
      if (url.pathname === "/test" && req.method === "GET") {
        return await handleTest(env, origin);
      }
      if (url.pathname === "/grade" && req.method === "POST") {
        return await handleGrade(req, env, origin);
      }
      if (url.pathname === "/roleplay" && req.method === "POST") {
        return await handleRoleplay(req, env, origin);
      }
      if (url.pathname === "/diary-to-quiz" && req.method === "POST") {
        return await handleDiaryToQuiz(req, env, origin);
      }
      if (url.pathname === "/translate-ko" && req.method === "POST") {
        return await handleTranslateKo(req, env, origin);
      }
      if (url.pathname === "/story-difficulty" && req.method === "POST") {
        return await handleStoryDifficulty(req, env, origin);
      }
      if (url.pathname === "/content-suggestions" && req.method === "POST") {
        return await handleContentSuggestions(req, env, origin);
      }
    } catch (e: any) {
      return json({ error: "server_error", message: String(e?.message ?? e) }, 500, origin);
    }

    return json({ error: "not_found", path: url.pathname }, 404, origin);
  },
};
