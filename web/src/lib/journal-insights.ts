import type { CourseLevelId, JournalEntry, JournalInsight, WritingMistakeNote } from "@shared/types/schema";

const TOPIC_PATTERNS: Array<{ id: string; label: string; patterns: RegExp[] }> = [
  { id: "work", label: "업무", patterns: [/work|office|meeting|email|report|task|boss|coworker/i] },
  { id: "space-industry", label: "우주산업", patterns: [/space|rocket|satellite|orbit|moon|lunar|mars|nasa|spacex|astronaut|aerospace|launch|우주|로켓|위성|달\s?탐사/i] },
  { id: "tech-ai", label: "기술/AI", patterns: [/ai|artificial intelligence|robot|automation|software|app|data|digital|technology|tech|algorithm|인공지능|기술|로봇/i] },
  { id: "global-trends", label: "글로벌 트렌드", patterns: [/global|world|international|news|trend|reddit|community|viral|current events?|geopolitics|글로벌|세계|국제|뉴스|트렌드|커뮤니티|시사/i] },
  { id: "asia", label: "아시아", patterns: [/asia|asian|china|japan|singapore|india|vietnam|asean|hong kong|korea|아시아|중국|일본|싱가포르|인도|베트남|동남아|홍콩|한국/i] },
  { id: "environment", label: "환경", patterns: [/climate|weather|heat|energy|carbon|pollution|recycle|environment|warming|환경|기후|에너지/i] },
  { id: "education", label: "교육", patterns: [/study|school|teacher|class|lesson|exam|homework|education|learn|교육|공부|수업/i] },
  { id: "economy", label: "경제/소비", patterns: [/money|price|cost|salary|market|economy|inflation|shopping|budget|business|finance|startup|supply chain|trade|경제|가격|소비|월급|비즈니스|금융|투자|무역/i] },
  { id: "food", label: "음식", patterns: [/coffee|lunch|dinner|breakfast|food|eat|drink|restaurant|chicken|meal/i] },
  { id: "commute", label: "이동", patterns: [/bus|subway|taxi|walk|commute|station|airport|flight|train/i] },
  { id: "home", label: "집", patterns: [/home|bed|sleep|wake|bathroom|kitchen|laundry|dishes|clean/i] },
  { id: "health", label: "건강", patterns: [/tired|sick|headache|exercise|gym|walk|run|stretch|stress/i] },
  { id: "people", label: "관계", patterns: [/friend|mom|family|daughter|son|teacher|classmate|people|talk/i] },
  { id: "travel", label: "여행", patterns: [/travel|trip|hotel|museum|palace|tour|passport|luggage|shopping/i] },
  { id: "hobby", label: "취미", patterns: [/movie|music|book|draw|game|hobby|video|picture|park/i] },
];

const PATTERN_TAGS: Array<{ id: string; label: string; patterns: RegExp[] }> = [
  { id: "morning-routine", label: "아침 루틴", patterns: [/wake|morning|breakfast|coffee|alarm|brush|dress/i] },
  { id: "workday", label: "업무일", patterns: [/work|office|meeting|email|report|task/i] },
  { id: "evening-recovery", label: "저녁 회복", patterns: [/tired|home|dinner|rest|sleep|couch|night|exhausted/i] },
  { id: "social-learning", label: "사람과 대화", patterns: [/talk|friend|family|teacher|ask|help|conversation/i] },
  { id: "travel-ready", label: "여행 준비", patterns: [/airport|hotel|directions|reservation|passport|luggage|tour/i] },
  { id: "current-issues", label: "시사 토론", patterns: [/news|global|world|international|politics|policy|debate|issue|trend|뉴스|국제|정치|정책|토론|이슈|시사/i] },
];

const CONNECTORS = /\b(and|but|because|so|then|when|if|while|although|however|also|instead|since|after|before)\b/gi;

export function buildJournalInsight(
  journal: JournalEntry[] = [],
  writingMistakes: WritingMistakeNote[] = [],
): JournalInsight {
  const entries = journal.filter(entry => entry.text.trim());
  const words = entries.flatMap(entry => wordsIn(entry.text));
  const averageWordsPerEntry = entries.length ? Math.round((words.length / entries.length) * 10) / 10 : 0;
  const correctionRate = entries.length ? Math.round((writingMistakes.length / entries.length) * 100) / 100 : 0;
  const connectorUse = entries.reduce((sum, entry) => sum + (entry.text.match(CONNECTORS)?.length ?? 0), 0);
  const preferredTopics = rankLabels(entries, TOPIC_PATTERNS, 4);
  const dailyPatternTags = rankLabels(entries, PATTERN_TAGS, 4);
  const suggestedLevel = suggestLevel({ averageWordsPerEntry, connectorUse, correctionRate, entryCount: entries.length });
  const notes = buildNotes({ entries, preferredTopics, dailyPatternTags, averageWordsPerEntry, connectorUse, correctionRate, suggestedLevel });

  return {
    updatedAt: new Date().toISOString(),
    entryCount: entries.length,
    averageWordsPerEntry,
    correctionRate,
    connectorUse,
    preferredTopics,
    dailyPatternTags,
    suggestedLevel,
    notes,
  };
}

function wordsIn(text: string): string[] {
  return text
    .replace(/[^a-zA-Z'\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function rankLabels(entries: JournalEntry[], groups: typeof TOPIC_PATTERNS, limit: number): string[] {
  const scores = groups.map(group => {
    const score = entries.reduce((sum, entry) => {
      const matched = group.patterns.some(pattern => pattern.test(entry.text));
      return sum + (matched ? 1 : 0);
    }, 0);
    return { label: group.label, score };
  });
  return scores
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.label);
}

function suggestLevel(input: {
  averageWordsPerEntry: number;
  connectorUse: number;
  correctionRate: number;
  entryCount: number;
}): CourseLevelId {
  if (input.entryCount < 3) return "beginner";
  if (input.averageWordsPerEntry >= 18 && input.connectorUse >= 8 && input.correctionRate <= 0.45) return "advanced";
  if (input.averageWordsPerEntry >= 8 || input.connectorUse >= 3) return "intermediate";
  return "beginner";
}

function buildNotes(input: {
  entries: JournalEntry[];
  preferredTopics: string[];
  dailyPatternTags: string[];
  averageWordsPerEntry: number;
  connectorUse: number;
  correctionRate: number;
  suggestedLevel: CourseLevelId;
}): string[] {
  if (input.entries.length === 0) {
    return ["낙서장을 3개 이상 남기면 선호 주제와 생활 패턴을 더 정확히 볼 수 있어요."];
  }

  const notes: string[] = [];
  if (input.preferredTopics.length > 0) notes.push(`자주 쓰는 주제: ${input.preferredTopics.join(", ")}`);
  if (input.dailyPatternTags.length > 0) notes.push(`생활 패턴 단서: ${input.dailyPatternTags.join(", ")}`);
  if (input.averageWordsPerEntry < 8) notes.push("짧은 한 문장 출력이 중심이라 초급 회로 반복이 잘 맞아요.");
  else if (input.averageWordsPerEntry < 18) notes.push("문장을 이어 쓰기 시작했으니 중급 대화 암송으로 넓히기 좋습니다.");
  else notes.push("긴 문장과 연결어 사용이 보여 상급 의견 말하기 준비 신호가 있습니다.");
  if (input.correctionRate >= 0.6) notes.push("오류 복습 비중이 높아 새 과정보다 오답노트와 1분복습을 먼저 추천합니다.");
  notes.push(`현재 낙서장 기준 추천 과정은 ${levelLabel(input.suggestedLevel)}입니다.`);
  return notes;
}

function levelLabel(levelId: CourseLevelId): string {
  if (levelId === "beginner") return "초급";
  if (levelId === "intermediate") return "중급";
  return "상급";
}
