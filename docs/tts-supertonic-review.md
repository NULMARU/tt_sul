# Supertonic TTS 검토

검토일: 2026-05-18

## 결론

Supertonic은 현재 앱에 “선택형 고품질 온디바이스 TTS”로 붙이기 좋은 후보입니다. 다만 기본 TTS로 바로 교체하기보다는, 기존 Web Speech API를 기본값으로 유지하고 Supertonic은 사용자가 다운로드 크기와 라이선스 고지를 확인한 뒤 켜는 실험 기능으로 붙이는 것을 권장합니다.

## 비용 판단

- 모델 자체는 호출당 과금되는 클라우드 API가 아니므로, 라이선스 조건을 지키는 범위에서 별도 API 사용료는 발생하지 않습니다.
- 다만 GitHub Pages 또는 별도 스토리지에서 모델 파일을 제공하면 다운로드 트래픽이 늘 수 있고, 사용자 기기에는 약 398MB 수준의 저장공간과 배터리/성능 부담이 생길 수 있습니다.
- 현재 구현은 모델 파일을 앱 번들에 포함하지 않고, 사용자가 도구함에서 `모델 캐시 준비`를 누를 때만 Hugging Face 모델 자산을 Cache Storage에 저장합니다. 합성 실행 중 캐시가 없으면 재다운로드하지 않고 시스템 TTS로 fallback합니다.
- ONNX Runtime Web 실행 파일은 배포 산출물에 포함되지만 PWA 사전 캐시 대상에서는 제외했습니다. Supertonic 합성 경로가 실제로 호출될 때만 런타임 로드를 시도합니다.
- 합성된 음성은 별도 Cache Storage에 최대 96MB, 최대 24개까지만 보관합니다. 같은 글·같은 속도·같은 음성 스타일은 저장된 WAV를 재사용하고, 제한을 넘으면 오래된 음성부터 자동 삭제합니다.

## 적합한 점

- 영어, 한국어, 베트남어, 일본어를 모두 지원하므로 현재 영어 앱과 이후 베트남어/일본어 확장 방향에 잘 맞습니다.
- 클라우드 API 호출 없이 브라우저/디바이스에서 실행할 수 있어 낙서장·개인 학습 문장 음성화에 개인정보 측면 장점이 큽니다.
- Node.js, Browser WebGPU, Python 등 여러 런타임 예제가 있어 현재 PWA와 향후 서버/로컬 도구 실험 모두 가능합니다.
- 44.1kHz WAV 출력과 표현 태그를 지원해 발음 듣기, 쉐도잉, 문장 암송 품질 개선 여지가 있습니다.

## 주의할 점

- 모델 저장소 크기가 약 398MB라 GitHub Pages PWA에 기본 번들로 넣으면 초기 로딩과 저장공간 부담이 큽니다.
- 브라우저 사용은 WebGPU/ONNX Runtime Web 기반이므로 iOS Safari, 구형 Android, 저사양 기기에서 반드시 별도 QA가 필요합니다.
- Cloudflare Worker 같은 경량 서버리스에 모델을 올려 실시간 TTS API로 운영하기에는 모델 크기와 런타임 제약이 큽니다.
- 현재 앱의 `web/src/lib/tts.ts`는 Web Speech API 중심이라 Supertonic을 붙이려면 `TtsProvider` 추상화가 필요합니다.

## 라이선스/조건 요약

- GitHub 예제 코드는 MIT License입니다. 코드 일부를 가져오거나 수정해 배포하면 Supertone의 MIT 저작권/허가 고지를 보존해야 합니다.
- Hugging Face의 Supertonic 3 모델은 OpenRAIL-M License입니다. 모델을 앱과 함께 배포하거나 원격 접근 가능한 서비스로 제공하면 OpenRAIL-M 고지와 사용 제한을 이용약관/고지에 포함해야 합니다.
- 모델 또는 파생 모델 수신자에게 라이선스를 제공하고, 수정한 파일에는 수정 사실을 표시해야 하며, 저작권·특허·상표·귀속 고지를 보존해야 합니다.
- Supertone 상표/로고를 사용하거나 공식 보증처럼 보이게 표현하면 안 됩니다.
- 출력물에 대해 라이선서가 권리를 주장하지는 않지만, 출력물 사용 책임은 앱/사용자에게 있습니다.
- 금지 용도에는 불법 목적, 미성년자 위해, 타인을 해치기 위한 허위정보, 위해 목적의 개인정보 생성/유포, 괴롭힘·명예훼손, 동의 없는 사칭/딥페이크, 법적 권리에 악영향을 주는 완전 자동 의사결정, 차별적 사용, 의료 조언, 사법/법집행/이민 절차 목적 사용 등이 포함됩니다.

## 앱 적용 권장안

1. 1단계: 현재 Web Speech API를 유지하고 `ttsProvider = "system" | "supertonic"` 설정만 준비합니다.
2. 2단계: 도구함에 “고품질 온디바이스 TTS 실험” 토글을 추가하고, 최초 사용 시 모델 크기와 OpenRAIL-M 조건을 안내합니다.
3. 3단계: 모델 파일은 기본 번들에 포함하지 말고 사용자가 켤 때 지연 다운로드하고 Cache Storage/IndexedDB에 저장합니다.
4. 4단계: Supertonic 실패 시 자동으로 기존 Web Speech API로 fallback합니다.
5. 5단계: 영어에서 먼저 발음 품질, 모바일 성능, 로딩 시간, 캐시 용량을 QA한 뒤 베트남어/일본어로 확장합니다.

## 구현 체크리스트

- [x] 기본 TTS 유지 + Supertonic opt-in 설정 레일 추가
- [x] 모델을 기본 번들에 포함하지 않도록 결정
- [x] 모델 크기, OpenRAIL-M, 금지 용도, fallback 고지 UI 추가
- [x] 모델 다운로드 크기, 캐시 상태, 캐시 삭제 UI 추가
- [x] 모델 지연 다운로드 + Cache Storage 저장 추가
- [x] 합성 결과 WAV 캐시, 용량 제한, LRU형 자동 정리, 수동 삭제 UI 추가
- [x] ONNX Runtime Web WebGPU 우선, WASM fallback 어댑터 추가
- [x] Supertonic 실패 시 시스템 TTS fallback 유지
- [x] Supertonic 모델과 예제 코드, ONNX Runtime Web 고지 문서 추가
- [ ] OpenRAIL-M 전문을 앱 내부 고지 또는 약관 문서에 포함
- [ ] “AI/기계 생성 음성” 고지 문구를 사용자-facing 약관/정책으로 분리
- [ ] iOS Safari, Android Chrome, 데스크톱 Chrome에서 실제 모델 캐시/합성 성능 QA
- [ ] 동의 없는 음성 복제/사칭을 방지하는 정책 문구 추가

## 현재 구현 상태

- `web/src/lib/supertonic-tts.ts`: Supertonic 조건 고지, 런타임 감지, opt-in 동의 버전, 모델 자산 캐시, WebGPU/WASM ONNX 합성, 시스템 TTS fallback 레일 추가
- `web/src/lib/supertonic-tts.ts`: 같은 글 반복 듣기용 합성 음성 캐시 추가. 캐시 키는 모델/음성/언어/속도/본문 해시를 기준으로 생성합니다.
- `web/src/lib/tts.ts`: Supertonic 재생 성공 시 오디오 종료까지 TTS 상태를 유지하고, 실패하면 기존 Web Speech API로 자동 fallback
- `web/src/routes/Toolbelt.tsx`: 도구함에 TTS 음성 엔진 카드, 모델 캐시 상태/준비/삭제/테스트 UI 추가
- `docs/third-party-notices.md`: Supertonic 예제 코드, Supertonic 3 모델, ONNX Runtime Web 고지 추가

## 참고 소스

- GitHub: https://github.com/supertone-inc/supertonic
- GitHub License: https://github.com/supertone-inc/supertonic/blob/main/LICENSE
- Hugging Face model: https://huggingface.co/Supertone/supertonic-3
- Hugging Face model license: https://huggingface.co/Supertone/supertonic-3/blob/main/LICENSE
