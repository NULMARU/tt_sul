import type { LanguageConfig, LanguageId } from "../types/schema";

export const LANGUAGE_SEQUENCE: LanguageId[] = ["en", "vi", "ja"];

export const LANGUAGES: LanguageConfig[] = [
  {
    id: "en",
    nameKo: "영어",
    nameNative: "English",
    targetLocale: "en-US",
    nativeLocale: "ko-KR",
    script: "latin",
    developmentOrder: 1,
    status: "active",
    defaultCourseLevel: "beginner",
    supportsWordArrange: true,
    supportsDictation: true,
    supportsRomanization: false,
    notes: [
      "현재 주 개발 언어입니다.",
      "초급-중급-상급 구조를 먼저 완성하고 충분히 테스트한 뒤 다른 언어로 확장합니다.",
    ],
  },
  {
    id: "vi",
    nameKo: "베트남어",
    nameNative: "Tiếng Việt",
    targetLocale: "vi-VN",
    nativeLocale: "ko-KR",
    script: "vietnamese",
    developmentOrder: 2,
    status: "planned",
    defaultCourseLevel: "beginner",
    supportsWordArrange: true,
    supportsDictation: true,
    supportsRomanization: true,
    notes: [
      "영어 과정 안정화 후 첫 번째 확장 언어입니다.",
      "성조 부호, 발음, 지역별 표현 차이를 정답 판정과 TTS/STT에 반영해야 합니다.",
    ],
  },
  {
    id: "ja",
    nameKo: "일본어",
    nameNative: "日本語",
    targetLocale: "ja-JP",
    nativeLocale: "ko-KR",
    script: "japanese",
    developmentOrder: 3,
    status: "planned",
    defaultCourseLevel: "beginner",
    supportsWordArrange: false,
    supportsDictation: true,
    supportsRomanization: true,
    notes: [
      "베트남어 확장 이후 세 번째 개발 순서입니다.",
      "히라가나, 가타카나, 한자, 후리가나, 존댓말을 콘텐츠와 퀴즈 모델에 반영해야 합니다.",
    ],
  },
];

export const LANGUAGE_BY_ID = Object.fromEntries(LANGUAGES.map(language => [language.id, language])) as Record<LanguageId, LanguageConfig>;
