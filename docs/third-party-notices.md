# Third-Party Notices

Updated: 2026-05-18

This project uses and/or interoperates with the following third-party components for optional text-to-speech functionality.

## ONNX Runtime Web

- Package: `onnxruntime-web`
- Publisher: Microsoft
- License: MIT
- Source: https://www.npmjs.com/package/onnxruntime-web

ONNX Runtime Web is used to run ONNX models in the browser when the user explicitly enables and prepares the optional Supertonic TTS path.

## Supertonic Example Code

- Project: Supertonic
- Publisher: Supertone Inc.
- License: MIT
- Source: https://github.com/supertone-inc/supertonic

The browser ONNX adapter in Sulsul+ follows the public Supertonic web example architecture: text normalization, Unicode indexing, ONNX session execution, latent denoising, vocoder output, and WAV creation. Sulsul+ adapts this flow to a consent-gated, lazy-loaded, Cache Storage based PWA integration.

## Supertonic 3 Model

- Model: `Supertone/supertonic-3`
- Publisher: Supertone Inc.
- License: OpenRAIL-M
- Model page: https://huggingface.co/Supertone/supertonic-3
- License page: https://huggingface.co/Supertone/supertonic-3/blob/main/LICENSE

The model is not bundled into the app by default. If a user chooses `Supertonic 준비` and then `모델 캐시 준비`, the app downloads the required model assets from Hugging Face and stores them in the browser Cache Storage on that device.

Use restrictions include prohibitions against illegal, harmful, deceptive, discriminatory, non-consensual impersonation, medical/legal decisioning, and other restricted uses described in the OpenRAIL-M license. Sulsul+ uses this model only as an optional learner-controlled speech output feature for language practice.
