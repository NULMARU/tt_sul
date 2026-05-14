// ============================================================
// Sulsul LLM Proxy — Cloudflare Workers
// Claude Haiku 4.5 (primary) + Gemini 2.5 Flash-Lite (fallback)
// + KV caching + per-user rate limiting + prompt caching
// ============================================================

export interface Env {
  ANTHROPIC_API_KEY: string;
  GEMINI_API_KEY: string;
  CACHE: KVNamespace;
  RATE: KVNamespace;
}

const ALLOWED_ORIGINS = [
  "https://nulmaru.github.io",
  "http://localhost:5173",
  "http://localhost:4173",
];

const DAILY_TOKEN_QUOTA = 50_000;
const DAILY_CALL_QUOTA = 200;

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

  story_difficulty: `Rewrite the given English passage at the {level} difficulty:
- easy: short sentences, common verbs, present simple
- natural: relaxed native-speaker tone, light idioms
- challenge: rich vocab, idioms, contractions, varied sentence length
Preserve meaning. Keep within 110% of original length.
Respond ONLY with the rewritten text.`,
} as const;

// ─── Helpers ──────────────────────────────────────────────
function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-User-Id",
    "Access-Control-Max-Age": "86400",
  };
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

// ─── Route handlers ──────────────────────────────────────
async function handleGrade(req: Request, env: Env, origin: string | null): Promise<Response> {
  const { sentence, target } = await req.json<{ sentence: string; target?: string }>();
  if (!sentence || sentence.length > 600) {
    return json({ error: "invalid_input" }, 400, origin);
  }

  const cacheKey = "grade:" + (await sha256Hex(`${target ?? ""}|${sentence}`));
  const cached = await env.CACHE.get(cacheKey);
  if (cached) {
    return new Response(cached, {
      headers: { "content-type": "application/json", "x-cache": "hit", ...corsHeaders(origin) },
    });
  }

  const body = {
    model: "claude-haiku-4-5",
    max_tokens: 250,
    system: [
      { type: "text", text: SYSTEM_PROMPTS.grade_writing, cache_control: { type: "ephemeral" } },
    ],
    messages: [
      { role: "user", content: `Target meaning: ${target ?? "free writing"}\nUser sentence: ${sentence}` },
    ],
  };

  const res = await callAnthropic(env, body);
  if (!res.ok) {
    // Fallback to Gemini
    const fb = await callGemini(env, `${SYSTEM_PROMPTS.grade_writing}\n\nTarget: ${target}\nSentence: ${sentence}`);
    return new Response(fb.text || "{}", {
      headers: { "content-type": "application/json", "x-source": "gemini", ...corsHeaders(origin) },
    });
  }

  const data = (await res.json()) as any;
  const text = data?.content?.[0]?.text ?? "{}";
  await env.CACHE.put(cacheKey, text, { expirationTtl: 86_400 });
  return new Response(text, {
    headers: { "content-type": "application/json", "x-cache": "miss", ...corsHeaders(origin) },
  });
}

async function handleRoleplay(req: Request, env: Env, origin: string | null): Promise<Response> {
  const { messages, phrases, scene, role } = await req.json<{
    messages: { role: "user" | "assistant"; content: string }[];
    phrases?: string[];
    scene?: string;
    role?: string;
  }>();

  const sys = SYSTEM_PROMPTS.roleplay
    .replace("{role}", role ?? "friendly conversation partner")
    .replace("{scene}", scene ?? "casual chat")
    .replace("{phrases}", (phrases ?? []).join(", ") || "(none)");

  const body = {
    model: "claude-haiku-4-5",
    max_tokens: 150,
    system: [{ type: "text", text: sys, cache_control: { type: "ephemeral" } }],
    messages,
    stream: true,
  };

  const res = await callAnthropic(env, body);
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
  const { diary } = await req.json<{ diary: string }>();
  if (!diary || diary.length > 800) return json({ error: "invalid_input" }, 400, origin);

  const cacheKey = "d2q:" + (await sha256Hex(diary));
  const cached = await env.CACHE.get(cacheKey);
  if (cached) {
    return new Response(cached, {
      headers: { "content-type": "application/json", "x-cache": "hit", ...corsHeaders(origin) },
    });
  }

  const body = {
    model: "claude-haiku-4-5",
    max_tokens: 500,
    system: [
      { type: "text", text: SYSTEM_PROMPTS.diary_to_quiz, cache_control: { type: "ephemeral" } },
    ],
    messages: [{ role: "user", content: diary }],
  };

  const res = await callAnthropic(env, body);
  if (!res.ok) return json({ error: "anthropic_error" }, 502, origin);
  const data = (await res.json()) as any;
  const text = data?.content?.[0]?.text ?? "[]";
  await env.CACHE.put(cacheKey, text, { expirationTtl: 7 * 86_400 });
  return new Response(text, {
    headers: { "content-type": "application/json", ...corsHeaders(origin) },
  });
}

async function handleStoryDifficulty(req: Request, env: Env, origin: string | null): Promise<Response> {
  const { passage, level } = await req.json<{ passage: string; level: "easy" | "natural" | "challenge" }>();
  if (!passage || passage.length > 1500) return json({ error: "invalid_input" }, 400, origin);

  const cacheKey = `story:${level}:` + (await sha256Hex(passage));
  const cached = await env.CACHE.get(cacheKey);
  if (cached) {
    return new Response(JSON.stringify({ text: cached }), {
      headers: { "content-type": "application/json", "x-cache": "hit", ...corsHeaders(origin) },
    });
  }

  const sys = SYSTEM_PROMPTS.story_difficulty.replace("{level}", level);
  const body = {
    model: "claude-haiku-4-5",
    max_tokens: 600,
    system: [{ type: "text", text: sys, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: passage }],
  };

  const res = await callAnthropic(env, body);
  if (!res.ok) return json({ error: "anthropic_error" }, 502, origin);
  const data = (await res.json()) as any;
  const text = data?.content?.[0]?.text ?? "";
  // 캐시 영구 (30일) — 정적 변환이라 안전
  await env.CACHE.put(cacheKey, text, { expirationTtl: 30 * 86_400 });
  return new Response(JSON.stringify({ text }), {
    headers: { "content-type": "application/json", "x-cache": "miss", ...corsHeaders(origin) },
  });
}

function json(obj: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json", ...corsHeaders(origin) },
  });
}

// ─── Entry ──────────────────────────────────────────────
export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const origin = req.headers.get("Origin");
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(origin) });
    }

    const url = new URL(req.url);

    if (url.pathname === "/health") {
      return json({ ok: true, time: new Date().toISOString() }, 200, origin);
    }

    const userId = req.headers.get("X-User-Id") || "anon";
    const rate = await checkAndIncrementRate(env, userId);
    if (!rate.ok) {
      return json({ error: "daily_quota_exceeded", quota: DAILY_CALL_QUOTA }, 429, origin);
    }

    try {
      if (url.pathname === "/grade" && req.method === "POST") {
        return await handleGrade(req, env, origin);
      }
      if (url.pathname === "/roleplay" && req.method === "POST") {
        return await handleRoleplay(req, env, origin);
      }
      if (url.pathname === "/diary-to-quiz" && req.method === "POST") {
        return await handleDiaryToQuiz(req, env, origin);
      }
      if (url.pathname === "/story-difficulty" && req.method === "POST") {
        return await handleStoryDifficulty(req, env, origin);
      }
    } catch (e: any) {
      return json({ error: "server_error", message: String(e?.message ?? e) }, 500, origin);
    }

    return json({ error: "not_found" }, 404, origin);
  },
};
