import type { CourseLevel, PromotionExamBlueprint } from "../types/schema";

export const COURSE_LEVELS: CourseLevel[] = [
  {
    id: "beginner",
    title: "Stage 1 · 초급 과정",
    shortTitle: "초급",
    description: "내 하루와 생활 동작을 짧은 영어 문장으로 말합니다.",
    learnerGoal: "짧게 자주 말하고 쓰면서 생활 영어 회로를 만든다.",
    primaryLoop: "phrase-circuit",
    recommendedFor: ["영어 말문이 막히는 학습자", "한 문장부터 다시 시작하고 싶은 학습자", "일상 루틴을 영어로 말하고 싶은 학습자"],
    entryRoute: "/axis/day",
  },
  {
    id: "intermediate",
    title: "Stage 2 · 중급 과정",
    shortTitle: "중급",
    description: "상황별 A/B 대화를 암송하고 역할을 바꿔 말합니다.",
    learnerGoal: "6-10턴 대화와 짧은 뉴스형 글을 듣고, 요지를 잡고, 내 말로 답한다.",
    primaryLoop: "dialogue-recitation",
    recommendedFor: ["짧은 문장은 가능하지만 대화가 이어지지 않는 학습자", "뉴스·문화 주제를 쉬운 영어로 읽고 싶은 학습자", "암송과 역할극으로 출력량을 늘리고 싶은 학습자"],
    entryRoute: "/intermediate",
  },
  {
    id: "advanced",
    title: "Stage 3 · 상급 과정",
    shortTitle: "상급",
    description: "긴 글을 이해하고 의견, 근거, 반박을 말하고 씁니다.",
    learnerGoal: "뉴스, 업무, 사회 이슈에 대해 구조 있게 말하고 평가받는다.",
    primaryLoop: "article-debate",
    recommendedFor: ["일상 대화 다음의 의견 말하기가 필요한 학습자", "업무/토론/발표 영어를 준비하는 학습자", "긴 글 요약과 발화 평가가 필요한 학습자"],
    entryRoute: "/advanced",
  },
];

export const COURSE_LEVEL_BY_ID = Object.fromEntries(COURSE_LEVELS.map(level => [level.id, level])) as Record<string, CourseLevel>;

export const PROMOTION_EXAMS: PromotionExamBlueprint[] = [
  {
    id: "placement-map",
    kind: "placement",
    levelId: "beginner",
    title: "레벨 탐험전",
    description: "현재 내 영어 출력 습관을 가볍게 점검합니다. 결과는 추천일 뿐이고, 모든 과정은 자유롭게 선택할 수 있어요.",
    gameTheme: "지도 조각을 모아 내 출발 지점을 찾는 미션",
    passingScore: 70,
    sections: [
      {
        id: "phrase-gate",
        type: "phrase-recall",
        title: "문장 기억 관문",
        instruction: "한국어 뜻을 보고 가장 자연스러운 영어 문장을 떠올립니다.",
        points: 20,
      },
      {
        id: "story-key",
        type: "story-comprehension",
        title: "스토리 열쇠",
        instruction: "짧은 글의 핵심 의미를 고릅니다.",
        points: 20,
      },
      {
        id: "dialogue-bridge",
        type: "dialogue-response",
        title: "대화 다리",
        instruction: "상대방 말에 이어질 자연스러운 답을 고릅니다.",
        points: 20,
      },
      {
        id: "scratchpad-orb",
        type: "writing",
        title: "낙서장 구슬",
        instruction: "오늘 나에 대한 영어 문장을 직접 씁니다.",
        points: 20,
      },
      {
        id: "opinion-badge",
        type: "opinion",
        title: "의견 배지",
        instruction: "간단한 질문에 이유를 붙여 답합니다.",
        points: 20,
      },
    ],
  },
  {
    id: "beginner-promotion",
    kind: "promotion",
    levelId: "beginner",
    targetLevelId: "intermediate",
    title: "초급 졸업 미션",
    description: "생활 표현, 스토리 이해, 짧은 작문을 게임처럼 점검합니다. 결과는 저장되고 다음 학습 피드백에 반영됩니다.",
    gameTheme: "생활 영어 회로를 완성해 중급 대화문으로 넘어가는 미션",
    passingScore: 75,
    sections: [
      {
        id: "daily-phrase",
        type: "phrase-recall",
        title: "생활 표현 스파크",
        instruction: "초급 핵심 표현을 다시 꺼냅니다.",
        points: 25,
      },
      {
        id: "daily-story",
        type: "story-comprehension",
        title: "스토리 체크포인트",
        instruction: "일상 스토리의 의미를 확인합니다.",
        points: 25,
      },
      {
        id: "daily-writing",
        type: "writing",
        title: "내 하루 기록",
        instruction: "내 일상을 한두 문장으로 씁니다.",
        points: 25,
      },
      {
        id: "daily-response",
        type: "dialogue-response",
        title: "대화 첫걸음",
        instruction: "상황에 맞는 짧은 응답을 고릅니다.",
        points: 25,
      },
    ],
  },
  {
    id: "intermediate-promotion",
    kind: "promotion",
    levelId: "intermediate",
    targetLevelId: "advanced",
    title: "중급 졸업 미션",
    description: "대화 응답, 짧은 의견, 상황 설명을 확인합니다. 통과 여부와 관계없이 상급 과정은 자유롭게 선택할 수 있습니다.",
    gameTheme: "대화의 방을 통과해 의견 말하기 무대로 올라가는 미션",
    passingScore: 75,
    sections: [
      {
        id: "role-response",
        type: "dialogue-response",
        title: "역할 응답",
        instruction: "상대 대사 뒤에 올 가장 자연스러운 답을 고릅니다.",
        points: 25,
      },
      {
        id: "story-logic",
        type: "story-comprehension",
        title: "흐름 읽기",
        instruction: "대화나 글의 의도를 파악합니다.",
        points: 25,
      },
      {
        id: "situation-writing",
        type: "writing",
        title: "상황 설명",
        instruction: "상황을 2-3문장으로 설명합니다.",
        points: 25,
      },
      {
        id: "short-opinion",
        type: "opinion",
        title: "짧은 의견",
        instruction: "질문에 이유를 붙여 답합니다.",
        points: 25,
      },
    ],
  },
];

export const PROMOTION_EXAM_BY_ID = Object.fromEntries(PROMOTION_EXAMS.map(exam => [exam.id, exam])) as Record<string, PromotionExamBlueprint>;
