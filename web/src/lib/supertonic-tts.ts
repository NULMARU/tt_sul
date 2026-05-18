import { useStore } from "./store";

export const SUPERTONIC_CONSENT_VERSION = "supertonic-openrail-m-2026-05";
export const SUPERTONIC_ESTIMATED_MODEL_MB = 398;
export const SUPERTONIC_AUDIO_CACHE_LIMIT_MB = 96;
export const SUPERTONIC_GITHUB_URL = "https://github.com/supertone-inc/supertonic";
export const SUPERTONIC_MODEL_URL = "https://huggingface.co/Supertone/supertonic-3";
export const SUPERTONIC_MODEL_LICENSE_URL = "https://huggingface.co/Supertone/supertonic-3/blob/main/LICENSE";

const HF_RESOLVE_BASE = "https://huggingface.co/Supertone/supertonic-3/resolve/main";
const CACHE_NAME = "sulsul-supertonic-v1";
const AUDIO_CACHE_NAME = "sulsul-supertonic-audio-v1";
const AUDIO_CACHE_VERSION = "supertonic-audio-v1";
const AUDIO_CACHE_LIMIT_BYTES = SUPERTONIC_AUDIO_CACHE_LIMIT_MB * 1024 * 1024;
const AUDIO_CACHE_MAX_ITEM_BYTES = 48 * 1024 * 1024;
const AUDIO_CACHE_MAX_ENTRIES = 24;
const DEFAULT_VOICE_STYLE = "M1";
const DEFAULT_TOTAL_STEPS = 5;
const DEFAULT_SPEED = 1.05;

const ASSETS = [
  { path: "onnx/tts.json", label: "TTS config", bytes: 24_000 },
  { path: "onnx/unicode_indexer.json", label: "Unicode indexer", bytes: 4_100_000 },
  { path: "onnx/duration_predictor.onnx", label: "Duration predictor", bytes: 3_700_147 },
  { path: "onnx/text_encoder.onnx", label: "Text encoder", bytes: 36_416_150 },
  { path: "onnx/vector_estimator.onnx", label: "Vector estimator", bytes: 256_534_781 },
  { path: "onnx/vocoder.onnx", label: "Vocoder", bytes: 101_424_195 },
  { path: `voice_styles/${DEFAULT_VOICE_STYLE}.json`, label: `${DEFAULT_VOICE_STYLE} voice style`, bytes: 310_000 },
] as const;

type Ort = typeof import("onnxruntime-web/webgpu");
type OrtTensor = import("onnxruntime-web/webgpu").Tensor;
type OrtSession = import("onnxruntime-web/webgpu").InferenceSession;

export type SupertonicBackend = "webgpu" | "wasm" | "unsupported";

export interface SupertonicRuntimeStatus {
  supported: boolean;
  backend: SupertonicBackend;
  ready: boolean;
  reasonKo: string;
  costNoteKo: string;
}

export interface SupertonicAssetStatus {
  cached: boolean;
  cachedCount: number;
  totalCount: number;
  estimatedBytes: number;
  cachedAt?: string;
  lastError?: string;
}

export interface SupertonicPrepareProgress {
  label: string;
  current: number;
  total: number;
}

export interface SupertonicAudioCacheStatus {
  cachedCount: number;
  totalBytes: number;
  limitBytes: number;
  maxEntries: number;
}

export interface SupertonicSpeakResult {
  started: boolean;
  reasonKo?: string;
}

interface SupertonicRuntime {
  ort: Ort;
  backend: Exclude<SupertonicBackend, "unsupported">;
  cfgs: SupertonicConfig;
  indexer: number[];
  sessions: {
    dp: OrtSession;
    textEnc: OrtSession;
    vectorEst: OrtSession;
    vocoder: OrtSession;
  };
  style: SupertonicStyle;
  sampleRate: number;
}

interface SupertonicConfig {
  ae: {
    sample_rate: number;
    base_chunk_size: number;
  };
  ttl: {
    chunk_compress_factor: number;
    latent_dim: number;
  };
}

interface SupertonicStyle {
  ttl: OrtTensor;
  dp: OrtTensor;
}

let runtimePromise: Promise<SupertonicRuntime> | null = null;
let activeAudio: HTMLAudioElement | null = null;
let activeAudioDone: (() => void) | null = null;

export function supertonicRuntimeStatus(): SupertonicRuntimeStatus {
  if (typeof window === "undefined") {
    return unavailable("unsupported", "브라우저 환경에서만 사용할 수 있습니다.");
  }

  const ready = !!useStore.getState().prefs.supertonicTtsAssetsCachedAt;
  if ("gpu" in navigator) {
    return {
      supported: true,
      backend: "webgpu",
      ready,
      reasonKo: ready
        ? "WebGPU 사용 가능 기기이며 Supertonic 모델 캐시가 준비되어 있습니다."
        : "WebGPU 사용 가능 기기입니다. 모델 캐시를 준비하면 고품질 TTS를 시도할 수 있습니다.",
      costNoteKo: ready
        ? "모델은 이 기기 캐시에 저장되어 있으며, 재생 시 추가 API 과금은 없습니다."
        : "모델은 사용자가 버튼을 눌러야 내려받습니다. 자동 다운로드는 하지 않습니다.",
    };
  }

  if (typeof WebAssembly !== "undefined") {
    return {
      supported: true,
      backend: "wasm",
      ready,
      reasonKo: ready
        ? "WebAssembly fallback으로 Supertonic 모델을 실행할 수 있습니다. WebGPU보다 느릴 수 있습니다."
        : "WebGPU는 없지만 WebAssembly fallback 후보입니다. 모델 캐시 후 짧은 문장부터 테스트해야 합니다.",
      costNoteKo: ready
        ? "모델은 이 기기 캐시에 저장되어 있으며, 재생 시 추가 API 과금은 없습니다."
        : "모델은 사용자가 버튼을 눌러야 내려받습니다. 자동 다운로드는 하지 않습니다.",
    };
  }

  return unavailable("unsupported", "이 브라우저는 Supertonic 실행에 필요한 WebGPU/WebAssembly 조건을 만족하지 않습니다.");
}

export function supertonicConsentAccepted(): boolean {
  const prefs = useStore.getState().prefs;
  return prefs.ttsProvider === "supertonic"
    && prefs.supertonicTtsConsentVersion === SUPERTONIC_CONSENT_VERSION
    && !!prefs.supertonicTtsAcceptedAt;
}

export async function supertonicAssetStatus(): Promise<SupertonicAssetStatus> {
  if (!canUseCacheStorage()) return assetStatusBase(0, "이 브라우저는 Cache Storage를 지원하지 않습니다.");
  const cache = await caches.open(CACHE_NAME);
  let cachedCount = 0;
  for (const asset of ASSETS) {
    if (await cache.match(assetUrl(asset.path))) cachedCount += 1;
  }
  const prefs = useStore.getState().prefs;
  return {
    ...assetStatusBase(cachedCount, prefs.supertonicTtsLastError),
    cachedAt: prefs.supertonicTtsAssetsCachedAt,
  };
}

export async function prepareSupertonicAssets(onProgress?: (progress: SupertonicPrepareProgress) => void): Promise<SupertonicAssetStatus> {
  if (!supertonicConsentAccepted()) throw new Error("Supertonic 조건 확인이 필요합니다.");
  if (!canUseCacheStorage()) throw new Error("이 브라우저는 Cache Storage를 지원하지 않습니다.");

  try {
    const cache = await caches.open(CACHE_NAME);
    for (let i = 0; i < ASSETS.length; i += 1) {
      const asset = ASSETS[i];
      const url = assetUrl(asset.path);
      onProgress?.({ label: asset.label, current: i + 1, total: ASSETS.length });
      if (await cache.match(url)) continue;
      const response = await fetch(url, { mode: "cors", credentials: "omit" });
      if (!response.ok) throw new Error(`${asset.label} 다운로드 실패 (${response.status})`);
      await cache.put(url, response);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    useStore.getState().setPrefs({ supertonicTtsLastError: message });
    throw error;
  }

  const cachedAt = new Date().toISOString();
  useStore.getState().setPrefs({
    supertonicTtsAssetsCachedAt: cachedAt,
    supertonicTtsLastError: undefined,
  });
  return { ...(await supertonicAssetStatus()), cachedAt };
}

export async function clearSupertonicAssets(): Promise<void> {
  if (canUseCacheStorage()) await caches.delete(CACHE_NAME);
  await clearSupertonicAudioCache();
  runtimePromise = null;
  useStore.getState().setPrefs({
    supertonicTtsAssetsCachedAt: undefined,
    supertonicTtsLastError: undefined,
  });
}

export async function supertonicAudioCacheStatus(): Promise<SupertonicAudioCacheStatus> {
  if (!canUseCacheStorage()) return audioCacheStatusBase();
  const entries = await listAudioCacheEntries();
  return {
    cachedCount: entries.length,
    totalBytes: entries.reduce((sum, entry) => sum + entry.bytes, 0),
    limitBytes: AUDIO_CACHE_LIMIT_BYTES,
    maxEntries: AUDIO_CACHE_MAX_ENTRIES,
  };
}

export async function clearSupertonicAudioCache(): Promise<void> {
  if (canUseCacheStorage()) await caches.delete(AUDIO_CACHE_NAME);
}

export function supertonicNoticeItems(): string[] {
  return [
    "기본 TTS는 계속 유지하고, Supertonic은 조건을 확인한 사용자에게만 시도합니다.",
    `모델 자산은 약 ${SUPERTONIC_ESTIMATED_MODEL_MB}MB 수준이라 기본 번들에 포함하지 않습니다.`,
    `합성된 음성은 최대 ${SUPERTONIC_AUDIO_CACHE_LIMIT_MB}MB까지만 보관하고 오래된 항목부터 자동 정리합니다.`,
    "모델은 OpenRAIL-M 조건을 따르며 불법·사칭·괴롭힘·차별·의료/법률 판단 등 금지 용도로 사용할 수 없습니다.",
    "실패하거나 기기가 지원하지 않으면 자동으로 기존 시스템 TTS로 돌아갑니다.",
  ];
}

export async function trySpeakWithSupertonic(
  text: string,
  opts: { lang?: "en" | "ko"; rate?: number; pitch?: number } = {},
): Promise<SupertonicSpeakResult> {
  const status = supertonicRuntimeStatus();
  if (!supertonicConsentAccepted()) {
    return { started: false, reasonKo: "Supertonic 조건 확인이 완료되지 않아 시스템 TTS로 재생합니다." };
  }
  if (!status.supported) return { started: false, reasonKo: status.reasonKo };
  if (!status.ready) {
    return { started: false, reasonKo: "Supertonic 모델 캐시가 아직 준비되지 않아 시스템 TTS로 재생합니다." };
  }

  try {
    const lang = opts.lang === "ko" ? "ko" : "en";
    const speed = clamp(opts.rate ?? DEFAULT_SPEED, 0.7, 2);
    const audioKey = await supertonicAudioCacheKey(text, lang, speed);
    const cachedAudio = await getCachedSupertonicAudio(audioKey);
    if (cachedAudio) {
      await playAudioBlob(cachedAudio);
      return { started: true };
    }

    const runtime = await getRuntime(status.backend === "webgpu" ? "webgpu" : "wasm");
    const audio = await synthesize(runtime, text, lang, speed);
    await putCachedSupertonicAudio(audioKey, audio);
    await playAudioBlob(audio);
    return { started: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    runtimePromise = null;
    useStore.getState().setPrefs({ supertonicTtsLastError: message });
    return { started: false, reasonKo: `Supertonic 재생 실패: ${message}` };
  }
}

export function stopSupertonicAudio() {
  const audio = activeAudio;
  const done = activeAudioDone;
  activeAudio = null;
  activeAudioDone = null;
  if (!audio) return;
  audio.pause();
  done?.();
}

async function playAudioBlob(audio: Blob): Promise<void> {
  stopSupertonicAudio();
  const url = URL.createObjectURL(audio);
  const audioEl = new Audio(url);
  activeAudio = audioEl;
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      URL.revokeObjectURL(url);
      if (activeAudio === audioEl) activeAudio = null;
      activeAudioDone = null;
      if (error) reject(error);
      else resolve();
    };
    activeAudioDone = () => finish();
    audioEl.onended = () => finish();
    audioEl.onerror = () => finish(new Error("브라우저 오디오 재생 실패"));
    audioEl.play().catch(error => {
      const message = error instanceof Error ? error.message : String(error);
      finish(new Error(message));
    });
  });
}

async function supertonicAudioCacheKey(text: string, lang: "en" | "ko", speed: number): Promise<string> {
  const normalized = text.trim().replace(/\s+/g, " ");
  const source = [
    AUDIO_CACHE_VERSION,
    DEFAULT_VOICE_STYLE,
    DEFAULT_TOTAL_STEPS,
    lang,
    speed.toFixed(2),
    normalized,
  ].join("|");
  const digest = await sha256(source);
  return `${lang}-${speed.toFixed(2)}-${DEFAULT_VOICE_STYLE}-${digest}`;
}

async function getCachedSupertonicAudio(key: string): Promise<Blob | null> {
  if (!canUseCacheStorage()) return null;
  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const request = audioCacheRequest(key);
    const cached = await cache.match(request);
    if (!cached) return null;
    const blob = await cached.blob();
    try {
      await cache.put(request, audioCacheResponse(blob, {
        createdAt: cached.headers.get("X-Sulsul-Created-At") ?? new Date().toISOString(),
        lastUsedAt: new Date().toISOString(),
        key,
      }));
    } catch {
      // The cached audio is still usable even if updating recency metadata fails.
    }
    return blob;
  } catch {
    return null;
  }
}

async function putCachedSupertonicAudio(key: string, audio: Blob): Promise<void> {
  if (!canUseCacheStorage() || audio.size <= 0 || audio.size > AUDIO_CACHE_MAX_ITEM_BYTES) return;
  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const now = new Date().toISOString();
    await cache.put(audioCacheRequest(key), audioCacheResponse(audio, {
      createdAt: now,
      lastUsedAt: now,
      key,
    }));
    await trimSupertonicAudioCache();
  } catch {
    // Audio cache is an optimization only. Never block playback because storage is full.
  }
}

async function trimSupertonicAudioCache(): Promise<void> {
  const cache = await caches.open(AUDIO_CACHE_NAME);
  const entries = await listAudioCacheEntries();
  let totalBytes = entries.reduce((sum, entry) => sum + entry.bytes, 0);
  let count = entries.length;
  for (const entry of entries.sort((a, b) => a.lastUsedAt - b.lastUsedAt)) {
    if (totalBytes <= AUDIO_CACHE_LIMIT_BYTES && count <= AUDIO_CACHE_MAX_ENTRIES) break;
    if (await cache.delete(entry.request)) {
      totalBytes -= entry.bytes;
      count -= 1;
    }
  }
}

async function listAudioCacheEntries(): Promise<Array<{ request: Request; bytes: number; lastUsedAt: number }>> {
  if (!canUseCacheStorage()) return [];
  const cache = await caches.open(AUDIO_CACHE_NAME);
  const requests = await cache.keys();
  const entries = await Promise.all(requests.map(async request => {
    const response = await cache.match(request);
    if (!response) return null;
    const bytes = Number(response.headers.get("X-Sulsul-Bytes")) || (await response.clone().blob()).size;
    const lastUsed = response.headers.get("X-Sulsul-Last-Used-At")
      ?? response.headers.get("X-Sulsul-Created-At")
      ?? "1970-01-01T00:00:00.000Z";
    return { request, bytes, lastUsedAt: new Date(lastUsed).getTime() || 0 };
  }));
  return entries.filter((entry): entry is { request: Request; bytes: number; lastUsedAt: number } => !!entry);
}

function audioCacheResponse(audio: Blob, meta: { createdAt: string; lastUsedAt: string; key: string }): Response {
  return new Response(audio, {
    headers: {
      "Content-Type": audio.type || "audio/wav",
      "X-Sulsul-Audio-Cache-Version": AUDIO_CACHE_VERSION,
      "X-Sulsul-Audio-Key": meta.key,
      "X-Sulsul-Bytes": String(audio.size),
      "X-Sulsul-Created-At": meta.createdAt,
      "X-Sulsul-Last-Used-At": meta.lastUsedAt,
    },
  });
}

function audioCacheRequest(key: string): Request {
  return new Request(`${window.location.origin}/__sulsul_supertonic_audio__/${encodeURIComponent(key)}.wav`);
}

async function sha256(value: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
    return Array.from(new Uint8Array(bytes)).map(byte => byte.toString(16).padStart(2, "0")).join("").slice(0, 32);
  }
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0).toString(16).padStart(8, "0");
}

async function getRuntime(preferredBackend: Exclude<SupertonicBackend, "unsupported">): Promise<SupertonicRuntime> {
  runtimePromise ??= createRuntime(preferredBackend);
  return runtimePromise;
}

async function createRuntime(preferredBackend: Exclude<SupertonicBackend, "unsupported">): Promise<SupertonicRuntime> {
  const ort = await import("onnxruntime-web/webgpu");
  const sessionOptions = {
    executionProviders: preferredBackend === "webgpu" ? ["webgpu"] : ["wasm"],
    graphOptimizationLevel: "all",
  } satisfies import("onnxruntime-web/webgpu").InferenceSession.SessionOptions;

  let backend = preferredBackend;
  let sessions: SupertonicRuntime["sessions"];
  try {
    sessions = await loadSessions(ort, sessionOptions);
  } catch (error) {
    if (preferredBackend !== "webgpu") throw error;
    backend = "wasm";
    sessions = await loadSessions(ort, {
      executionProviders: ["wasm"],
      graphOptimizationLevel: "all",
    });
  }

  const cfgs = await fetchCachedJson<SupertonicConfig>("onnx/tts.json");
  const indexer = await fetchCachedJson<number[]>("onnx/unicode_indexer.json");
  const style = await loadVoiceStyle(ort, `voice_styles/${DEFAULT_VOICE_STYLE}.json`);
  return { ort, backend, cfgs, indexer, sessions, style, sampleRate: cfgs.ae.sample_rate };
}

async function loadSessions(
  ort: Ort,
  sessionOptions: import("onnxruntime-web/webgpu").InferenceSession.SessionOptions,
): Promise<SupertonicRuntime["sessions"]> {
  const [dp, textEnc, vectorEst, vocoder] = await Promise.all([
    ort.InferenceSession.create(await fetchCachedArrayBuffer("onnx/duration_predictor.onnx"), sessionOptions),
    ort.InferenceSession.create(await fetchCachedArrayBuffer("onnx/text_encoder.onnx"), sessionOptions),
    ort.InferenceSession.create(await fetchCachedArrayBuffer("onnx/vector_estimator.onnx"), sessionOptions),
    ort.InferenceSession.create(await fetchCachedArrayBuffer("onnx/vocoder.onnx"), sessionOptions),
  ]);
  return { dp, textEnc, vectorEst, vocoder };
}

async function synthesize(runtime: SupertonicRuntime, text: string, lang: "en" | "ko", speed: number): Promise<Blob> {
  const { wav, duration } = await synthesizeArrays(runtime, text, lang, runtime.style, DEFAULT_TOTAL_STEPS, speed, 0.25);
  const wavLen = Math.floor(runtime.sampleRate * duration[0]);
  const wavOut = wav.slice(0, wavLen);
  return new Blob([writeWavFile(wavOut, runtime.sampleRate)], { type: "audio/wav" });
}

async function synthesizeArrays(
  runtime: SupertonicRuntime,
  text: string,
  lang: "en" | "ko",
  style: SupertonicStyle,
  totalStep: number,
  speed: number,
  silenceDuration: number,
): Promise<{ wav: number[]; duration: number[] }> {
  const chunks = chunkText(text, lang === "ko" ? 120 : 260);
  let wavCat: number[] = [];
  let durCat = 0;
  for (const chunk of chunks) {
    const result = await inferOne(runtime, chunk, lang, style, totalStep, speed);
    if (wavCat.length === 0) {
      wavCat = result.wav;
      durCat = result.duration[0];
    } else {
      wavCat = [
        ...wavCat,
        ...new Array(Math.floor(silenceDuration * runtime.sampleRate)).fill(0),
        ...result.wav,
      ];
      durCat += result.duration[0] + silenceDuration;
    }
  }
  return { wav: wavCat, duration: [durCat] };
}

async function inferOne(
  runtime: SupertonicRuntime,
  text: string,
  lang: "en" | "ko",
  style: SupertonicStyle,
  totalStep: number,
  speed: number,
) {
  const bsz = 1;
  const processedText = preprocessText(text, lang, runtime.indexer);
  const textIds = processedText.map(codePoint => codePoint < runtime.indexer.length ? runtime.indexer[codePoint] : -1);
  const textIdsTensor = new runtime.ort.Tensor("int64", new BigInt64Array(textIds.map(x => BigInt(x))), [bsz, textIds.length]);
  const textMaskTensor = new runtime.ort.Tensor("float32", new Float32Array(new Array(textIds.length).fill(1)), [bsz, 1, textIds.length]);

  const dpOutputs = await runtime.sessions.dp.run({ text_ids: textIdsTensor, style_dp: style.dp, text_mask: textMaskTensor });
  const duration = Array.from(dpOutputs.duration.data as Float32Array).map(item => Number(item) / speed);

  const textEncOutputs = await runtime.sessions.textEnc.run({ text_ids: textIdsTensor, style_ttl: style.ttl, text_mask: textMaskTensor });
  const textEmb = textEncOutputs.text_emb;

  let { xt, latentMask } = sampleNoisyLatent(
    duration,
    runtime.sampleRate,
    runtime.cfgs.ae.base_chunk_size,
    runtime.cfgs.ttl.chunk_compress_factor,
    runtime.cfgs.ttl.latent_dim,
  );
  const latentMaskTensor = new runtime.ort.Tensor("float32", new Float32Array(latentMask.flat(2)), [bsz, 1, latentMask[0][0].length]);
  const totalStepTensor = new runtime.ort.Tensor("float32", new Float32Array([totalStep]), [bsz]);

  for (let step = 0; step < totalStep; step += 1) {
    const xtTensor = new runtime.ort.Tensor("float32", new Float32Array(xt.flat(2)), [bsz, xt[0].length, xt[0][0].length]);
    const currentStepTensor = new runtime.ort.Tensor("float32", new Float32Array([step]), [bsz]);
    const vectorEstOutputs = await runtime.sessions.vectorEst.run({
      noisy_latent: xtTensor,
      text_emb: textEmb,
      style_ttl: style.ttl,
      latent_mask: latentMaskTensor,
      text_mask: textMaskTensor,
      current_step: currentStepTensor,
      total_step: totalStepTensor,
    });
    xt = reshape3d(Array.from(vectorEstOutputs.denoised_latent.data as Float32Array), bsz, xt[0].length, xt[0][0].length);
  }

  const finalXtTensor = new runtime.ort.Tensor("float32", new Float32Array(xt.flat(2)), [bsz, xt[0].length, xt[0][0].length]);
  const vocoderOutputs = await runtime.sessions.vocoder.run({ latent: finalXtTensor });
  return {
    wav: Array.from(vocoderOutputs.wav_tts.data as Float32Array),
    duration,
  };
}

async function loadVoiceStyle(ort: Ort, path: string): Promise<SupertonicStyle> {
  const voiceStyle = await fetchCachedJson<{
    style_ttl: { dims: number[]; data: number[][][] };
    style_dp: { dims: number[]; data: number[][][] };
  }>(path);
  return {
    ttl: new ort.Tensor("float32", new Float32Array(voiceStyle.style_ttl.data.flat(2)), voiceStyle.style_ttl.dims),
    dp: new ort.Tensor("float32", new Float32Array(voiceStyle.style_dp.data.flat(2)), voiceStyle.style_dp.dims),
  };
}

function preprocessText(text: string, lang: "en" | "ko", indexer: number[]): number[] {
  let normalized = text.normalize("NFKD")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]+/gu, "")
    .replace(/[–‑—_]/g, " ")
    .replace(/[“”]/g, "\"")
    .replace(/[‘’´`]/g, "'")
    .replace(/[\[\]|/#→←♥☆♡©\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!/[.!?;:,'"')\]}…。」』〗〉》›»]$/.test(normalized)) normalized += ".";
  const tagged = `<${lang}>${normalized}</${lang}>`;
  return Array.from(tagged).map(char => {
    const codePoint = char.codePointAt(0) ?? 0;
    return codePoint < indexer.length ? codePoint : 0;
  });
}

function sampleNoisyLatent(duration: number[], sampleRate: number, baseChunkSize: number, chunkCompress: number, latentDim: number) {
  const bsz = duration.length;
  const maxDur = Math.max(...duration);
  const wavLengths = duration.map(d => Math.floor(d * sampleRate));
  const chunkSize = baseChunkSize * chunkCompress;
  const latentLen = Math.floor((Math.floor(maxDur * sampleRate) + chunkSize - 1) / chunkSize);
  const latentDimVal = latentDim * chunkCompress;
  const latentLengths = wavLengths.map(len => Math.floor((len + chunkSize - 1) / chunkSize));
  const latentMask = lengthToMask(latentLengths, latentLen);
  const xt: number[][][] = [];
  for (let b = 0; b < bsz; b += 1) {
    const batch: number[][] = [];
    for (let d = 0; d < latentDimVal; d += 1) {
      const row: number[] = [];
      for (let t = 0; t < latentLen; t += 1) row.push(randomNormal() * latentMask[b][0][t]);
      batch.push(row);
    }
    xt.push(batch);
  }
  return { xt, latentMask };
}

function lengthToMask(lengths: number[], maxLen: number) {
  return lengths.map(len => [Array.from({ length: maxLen }, (_, i) => i < len ? 1 : 0)]);
}

function randomNormal() {
  const u1 = Math.max(0.0001, Math.random());
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function reshape3d(flat: number[], bsz: number, dim: number, len: number): number[][][] {
  const out: number[][][] = [];
  let index = 0;
  for (let b = 0; b < bsz; b += 1) {
    const batch: number[][] = [];
    for (let d = 0; d < dim; d += 1) {
      const row: number[] = [];
      for (let t = 0; t < len; t += 1) row.push(flat[index++]);
      batch.push(row);
    }
    out.push(batch);
  }
  return out;
}

function chunkText(text: string, maxLen: number) {
  const sentences = text.trim().split(/(?<=[.!?])\s+/).filter(Boolean);
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences.length ? sentences : [text]) {
    if (`${current} ${sentence}`.trim().length > maxLen && current) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current = `${current} ${sentence}`.trim();
    }
  }
  if (current) chunks.push(current.trim());
  return chunks;
}

function writeWavFile(samples: number[], sampleRate: number) {
  const pcm = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i += 1) pcm[i] = Math.max(-1, Math.min(1, samples[i])) * 0x7fff;
  const buffer = new ArrayBuffer(44 + pcm.length * 2);
  const view = new DataView(buffer);
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + pcm.length * 2, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, pcm.length * 2, true);
  for (let i = 0; i < pcm.length; i += 1) view.setInt16(44 + i * 2, pcm[i], true);
  return buffer;
}

function writeString(view: DataView, offset: number, value: string) {
  for (let i = 0; i < value.length; i += 1) view.setUint8(offset + i, value.charCodeAt(i));
}

async function fetchCachedJson<T>(path: string): Promise<T> {
  const response = await fetchCachedResponse(path);
  return response.json();
}

async function fetchCachedArrayBuffer(path: string): Promise<ArrayBuffer> {
  const response = await fetchCachedResponse(path);
  return response.arrayBuffer();
}

async function fetchCachedResponse(path: string): Promise<Response> {
  const url = assetUrl(path);
  if (!canUseCacheStorage()) throw new Error("이 브라우저는 Cache Storage를 지원하지 않습니다.");
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(url);
  if (!cached) throw new Error(`${path} 캐시가 없습니다. 도구함에서 모델 캐시 준비를 다시 실행해주세요.`);
  return cached.clone();
}

function assetUrl(path: string) {
  return `${HF_RESOLVE_BASE}/${path}`;
}

function canUseCacheStorage() {
  return typeof window !== "undefined" && "caches" in window;
}

function assetStatusBase(cachedCount: number, lastError?: string): SupertonicAssetStatus {
  return {
    cached: cachedCount === ASSETS.length,
    cachedCount,
    totalCount: ASSETS.length,
    estimatedBytes: ASSETS.reduce((sum, asset) => sum + asset.bytes, 0),
    lastError,
  };
}

function audioCacheStatusBase(): SupertonicAudioCacheStatus {
  return {
    cachedCount: 0,
    totalBytes: 0,
    limitBytes: AUDIO_CACHE_LIMIT_BYTES,
    maxEntries: AUDIO_CACHE_MAX_ENTRIES,
  };
}

function unavailable(backend: SupertonicBackend, reasonKo: string): SupertonicRuntimeStatus {
  return {
    supported: false,
    backend,
    ready: false,
    reasonKo,
    costNoteKo: "Supertonic 모델을 내려받지 않습니다.",
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
