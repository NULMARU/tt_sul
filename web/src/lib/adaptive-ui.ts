import type { AdaptiveUiPatch, LearnerProfile, UserState } from "@shared/types/schema";

export function buildAdaptiveUiPatches(state: Pick<UserState, "learnerProfile" | "adaptiveUiPatches" | "prefs" | "learningSignals">): AdaptiveUiPatch[] {
  if (state.prefs.adaptiveUiLevel === "off") return [];
  const profile = state.learnerProfile;
  if (!profile) return [];
  const existing = state.adaptiveUiPatches ?? [];
  const candidates = [
    nightAudioPatch(profile, state.learningSignals.length),
    produceHintPatch(profile, state.learningSignals.length),
    weakMemorySortPatch(profile, state.learningSignals.length),
  ].filter((p): p is AdaptiveUiPatch => !!p);

  return candidates.filter(candidate => {
    const prior = existing.find(p => p.id === candidate.id);
    if (!prior) return true;
    if (prior.status === "rejected" && !canReoffer(prior)) return false;
    return prior.status !== "active";
  });
}

export function activePatch(
  patches: AdaptiveUiPatch[] | undefined,
  surface: AdaptiveUiPatch["surface"],
  changeType?: AdaptiveUiPatch["changeType"],
): AdaptiveUiPatch | undefined {
  const now = Date.now();
  return (patches ?? []).find(p =>
    p.status === "active" &&
    p.surface === surface &&
    (!changeType || p.changeType === changeType) &&
    (!p.expiresAt || new Date(p.expiresAt).getTime() > now)
  );
}

function nightAudioPatch(profile: LearnerProfile, signals: number): AdaptiveUiPatch | null {
  if (profile.recommendationAffinity.night !== "audio-only" || signals < 5) return null;
  return makePatch({
    id: "aui-home-night-audio-cta",
    surface: "home",
    changeType: "change_cta_priority",
    reason: "밤 시간대에는 짧게 듣거나 복습하는 흐름이 더 잘 맞습니다.",
    metric: "night_affinity_audio",
    signals,
    payload: { band: "night", primaryMode: "audio-only" },
  });
}

function produceHintPatch(profile: LearnerProfile, signals: number): AdaptiveUiPatch | null {
  if (!profile.fragileModes.includes("produce") || signals < 5) return null;
  return makePatch({
    id: "aui-lesson-produce-hint",
    surface: "lesson",
    changeType: "show_hint",
    reason: "출력 단계에서 이탈이 보여 예문 힌트를 먼저 보여줍니다.",
    metric: "produce_fragile",
    signals,
    payload: { step: "produce", hintLevel: "early" },
  });
}

function weakMemorySortPatch(profile: LearnerProfile, signals: number): AdaptiveUiPatch | null {
  if (profile.weakPhraseIds.length < 3 || signals < 5) return null;
  return makePatch({
    id: "aui-memory-weak-first",
    surface: "memory-map",
    changeType: "change_default_filter",
    reason: "최근 약한 표현을 먼저 복습할 수 있게 정렬합니다.",
    metric: "weak_phrase_count",
    signals,
    payload: { sort: "weak-first" },
  });
}

function makePatch(input: {
  id: string;
  surface: AdaptiveUiPatch["surface"];
  changeType: AdaptiveUiPatch["changeType"];
  reason: string;
  metric: string;
  signals: number;
  payload: AdaptiveUiPatch["payload"];
}): AdaptiveUiPatch {
  const createdAt = new Date().toISOString();
  return {
    id: input.id,
    createdAt,
    source: "local",
    status: "active",
    surface: input.surface,
    changeType: input.changeType,
    reason: input.reason,
    evidence: {
      signals: input.signals,
      windowDays: 14,
      metric: input.metric,
    },
    payload: input.payload,
    expiresAt: new Date(Date.now() + 14 * 86_400_000).toISOString(),
  };
}

function canReoffer(patch: AdaptiveUiPatch): boolean {
  return Date.now() - new Date(patch.createdAt).getTime() > 14 * 86_400_000;
}
