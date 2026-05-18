import { useStore } from "./store";

export const SUPERTONIC_CONSENT_VERSION = "supertonic-openrail-m-2026-05";
export const SUPERTONIC_ESTIMATED_MODEL_MB = 404;
export const SUPERTONIC_GITHUB_URL = "https://github.com/supertone-inc/supertonic";
export const SUPERTONIC_MODEL_URL = "https://huggingface.co/Supertone/supertonic-3";
export const SUPERTONIC_MODEL_LICENSE_URL = "https://huggingface.co/Supertone/supertonic-3/blob/main/LICENSE";

export type SupertonicBackend = "webgpu" | "wasm" | "unsupported";

export interface SupertonicRuntimeStatus {
  supported: boolean;
  backend: SupertonicBackend;
  ready: boolean;
  reasonKo: string;
  costNoteKo: string;
}

export interface SupertonicSpeakResult {
  started: boolean;
  reasonKo?: string;
}

export function supertonicRuntimeStatus(): SupertonicRuntimeStatus {
  if (typeof window === "undefined") {
    return unavailable("unsupported", "브라우저 환경에서만 사용할 수 있습니다.");
  }

  if ("gpu" in navigator) {
    return {
      supported: true,
      backend: "webgpu",
      ready: false,
      reasonKo: "WebGPU 사용 가능 기기입니다. 모델 지연 다운로드 어댑터를 붙이면 고품질 TTS를 시도할 수 있습니다.",
      costNoteKo: "현재 앱 번들에는 모델을 포함하지 않아 추가 다운로드 비용이 발생하지 않습니다.",
    };
  }

  if (typeof WebAssembly !== "undefined") {
    return {
      supported: true,
      backend: "wasm",
      ready: false,
      reasonKo: "WebGPU는 없지만 WebAssembly fallback 후보입니다. 속도가 느릴 수 있어 짧은 문장부터 테스트해야 합니다.",
      costNoteKo: "현재 앱 번들에는 모델을 포함하지 않아 추가 다운로드 비용이 발생하지 않습니다.",
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

export function supertonicNoticeItems(): string[] {
  return [
    "기본 TTS는 계속 유지하고, Supertonic은 조건을 확인한 사용자에게만 시도합니다.",
    `모델 자산은 약 ${SUPERTONIC_ESTIMATED_MODEL_MB}MB 수준이라 기본 번들에 포함하지 않습니다.`,
    "모델은 OpenRAIL-M 조건을 따르며 불법·사칭·괴롭힘·차별·의료/법률 판단 등 금지 용도로 사용할 수 없습니다.",
    "실패하거나 기기가 지원하지 않으면 자동으로 기존 시스템 TTS로 돌아갑니다.",
  ];
}

export async function trySpeakWithSupertonic(): Promise<SupertonicSpeakResult> {
  const status = supertonicRuntimeStatus();
  if (!supertonicConsentAccepted()) {
    return { started: false, reasonKo: "Supertonic 조건 확인이 완료되지 않아 시스템 TTS로 재생합니다." };
  }
  if (!status.supported) {
    return { started: false, reasonKo: status.reasonKo };
  }

  return {
    started: false,
    reasonKo: "Supertonic 안전 레일은 준비되었지만 모델 지연 다운로드/ONNX 어댑터는 아직 연결하지 않았습니다. 시스템 TTS로 안전하게 폴백합니다.",
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
