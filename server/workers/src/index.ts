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
  grade_writing: `You are an English coach for Korean adult learners.
Check the user's English writing for grammar, word choice, punctuation, and naturalness.
Return a practical correction, not a long explanation.
Rules:
- score: 0-10 naturalness/accuracy.
- hasIssue: true only when the writing should be corrected.
- corrected: the full corrected English text. If there is no issue, repeat the original.
- fix: same as corrected for backward compatibility.
- alt: one richer natural alternative, or "".
- why: Korean explanation under 35 words.
- quizSentence: if hasIssue, create one fill-in-the-blank quiz from the corrected text by replacing the key corrected word/phrase with ___. If no issue, "".
- quizAnswer: the missing corrected word/phrase. If no issue, "".
- quizAccept: 0-2 acceptable corrected variants only. Never include the original mistaken form.
Respond ONLY as JSON:
{"score":number,"hasIssue":boolean,"corrected":"...","fix":"...","alt":"...","why":"...","quizSentence":"...","quizAnswer":"...","quizAccept":["..."]}`,

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

  advanced_current_topic: `You are a curriculum editor creating advanced English-learning content for Korean adult learners.
Use ONLY the provided source headlines/summaries as trend signals. Do not quote or paraphrase any article closely. Create an original educational article.
The output must fit this app schema and be useful for reading, debate, writing, and one-minute speaking practice.
Requirements:
- English body: 4 short paragraphs, 170-230 words total.
- Korean fields should be concise and natural.
- Choose category from: work, news, society.
- Include 4 key expressions.
- Include one debate question with stanceA, stanceB, and 3 useful frames.
- Include writingPrompt, speakingPrompt, sampleAnswer.
- Include 4 rubric items with criteria exactly: clarity, structure, evidence, delivery.
- Do not invent specific facts beyond the source signals. Keep claims cautious.
Respond ONLY as JSON:
{"category":"news","title":"...","subtitle":"...","summaryKo":"...","estimatedMinutes":8,"interestTags":["..."],"trendLabelKo":"...","sourceNoteKo":"...","body":"...","keyExpressions":[{"en":"...","ko":"...","usage":"..."}],"debate":{"question":"...","stanceA":"...","stanceB":"...","usefulFrames":["...","...","..."]},"writingPrompt":"...","speakingPrompt":"...","sampleAnswer":"...","rubric":[{"criterion":"clarity","label":"명확성","description":"..."},{"criterion":"structure","label":"구조","description":"..."},{"criterion":"evidence","label":"근거","description":"..."},{"criterion":"delivery","label":"전달","description":"..."}]}`,
} as const;

type NewsSource = {
  id: string;
  label: string;
  url: string;
  topics: string[];
};

type NewsItem = {
  source: string;
  title: string;
  url: string;
  publishedAt?: string;
  summary?: string;
};

const NEWS_SOURCES: NewsSource[] = [
  {
    id: "nasa-news",
    label: "NASA News Releases",
    url: "https://www.nasa.gov/news-release/feed/",
    topics: ["우주산업", "환경"],
  },
  {
    id: "nasa-technology",
    label: "NASA Technology",
    url: "https://www.nasa.gov/technology/feed/",
    topics: ["우주산업", "기술/AI"],
  },
  {
    id: "esa-space-news",
    label: "ESA Space News",
    url: "https://www.esa.int/rssfeed/Our_Activities/Space_News",
    topics: ["우주산업"],
  },
  {
    id: "mit-ai",
    label: "MIT News Artificial Intelligence",
    url: "https://news.mit.edu/rss/topic/artificial-intelligence2",
    topics: ["기술/AI", "교육", "업무"],
  },
  {
    id: "mit-climate",
    label: "MIT News Climate and Sustainability",
    url: "https://news.mit.edu/rss/topic/climate-change-and-sustainability",
    topics: ["환경", "건강", "도시생활"],
  },
  {
    id: "mit-management",
    label: "MIT News Business and Management",
    url: "https://news.mit.edu/rss/topic/business-management",
    topics: ["업무", "경제/소비"],
  },
  {
    id: "mit-education",
    label: "MIT News Education",
    url: "https://news.mit.edu/rss/topic/education-teaching-online-learning",
    topics: ["교육", "기술/AI"],
  },
  {
    id: "bbc-world",
    label: "BBC News World",
    url: "https://feeds.bbci.co.uk/news/world/rss.xml",
    topics: ["글로벌 트렌드", "국제뉴스", "사회", "정치"],
  },
  {
    id: "bbc-business",
    label: "BBC News Business",
    url: "https://feeds.bbci.co.uk/news/business/rss.xml",
    topics: ["경제/소비", "업무", "비즈니스"],
  },
  {
    id: "bbc-technology",
    label: "BBC News Technology",
    url: "https://feeds.bbci.co.uk/news/technology/rss.xml",
    topics: ["기술/AI", "업무"],
  },
  {
    id: "bbc-science-environment",
    label: "BBC News Science & Environment",
    url: "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
    topics: ["환경", "기술/AI", "건강"],
  },
  {
    id: "guardian-world",
    label: "The Guardian World",
    url: "https://www.theguardian.com/world/rss",
    topics: ["글로벌 트렌드", "국제뉴스", "사회", "정치"],
  },
  {
    id: "guardian-long-read",
    label: "The Guardian Long Read",
    url: "https://www.theguardian.com/news/series/the-long-read/rss",
    topics: ["글로벌 트렌드", "사회", "환경", "경제/소비", "교육"],
  },
  {
    id: "guardian-business",
    label: "The Guardian Business",
    url: "https://www.theguardian.com/business/rss",
    topics: ["경제/소비", "업무", "비즈니스"],
  },
  {
    id: "guardian-technology",
    label: "The Guardian Technology",
    url: "https://www.theguardian.com/technology/rss",
    topics: ["기술/AI", "업무"],
  },
  {
    id: "guardian-environment",
    label: "The Guardian Environment",
    url: "https://www.theguardian.com/environment/rss",
    topics: ["환경", "사회"],
  },
  {
    id: "nyt-world",
    label: "The New York Times World",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
    topics: ["글로벌 트렌드", "국제뉴스", "사회", "정치"],
  },
  {
    id: "nyt-business",
    label: "The New York Times Business",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml",
    topics: ["경제/소비", "업무", "비즈니스"],
  },
  {
    id: "nyt-technology",
    label: "The New York Times Technology",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml",
    topics: ["기술/AI", "업무"],
  },
  {
    id: "reddit-worldnews",
    label: "Reddit r/worldnews",
    url: "https://www.reddit.com/r/worldnews/.rss",
    topics: ["글로벌 트렌드", "커뮤니티", "국제뉴스", "사회"],
  },
  {
    id: "reddit-futurology",
    label: "Reddit r/Futurology",
    url: "https://www.reddit.com/r/Futurology/.rss",
    topics: ["글로벌 트렌드", "커뮤니티", "기술/AI", "환경"],
  },
  {
    id: "scmp-asia",
    label: "South China Morning Post Asia",
    url: "https://www.scmp.com/rss/3/feed",
    topics: ["아시아", "국제뉴스", "사회", "정치"],
  },
  {
    id: "scmp-china",
    label: "South China Morning Post China",
    url: "https://www.scmp.com/rss/4/feed",
    topics: ["아시아", "국제뉴스", "정치", "경제/소비"],
  },
  {
    id: "scmp-world",
    label: "South China Morning Post World",
    url: "https://www.scmp.com/rss/5/feed",
    topics: ["글로벌 트렌드", "국제뉴스", "사회"],
  },
  {
    id: "scmp-tech",
    label: "South China Morning Post Tech",
    url: "https://www.scmp.com/rss/36/feed",
    topics: ["아시아", "기술/AI", "경제/소비"],
  },
  {
    id: "scmp-business",
    label: "South China Morning Post Business",
    url: "https://www.scmp.com/rss/92/feed",
    topics: ["아시아", "경제/소비", "비즈니스", "업무"],
  },
  {
    id: "straits-times-asia",
    label: "The Straits Times Asia",
    url: "https://www.straitstimes.com/news/asia/rss.xml",
    topics: ["아시아", "국제뉴스", "사회", "정치"],
  },
  {
    id: "straits-times-world",
    label: "The Straits Times World",
    url: "https://www.straitstimes.com/news/world/rss.xml",
    topics: ["글로벌 트렌드", "국제뉴스", "사회"],
  },
  {
    id: "straits-times-business",
    label: "The Straits Times Business",
    url: "https://www.straitstimes.com/news/business/rss.xml",
    topics: ["아시아", "경제/소비", "비즈니스", "업무"],
  },
  {
    id: "the-hindu-international",
    label: "The Hindu International",
    url: "https://www.thehindu.com/news/international/feeder/default.rss",
    topics: ["아시아", "국제뉴스", "사회", "정치"],
  },
  {
    id: "the-hindu-sci-tech",
    label: "The Hindu Sci-Tech",
    url: "https://www.thehindu.com/sci-tech/feeder/default.rss",
    topics: ["아시아", "기술/AI", "환경", "건강"],
  },
  {
    id: "the-hindu-business",
    label: "The Hindu Business",
    url: "https://www.thehindu.com/business/feeder/default.rss",
    topics: ["아시아", "경제/소비", "비즈니스", "업무"],
  },
];

const DEFAULT_NEWS_SOURCE_IDS = [
  "bbc-world",
  "guardian-world",
  "nyt-world",
  "reddit-worldnews",
  "mit-ai",
];
const NEWS_SOURCE_CACHE_PREFIX = "news-src:v2:";
const ADVANCED_CURRENT_CACHE_PREFIX = "adv-current:v2:";

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

function stripHtml(text: string): string {
  return decodeXml(text)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeXml(text: string): string {
  return text
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_m, code) => String.fromCharCode(Number(code)));
}

function extractTag(block: string, tag: string): string {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return stripHtml(match?.[1] ?? "");
}

function parseFeedItems(xml: string, source: NewsSource): NewsItem[] {
  const itemBlocks = [...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)].map(match => match[0]);
  const entryBlocks = itemBlocks.length > 0
    ? []
    : [...xml.matchAll(/<entry\b[\s\S]*?<\/entry>/gi)].map(match => match[0]);
  const blocks = itemBlocks.length > 0 ? itemBlocks : entryBlocks;

  return blocks.slice(0, 8).map(block => {
    const atomLink = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i)?.[1] ?? "";
    const title = extractTag(block, "title");
    const url = extractTag(block, "link") || decodeXml(atomLink);
    const publishedAt = extractTag(block, "pubDate") || extractTag(block, "updated") || extractTag(block, "published") || undefined;
    const summary = extractTag(block, "description") || extractTag(block, "summary") || extractTag(block, "content:encoded") || undefined;
    return {
      source: source.label,
      title,
      url,
      publishedAt,
      summary: summary ? summary.slice(0, 240) : undefined,
    };
  }).filter(item => item.title && item.url);
}

function normalizeTopic(topic: string): string {
  return topic.toLowerCase().replace(/\s+/g, "").trim();
}

function selectNewsSources(topics: string[]): NewsSource[] {
  const normalizedTopics = topics.map(normalizeTopic);
  const selected = NEWS_SOURCES
    .map((source, index) => ({
      source,
      index,
      score: source.topics.reduce(
        (sum, topic) => sum + (normalizedTopics.includes(normalizeTopic(topic)) ? 1 : 0),
        0,
      ),
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(item => item.source);
  if (selected.length > 0) return selected.slice(0, 5);

  const fallback = DEFAULT_NEWS_SOURCE_IDS
    .map(id => NEWS_SOURCES.find(source => source.id === id))
    .filter((source): source is NewsSource => Boolean(source));
  return fallback.slice(0, 5);
}

async function fetchNewsItemsForTopics(env: Env, topics: string[]): Promise<{ items: NewsItem[]; sources: NewsSource[]; cached: boolean }> {
  const sources = selectNewsSources(topics);
  const cacheKey = NEWS_SOURCE_CACHE_PREFIX + (await sha256Hex(sources.map(source => source.id).sort().join("|")));
  const cached = await env.CACHE.get(cacheKey);
  if (cached) {
    try {
      return { items: JSON.parse(cached) as NewsItem[], sources, cached: true };
    } catch {
      // Ignore malformed cache and refresh below.
    }
  }

  const results = await Promise.all(sources.map(async source => {
    try {
      const res = await fetch(source.url, {
        headers: { "user-agent": "sulsul-plus-learning-bot/0.1" },
      });
      if (!res.ok) return [] as NewsItem[];
      const xml = await res.text();
      return parseFeedItems(xml, source);
    } catch {
      return [] as NewsItem[];
    }
  }));

  const seen = new Set<string>();
  const items: NewsItem[] = [];
  for (let index = 0; index < 8 && items.length < 12; index += 1) {
    for (const sourceItems of results) {
      const item = sourceItems[index];
      if (!item) continue;
      const key = `${item.source}|${item.title}`;
      if (seen.has(key)) continue;
      seen.add(key);
      items.push(item);
      if (items.length >= 12) break;
    }
  }
  await env.CACHE.put(cacheKey, JSON.stringify(items), { expirationTtl: 60 * 60 });
  return { items, sources, cached: false };
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
    max_tokens: 350,
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

async function handleAdvancedCurrentTopic(req: Request, env: Env, origin: string | null): Promise<Response> {
  let body: any;
  try { body = await req.json(); }
  catch { return json({ error: "invalid_json" }, 400, origin); }

  const topics = Array.isArray(body.topics)
    ? body.topics.map((topic: unknown) => String(topic).trim()).filter(Boolean).slice(0, 8)
    : [];
  const recentJournal = Array.isArray(body.recentJournal)
    ? body.recentJournal.map((entry: unknown) => String(entry).trim()).filter(Boolean).slice(0, 5)
    : [];
  const existingTitles = Array.isArray(body.existingTitles)
    ? body.existingTitles.map((title: unknown) => String(title).trim()).filter(Boolean).slice(0, 20)
    : [];

  if (topics.length === 0 && recentJournal.length === 0) {
    return json({ error: "missing_topics", message: "topics or recentJournal is required" }, 400, origin);
  }

  const news = await fetchNewsItemsForTopics(env, topics);
  if (news.items.length === 0) {
    return json({ error: "news_sources_unavailable", sources: news.sources.map(source => source.label) }, 502, origin);
  }

  const sourceBrief = news.items.slice(0, 8).map((item, index) => ({
    n: index + 1,
    source: item.source,
    title: item.title,
    publishedAt: item.publishedAt ?? "",
    summary: item.summary ?? "",
    url: item.url,
  }));
  const payload = JSON.stringify({
    topics,
    recentJournal,
    existingTitles,
    today: new Date().toISOString().slice(0, 10),
    sourceBrief,
  });
  if (payload.length > 9000) return json({ error: "payload_too_long", limit: 9000 }, 400, origin);

  const cacheKey = ADVANCED_CURRENT_CACHE_PREFIX + (await sha256Hex(payload));
  const cached = await env.CACHE.get(cacheKey);
  if (cached) {
    return new Response(cached, {
      headers: { "content-type": "application/json", "x-cache": "hit", ...corsHeaders(origin) },
    });
  }

  const reqBody = {
    model: MODEL,
    max_tokens: 1700,
    system: [{ type: "text", text: SYSTEM_PROMPTS.advanced_current_topic, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: payload }],
  };

  const res = await callAnthropic(env, reqBody);
  let text = "";
  let source = "anthropic";
  if (!res.ok) {
    const fb = await callGemini(env, `${SYSTEM_PROMPTS.advanced_current_topic}\n\nInput JSON:\n${payload}`);
    if (!fb.ok) return json({ error: "llm_unavailable", anthropic_status: res.status }, 502, origin);
    text = fb.text;
    source = "gemini";
  } else {
    const data = (await res.json()) as any;
    text = data?.content?.[0]?.text ?? "{}";
  }

  const draft = JSON.parse(normalizeJsonText(text, "{}")) as any;
  const now = new Date().toISOString();
  const article = {
    id: `adv-live-${await sha256Hex(`${now}|${draft.title ?? topics.join("-")}`)}`.slice(0, 24),
    languageId: "en",
    levelId: "advanced",
    generatedAt: now,
    isGenerated: true,
    category: ["work", "news", "society"].includes(draft.category) ? draft.category : "news",
    interestTags: Array.isArray(draft.interestTags) ? draft.interestTags.slice(0, 8).map(String) : topics,
    trendLabelKo: String(draft.trendLabelKo ?? "최신 맞춤 이슈"),
    sourceNoteKo: String(draft.sourceNoteKo ?? "공식 RSS/뉴스 소스의 최신 제목과 요약을 바탕으로 원문을 인용하지 않고 학습용으로 재구성했습니다."),
    sourceItems: news.items.slice(0, 4).map(item => ({
      source: item.source,
      title: item.title,
      url: item.url,
      publishedAt: item.publishedAt,
    })),
    title: String(draft.title ?? "A Current Issue Worth Discussing"),
    subtitle: String(draft.subtitle ?? "최신 주제를 바탕으로 의견을 말해봅니다."),
    summaryKo: String(draft.summaryKo ?? ""),
    estimatedMinutes: Number(draft.estimatedMinutes ?? 8),
    body: String(draft.body ?? ""),
    keyExpressions: Array.isArray(draft.keyExpressions) ? draft.keyExpressions.slice(0, 4) : [],
    debate: draft.debate ?? { question: "", stanceA: "", stanceB: "", usefulFrames: [] },
    writingPrompt: String(draft.writingPrompt ?? ""),
    speakingPrompt: String(draft.speakingPrompt ?? ""),
    sampleAnswer: String(draft.sampleAnswer ?? ""),
    rubric: Array.isArray(draft.rubric) ? draft.rubric.slice(0, 4) : [],
  };

  const out = JSON.stringify({ article, sourceItems: article.sourceItems, cachedSources: news.cached, modelSource: source });
  await env.CACHE.put(cacheKey, out, { expirationTtl: 12 * 60 * 60 });
  return new Response(out, {
    headers: { "content-type": "application/json", "x-cache": "miss", "x-source": source, ...corsHeaders(origin) },
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
      if (url.pathname === "/advanced-current-topic" && req.method === "POST") {
        return await handleAdvancedCurrentTopic(req, env, origin);
      }
    } catch (e: any) {
      return json({ error: "server_error", message: String(e?.message ?? e) }, 500, origin);
    }

    return json({ error: "not_found", path: url.pathname }, 404, origin);
  },
};
