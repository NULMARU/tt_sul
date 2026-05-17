import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PHRASES } from "@shared/data/phrases.seed";
import { STORIES } from "@shared/data/stories.seed";
import { COURSE_LEVEL_BY_ID, PROMOTION_EXAM_BY_ID } from "@shared/data/course-levels.seed";
import type {
  CourseLevelId,
  PromotionExamAttempt,
  PromotionExamBlueprint,
  PromotionExamSectionBlueprint,
  PromotionExamSectionType,
} from "@shared/types/schema";
import { useStore } from "../lib/store";

type Mission =
  | {
      section: PromotionExamSectionBlueprint;
      prompt: string;
      choices: string[];
      answer: string;
      explanation: string;
    }
  | {
      section: PromotionExamSectionBlueprint;
      prompt: string;
      minWords: number;
      kind: "free";
      sample: string;
    };

type AnswerMap = Record<string, string>;

const DIALOGUE_POOL = [
  {
    prompt: "A: I am looking for a place to have lunch. What would you say?",
    answer: "What kind of food are you in the mood for?",
    choices: [
      "What kind of food are you in the mood for?",
      "I wake up at seven.",
      "The weather is very cloudy.",
      "I need to check my passport.",
    ],
    explanation: "상대가 점심 장소를 찾고 있으므로 음식 종류를 묻는 응답이 자연스럽습니다.",
  },
  {
    prompt: "A: Could you help me find the subway station? What would you say?",
    answer: "Sure. It is just around the corner.",
    choices: [
      "Sure. It is just around the corner.",
      "I usually drink coffee in the morning.",
      "That shirt looks too old-fashioned.",
      "I am going to sleep soon.",
    ],
    explanation: "길을 묻는 상황에서는 위치를 알려주는 응답이 맞습니다.",
  },
  {
    prompt: "A: I am nervous about speaking English. What would you say?",
    answer: "Do not worry. Let us practice together.",
    choices: [
      "Do not worry. Let us practice together.",
      "The bus stop is just ahead.",
      "I would like a window seat.",
      "This item is out of stock.",
    ],
    explanation: "상대의 감정에 반응하고 함께 연습하자고 제안하는 답이 자연스럽습니다.",
  },
  {
    prompt: "A: Do you have any recommendations nearby? What would you say?",
    answer: "Yes, there is a small cafe two blocks away.",
    choices: [
      "Yes, there is a small cafe two blocks away.",
      "I forgot to set my alarm.",
      "I am not going to wait.",
      "I used to skip breakfast.",
    ],
    explanation: "추천을 요청했으므로 가까운 장소를 제안하는 응답이 맞습니다.",
  },
];

const WRITING_PROMPTS = [
  {
    prompt: "오늘 하루에 대해 영어로 한두 문장을 써보세요.",
    minWords: 6,
    sample: "I had a busy day, but I took a short walk after work.",
  },
  {
    prompt: "요즘 자주 하는 일이나 습관을 영어로 써보세요.",
    minWords: 6,
    sample: "I usually drink coffee in the morning and check my messages.",
  },
  {
    prompt: "가고 싶은 장소와 이유를 영어로 써보세요.",
    minWords: 8,
    sample: "I want to visit a quiet park because I need some fresh air.",
  },
];

const OPINION_PROMPTS = [
  {
    prompt: "Which is better for learning English: reading or speaking? Add one reason.",
    minWords: 10,
    sample: "Speaking is better for me because I need to practice output every day.",
  },
  {
    prompt: "Do you prefer studying alone or with a partner? Add one reason.",
    minWords: 10,
    sample: "I prefer studying with a partner because conversation feels more real.",
  },
  {
    prompt: "What daily habit helps you improve your English? Add one reason.",
    minWords: 10,
    sample: "Writing a short journal helps me because I can use my own life.",
  },
];

export function PromotionExam() {
  const { id } = useParams();
  const nav = useNavigate();
  const recordAttempt = useStore(s => s.recordPromotionExamAttempt);
  const setCurrentCourseLevel = useStore(s => s.setCurrentCourseLevel);
  const exam = id ? PROMOTION_EXAM_BY_ID[id] : undefined;
  const [seed] = useState(() => Date.now());
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [attempt, setAttempt] = useState<PromotionExamAttempt | null>(null);

  const missions = useMemo(() => exam ? buildMissions(exam, seed) : [], [exam, seed]);

  useEffect(() => {
    if (attempt) window.scrollTo({ top: 0, left: 0 });
  }, [attempt]);

  if (!exam) {
    return (
      <div className="px-6 py-12 text-center text-text-muted">
        시험을 찾을 수 없어요.
      </div>
    );
  }

  const currentExam = exam;
  const level = COURSE_LEVEL_BY_ID[exam.levelId];
  const targetLevel = exam.targetLevelId ? COURSE_LEVEL_BY_ID[exam.targetLevelId] : undefined;
  const answeredCount = missions.filter(mission => (answers[mission.section.id] ?? "").trim()).length;
  const canFinish = answeredCount === missions.length;

  function finish() {
    const nextAttempt = buildAttempt(currentExam, missions, answers, seed);
    recordAttempt(nextAttempt);
    setAttempt(nextAttempt);
  }

  if (attempt) {
    const recommended = COURSE_LEVEL_BY_ID[attempt.recommendedLevel];
    return (
      <div className="px-5 pt-6 pb-4 flex flex-col gap-4">
        <header className="flex items-center gap-3">
          <button onClick={() => nav("/axis/stage")} className="w-9 h-9 rounded-full hover:bg-surface-2">←</button>
          <div>
            <div className="text-xs text-text-muted">미션 결과 저장 완료</div>
            <h1 className="text-xl font-bold">{exam.title}</h1>
          </div>
        </header>

        <section className="rounded-2xl border border-accent/50 bg-accent/10 p-5 text-center">
          <div className="text-5xl mb-2">{attempt.passed ? "🏆" : "🧭"}</div>
          <div className="text-sm text-text-muted">최종 점수</div>
          <div className="text-3xl font-bold mt-1">{attempt.totalScore}/{attempt.maxScore}</div>
          <div className="mt-2 font-semibold">
            {attempt.passed ? "미션 통과" : "연습 방향 확인"}
          </div>
          <p className="text-sm text-text-muted mt-1">
            추천 과정은 {recommended?.shortTitle ?? attempt.recommendedLevel}입니다. 과정 선택은 언제든 자유롭게 바꿀 수 있어요.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-4">
          <h2 className="font-semibold">피드백</h2>
          <ul className="mt-2 flex flex-col gap-2 text-sm text-text-muted">
            {attempt.feedback.map(item => <li key={item}>{item}</li>)}
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-4">
          <h2 className="font-semibold">미션별 결과</h2>
          <div className="mt-2 flex flex-col gap-2">
            {attempt.sectionResults.map(result => (
              <div key={result.sectionId} className="rounded-xl bg-surface-2 p-3 text-sm">
                <div className="font-medium">{sectionTypeLabel(result.type)} · {result.score}/{result.maxScore}</div>
                <div className="text-text-muted mt-0.5">{result.feedback}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => {
              setCurrentCourseLevel(attempt.recommendedLevel);
              nav("/axis/stage");
            }}
            className="rounded-xl bg-accent text-[#2A2522] px-3 py-3 text-sm font-medium"
          >
            추천 과정 선택
          </button>
          <button
            onClick={() => nav(targetLevel?.entryRoute ?? level?.entryRoute ?? "/axis/stage")}
            className="rounded-xl border border-border bg-surface px-3 py-3 text-sm font-medium"
          >
            학습으로 이동
          </button>
          <button
            onClick={() => nav("/exam-history")}
            className="rounded-xl border border-border bg-surface px-3 py-3 text-sm font-medium"
          >
            기록 보기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-4 flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <button onClick={() => nav("/axis/stage")} className="w-9 h-9 rounded-full hover:bg-surface-2">←</button>
        <div>
          <div className="text-xs text-text-muted">
            {level?.shortTitle} {targetLevel ? `→ ${targetLevel.shortTitle}` : "레벨테스트"}
          </div>
          <h1 className="text-xl font-bold">{exam.title}</h1>
        </div>
      </header>

      <section className="rounded-2xl border border-border bg-surface p-4">
        <div className="text-xs text-accent-strong font-semibold">게임 테마</div>
        <p className="mt-1 font-medium">{exam.gameTheme}</p>
        <p className="text-sm text-text-muted mt-1">{exam.description}</p>
        <div className="mt-3 h-2 rounded-full bg-surface-2 overflow-hidden">
          <div className="h-full bg-accent transition-[width]" style={{ width: `${(answeredCount / missions.length) * 100}%` }} />
        </div>
        <div className="mt-1 text-xs text-text-muted">{answeredCount}/{missions.length} 미션 완료</div>
      </section>

      {missions.map((mission, index) => (
        <MissionCard
          key={mission.section.id}
          index={index}
          mission={mission}
          answer={answers[mission.section.id] ?? ""}
          onAnswer={value => setAnswers(prev => ({ ...prev, [mission.section.id]: value }))}
        />
      ))}

      <button
        onClick={finish}
        disabled={!canFinish}
        className="rounded-xl bg-accent text-[#2A2522] px-4 py-3 font-medium disabled:opacity-40"
      >
        미션 완료하고 결과 저장
      </button>
      <p className="text-xs text-text-muted text-center">
        이 시험은 레벨 확인용입니다. 통과 여부와 관계없이 모든 과정은 자율적으로 선택할 수 있습니다.
      </p>
    </div>
  );
}

function MissionCard({
  index,
  mission,
  answer,
  onAnswer,
}: {
  index: number;
  mission: Mission;
  answer: string;
  onAnswer: (value: string) => void;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/40 flex items-center justify-center font-bold">
          {index + 1}
        </div>
        <div className="flex-1">
          <div className="text-xs text-text-muted">{sectionTypeLabel(mission.section.type)} · {mission.section.points}점</div>
          <h2 className="font-semibold">{mission.section.title}</h2>
          <p className="text-sm text-text-muted mt-0.5">{mission.section.instruction}</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-surface-2 p-3 text-sm">
        {mission.prompt}
      </div>

      {"choices" in mission ? (
        <div className="mt-3 grid gap-2">
          {mission.choices.map(choice => (
            <button
              key={choice}
              onClick={() => onAnswer(choice)}
              className={`rounded-xl border px-3 py-2.5 text-left text-sm ${
                answer === choice ? "border-accent bg-accent/15" : "border-border bg-surface-2"
              }`}
            >
              {choice}
            </button>
          ))}
        </div>
      ) : (
        <textarea
          value={answer}
          onChange={e => onAnswer(e.target.value)}
          rows={4}
          placeholder={mission.sample}
          className="mt-3 w-full rounded-xl border-2 border-border bg-surface-2 p-3 outline-none focus:border-accent"
        />
      )}
    </section>
  );
}

function buildMissions(exam: PromotionExamBlueprint, seed: number): Mission[] {
  const rng = mulberry32(seed);
  return exam.sections.map(section => {
    if (section.type === "phrase-recall") return buildPhraseMission(section, rng);
    if (section.type === "story-comprehension") return buildStoryMission(section, rng);
    if (section.type === "dialogue-response") return buildDialogueMission(section, rng);
    if (section.type === "opinion") return buildFreeMission(section, rng, OPINION_PROMPTS);
    return buildFreeMission(section, rng, WRITING_PROMPTS);
  });
}

function buildPhraseMission(section: PromotionExamSectionBlueprint, rng: () => number): Mission {
  const phrase = pick(PHRASES, rng);
  const distractors = shuffle(PHRASES.filter(p => p.id !== phrase.id), rng).slice(0, 3).map(p => p.en);
  return {
    section,
    prompt: phrase.ko,
    choices: shuffle([phrase.en, ...distractors], rng),
    answer: phrase.en,
    explanation: `${phrase.ko} → ${phrase.en}`,
  };
}

function buildStoryMission(section: PromotionExamSectionBlueprint, rng: () => number): Mission {
  const story = pick(STORIES.filter(s => s.comprehension), rng);
  const inference = story.comprehension!.inference;
  return {
    section,
    prompt: `${story.title}: ${inference.question}`,
    choices: inference.choices,
    answer: inference.choices[inference.answer],
    explanation: `스토리 "${story.title}"의 흐름을 확인하는 문제입니다.`,
  };
}

function buildDialogueMission(section: PromotionExamSectionBlueprint, rng: () => number): Mission {
  const item = pick(DIALOGUE_POOL, rng);
  return {
    section,
    prompt: item.prompt,
    choices: shuffle(item.choices, rng),
    answer: item.answer,
    explanation: item.explanation,
  };
}

function buildFreeMission(
  section: PromotionExamSectionBlueprint,
  rng: () => number,
  pool: typeof WRITING_PROMPTS,
): Mission {
  const item = pick(pool, rng);
  return {
    section,
    prompt: item.prompt,
    minWords: item.minWords,
    kind: "free",
    sample: item.sample,
  };
}

function buildAttempt(exam: PromotionExamBlueprint, missions: Mission[], answers: AnswerMap, seed: number): PromotionExamAttempt {
  const startedAt = new Date(seed).toISOString();
  const completedAt = new Date().toISOString();
  const sectionResults = missions.map(mission => scoreMission(mission, answers[mission.section.id] ?? ""));
  const totalScore = sectionResults.reduce((sum, result) => sum + result.score, 0);
  const maxScore = sectionResults.reduce((sum, result) => sum + result.maxScore, 0);
  const percent = maxScore ? Math.round((totalScore / maxScore) * 100) : 0;
  const passed = percent >= exam.passingScore;
  const recommendedLevel = recommendLevel(exam, percent);
  return {
    id: `exam-${seed}`,
    examId: exam.id,
    kind: exam.kind,
    levelId: exam.levelId,
    targetLevelId: exam.targetLevelId,
    startedAt,
    completedAt,
    seed,
    totalScore,
    maxScore,
    passed,
    recommendedLevel,
    sectionResults,
    feedback: buildFeedback(exam, percent, sectionResults, recommendedLevel),
  };
}

function scoreMission(mission: Mission, rawAnswer: string): PromotionExamAttempt["sectionResults"][number] {
  if ("choices" in mission) {
    const correct = normalize(rawAnswer) === normalize(mission.answer);
    return {
      sectionId: mission.section.id,
      type: mission.section.type,
      score: correct ? mission.section.points : 0,
      maxScore: mission.section.points,
      feedback: correct ? `정답입니다. ${mission.explanation}` : `다시 볼 표현입니다. ${mission.explanation}`,
    };
  }

  const words = rawAnswer.split(/\s+/).filter(Boolean).length;
  const hasConnector = /\b(and|but|because|so|if|when|while|then)\b/i.test(rawAnswer);
  const hasSubject = /\b(I|My|The|It|This|There|We|You)\b/.test(rawAnswer);
  let ratio = 0;
  if (words >= mission.minWords) ratio += 0.55;
  else ratio += Math.min(0.45, words / Math.max(1, mission.minWords) * 0.45);
  if (hasSubject) ratio += 0.2;
  if (hasConnector) ratio += 0.25;
  const score = Math.min(mission.section.points, Math.round(mission.section.points * ratio));
  return {
    sectionId: mission.section.id,
    type: mission.section.type,
    score,
    maxScore: mission.section.points,
    feedback: score >= mission.section.points * 0.75
      ? "자기 생각을 영어로 꺼내는 힘이 좋습니다."
      : "짧아도 괜찮으니 주어와 이유를 붙여 다시 연습하면 좋아요.",
  };
}

function recommendLevel(exam: PromotionExamBlueprint, percent: number): CourseLevelId {
  if (exam.kind === "promotion") {
    return percent >= exam.passingScore ? exam.targetLevelId ?? exam.levelId : exam.levelId;
  }
  if (percent >= 85) return "advanced";
  if (percent >= 60) return "intermediate";
  return "beginner";
}

function buildFeedback(
  exam: PromotionExamBlueprint,
  percent: number,
  results: PromotionExamAttempt["sectionResults"],
  recommendedLevel: CourseLevelId,
): string[] {
  const weak = results.filter(result => result.score < result.maxScore * 0.6).map(result => sectionTypeLabel(result.type));
  const feedback = [
    `${percent}점 기준으로 ${levelLabel(recommendedLevel)} 과정이 가장 잘 맞아 보입니다.`,
    exam.kind === "placement"
      ? "레벨테스트 결과는 추천용입니다. 초급, 중급, 상급은 언제든 직접 선택할 수 있습니다."
      : "승급 미션은 학습 방향을 알려주는 기록입니다. 통과 여부가 과정 이용을 막지는 않습니다.",
  ];
  if (weak.length > 0) feedback.push(`다음 복습 초점: ${Array.from(new Set(weak)).join(", ")}`);
  else feedback.push("모든 미션을 고르게 통과했습니다. 다음 단계 콘텐츠를 시도해도 좋습니다.");
  return feedback;
}

function sectionTypeLabel(type: PromotionExamSectionType): string {
  if (type === "phrase-recall") return "표현 회상";
  if (type === "story-comprehension") return "이해";
  if (type === "dialogue-response") return "대화";
  if (type === "writing") return "작문";
  return "의견";
}

function levelLabel(levelId: CourseLevelId): string {
  if (levelId === "beginner") return "초급";
  if (levelId === "intermediate") return "중급";
  return "상급";
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^\w\s']/g, "").replace(/\s+/g, " ").trim();
}

function pick<T>(items: T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length)];
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  return items
    .map(item => ({ item, sort: rng() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

function mulberry32(seed: number): () => number {
  let value = seed;
  return () => {
    value |= 0;
    value = value + 0x6D2B79F5 | 0;
    let t = Math.imul(value ^ value >>> 15, 1 | value);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
