import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ADVANCED_ARTICLE_BY_ID } from "@shared/data/advanced.seed";
import type { AdvancedArticle, AdvancedArticleCategory, SpeakingRubricItem } from "@shared/types/schema";
import { ShadowingRecorder } from "../components/ShadowingRecorder";
import { gradeWriting, llmAvailable } from "../lib/llm";
import { useStore } from "../lib/store";
import { speak, waitForTtsIdle } from "../lib/tts";

type SectionId = "read" | "debate" | "write" | "speak";
type RubricScores = Partial<Record<SpeakingRubricItem["criterion"], number>>;

export function AdvancedArticle() {
  const { id } = useParams();
  const nav = useNavigate();
  const generatedArticle = useStore(s => id ? (s.generatedAdvancedArticles ?? []).find(item => item.id === id) : undefined);
  const article = id ? (ADVANCED_ARTICLE_BY_ID[id] ?? generatedArticle) : undefined;
  const progress = useStore(s => id ? s.advancedArticleProgress?.[id] : undefined);
  const recordRead = useStore(s => s.recordAdvancedArticleRead);
  const saveDebateNote = useStore(s => s.saveAdvancedDebateNote);
  const saveDraft = useStore(s => s.saveAdvancedArticleDraft);
  const saveWritingFeedback = useStore(s => s.saveAdvancedWritingFeedback);
  const recordSpeaking = useStore(s => s.recordAdvancedSpeakingPractice);
  const completeArticle = useStore(s => s.completeAdvancedArticle);
  const [section, setSection] = useState<SectionId>("read");
  const [summaryDraft, setSummaryDraft] = useState(progress?.summaryDraft ?? "");
  const [opinionDraft, setOpinionDraft] = useState(progress?.opinionDraft ?? "");
  const [debateStance, setDebateStance] = useState<"A" | "B" | "balanced" | undefined>(progress?.debateStance);
  const [debateNote, setDebateNote] = useState(progress?.debateNote ?? "");
  const [rubricScores, setRubricScores] = useState<RubricScores>({});
  const [speakingNote, setSpeakingNote] = useState("");
  const [speakingSaved, setSpeakingSaved] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (article) recordRead(article.id);
  }, [article, recordRead]);

  useEffect(() => {
    setSummaryDraft(progress?.summaryDraft ?? "");
    setOpinionDraft(progress?.opinionDraft ?? "");
    setDebateStance(progress?.debateStance);
    setDebateNote(progress?.debateNote ?? "");
  }, [article?.id, progress?.debateNote, progress?.debateStance, progress?.opinionDraft, progress?.summaryDraft]);

  if (!article) {
    return <div className="px-6 py-12 text-center text-text-muted">상급 글을 찾을 수 없어요.</div>;
  }

  const currentArticle = article;

  async function saveAndComplete() {
    saveDraft(currentArticle.id, { summaryDraft, opinionDraft });
    completeArticle(currentArticle.id);
    await waitForTtsIdle();
    nav("/advanced");
  }

  async function requestFeedback() {
    const text = opinionDraft.trim();
    if (!text) return;
    setBusy(true);
    saveDraft(currentArticle.id, { summaryDraft, opinionDraft });
    const result = await gradeWriting(text, currentArticle.writingPrompt);
    const wordCount = countWords(text);
    const nextFeedback = result
      ? `${result.score}/10 · ${result.why}${result.corrected ? `\n수정안: ${result.corrected}` : ""}`
      : localWritingFeedback(text);
    setFeedback(nextFeedback);
    saveWritingFeedback(currentArticle.id, {
      source: result ? "llm" : "local",
      prompt: currentArticle.writingPrompt,
      score: result?.score,
      feedback: nextFeedback,
      corrected: result?.corrected ?? result?.fix,
      wordCount,
    });
    setBusy(false);
  }

  return (
    <div className="px-5 pt-4 pb-4 flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <button onClick={async () => { await waitForTtsIdle(); nav("/advanced"); }} className="w-9 h-9 rounded-full hover:bg-surface-2">←</button>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-text-muted">Stage 3 · {categoryLabel(article.category)}</div>
          <h1 className="text-xl font-bold truncate">{categoryEmoji(article.category)} {article.title}</h1>
        </div>
      </header>

      <section className="rounded-2xl border border-border bg-surface p-4">
        <p className="text-sm text-text-muted">{article.subtitle}</p>
        {(article.trendLabelKo || article.sourceNoteKo) && (
          <div className="mt-3 rounded-xl border border-accent/40 bg-accent/10 p-3 text-sm">
            {article.trendLabelKo && <div className="text-xs font-semibold text-accent-strong">{article.trendLabelKo}</div>}
            {article.sourceNoteKo && <p className="mt-1 text-xs text-text-muted">{article.sourceNoteKo}</p>}
          </div>
        )}
        {article.sourceItems && article.sourceItems.length > 0 && (
          <div className="mt-3 rounded-xl bg-surface-2 p-3 text-sm">
            <div className="text-xs font-semibold text-text-muted">참고한 최신 소스</div>
            <div className="mt-2 grid gap-2">
              {article.sourceItems.slice(0, 4).map(item => (
                <a
                  key={`${item.source}-${item.url}`}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-lg border border-border bg-surface px-3 py-2"
                >
                  <div className="text-xs text-accent-strong">{item.source}</div>
                  <div className="mt-0.5 line-clamp-2 text-xs text-text-muted">{item.title}</div>
                </a>
              ))}
            </div>
          </div>
        )}
        <div className="mt-3 rounded-xl bg-surface-2 p-3 text-sm">
          <div className="text-xs text-text-muted">요약</div>
          <p className="mt-1">{article.summaryKo}</p>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[11px] text-text-muted">
            약 {article.estimatedMinutes}분
          </span>
          <span className="rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[11px] text-text-muted">
            발화 {progress?.speakingPracticeCount ?? 0}회
          </span>
          <span className="rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[11px] text-text-muted">
            피드백 {progress?.writingFeedbackHistory?.length ?? 0}회
          </span>
          {progress?.completed && <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] text-success">완료</span>}
        </div>
      </section>

      <div className="grid grid-cols-4 gap-1.5">
        {([
          ["read", "읽기"],
          ["debate", "토론"],
          ["write", "쓰기"],
          ["speak", "말하기"],
        ] as Array<[SectionId, string]>).map(item => (
          <button
            key={item[0]}
            onClick={() => setSection(item[0])}
            className={`rounded-xl border px-2 py-2 text-xs font-medium ${section === item[0] ? "border-accent bg-accent/20" : "border-border bg-surface text-text-muted"}`}
          >
            {item[1]}
          </button>
        ))}
      </div>

      {section === "read" && (
        <ReadSection article={article} />
      )}

      {section === "debate" && (
        <section className="rounded-2xl border border-border bg-surface p-4">
          <h2 className="font-semibold">토론 질문</h2>
          <p className="mt-2 text-lg font-medium">{article.debate.question}</p>
          <div className="mt-3 grid gap-2">
            <div className="rounded-xl bg-surface-2 p-3 text-sm">
              <div className="font-medium">입장 A</div>
              <p className="mt-1 text-text-muted">{article.debate.stanceA}</p>
            </div>
            <div className="rounded-xl bg-surface-2 p-3 text-sm">
              <div className="font-medium">입장 B</div>
              <p className="mt-1 text-text-muted">{article.debate.stanceB}</p>
            </div>
          </div>
          <h3 className="mt-4 text-sm font-semibold">내 입장 메모</h3>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {([
              ["A", "A에 가까움"],
              ["B", "B에 가까움"],
              ["balanced", "균형"],
            ] as Array<["A" | "B" | "balanced", string]>).map(item => (
              <button
                key={item[0]}
                onClick={() => setDebateStance(item[0])}
                className={`rounded-xl border px-2 py-2 text-xs font-medium ${debateStance === item[0] ? "border-accent bg-accent/20" : "border-border bg-surface-2 text-text-muted"}`}
              >
                {item[1]}
              </button>
            ))}
          </div>
          <textarea
            value={debateNote}
            onChange={event => setDebateNote(event.target.value)}
            rows={3}
            placeholder="I partly agree because..."
            className="mt-2 w-full resize-none rounded-xl border border-border bg-surface-2 p-3 en outline-none focus:border-accent"
          />
          <button
            onClick={() => saveDebateNote(article.id, { debateStance, debateNote })}
            className="mt-2 w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm font-medium"
          >
            토론 메모 저장
          </button>
          <h3 className="mt-4 text-sm font-semibold">쓸 수 있는 프레임</h3>
          <div className="mt-2 flex flex-col gap-2">
            {article.debate.usefulFrames.map(frame => (
              <button
                key={frame}
                onClick={() => speak(frame)}
                className="rounded-xl border border-border bg-surface-2 px-3 py-2 text-left en text-sm"
              >
                {frame}
              </button>
            ))}
          </div>
        </section>
      )}

      {section === "write" && (
        <section className="rounded-2xl border border-border bg-surface p-4">
          <h2 className="font-semibold">의견 쓰기</h2>
          <p className="mt-2 text-sm text-text-muted">{article.writingPrompt}</p>
          <textarea
            value={summaryDraft}
            onChange={event => setSummaryDraft(event.target.value)}
            rows={3}
            placeholder="First, summarize the article in 1-2 sentences."
            className="mt-3 w-full resize-none rounded-xl border border-border bg-surface-2 p-3 en outline-none focus:border-accent"
          />
          <textarea
            value={opinionDraft}
            onChange={event => setOpinionDraft(event.target.value)}
            rows={5}
            placeholder="Then write your opinion with one reason and one example."
            className="mt-2 w-full resize-none rounded-xl border border-border bg-surface-2 p-3 en outline-none focus:border-accent"
          />
          <div className="mt-1 text-right text-[11px] text-text-muted">
            의견문 {countWords(opinionDraft)} words
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                saveDraft(article.id, { summaryDraft, opinionDraft });
                setFeedback("저장했습니다. 말하기 탭에서 같은 내용을 1분 발화로 바꿔보세요.");
              }}
              className="rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm font-medium"
            >
              저장
            </button>
            <button
              onClick={requestFeedback}
              disabled={!opinionDraft.trim() || busy}
              className="rounded-xl bg-accent text-[#2A2522] px-4 py-2.5 text-sm font-medium disabled:opacity-40"
            >
              {busy ? "확인 중..." : llmAvailable() ? "AI 피드백" : "로컬 피드백"}
            </button>
          </div>
          {feedback && (
            <div className="mt-3 whitespace-pre-wrap rounded-xl bg-surface-2 p-3 text-sm text-text-muted">
              {feedback}
            </div>
          )}
          {(progress?.writingFeedbackHistory?.length ?? 0) > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold">작문 피드백 기록</h3>
              <div className="mt-2 grid gap-2">
                {progress!.writingFeedbackHistory!.slice(0, 3).map(item => (
                  <div key={item.id} className="rounded-xl bg-surface-2 p-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{item.source === "llm" ? "AI" : "로컬"} 피드백</span>
                      <span className="text-xs text-text-muted">{item.score ? `${item.score}/10 · ` : ""}{item.wordCount} words</span>
                    </div>
                    <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-xs text-text-muted">{item.feedback}</p>
                    <div className="mt-1 text-[11px] text-text-muted">{formatDateTime(item.createdAt)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {section === "speak" && (
        <section className="rounded-2xl border border-border bg-surface p-4">
          <h2 className="font-semibold">발화 평가 스캐폴드</h2>
          <p className="mt-2 text-sm text-text-muted">{article.speakingPrompt}</p>
          <div className="mt-3 rounded-xl bg-surface-2 p-3">
            <div className="text-xs text-text-muted">샘플 답변</div>
            <p className="en mt-1 text-sm">{article.sampleAnswer}</p>
          </div>
          <ShadowingRecorder text={article.sampleAnswer} title="1분 발화 녹음" />
          <div className="mt-4 grid gap-2">
            {article.rubric.map(item => (
              <div key={item.criterion} className="rounded-xl bg-surface-2 p-3 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <p className="mt-1 text-xs text-text-muted">{item.description}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {[1, 2, 3].map(score => (
                      <button
                        key={score}
                        onClick={() => setRubricScores(prev => ({ ...prev, [item.criterion]: score }))}
                        className={`h-8 w-8 rounded-lg border text-xs font-semibold ${rubricScores[item.criterion] === score ? "border-accent bg-accent/20" : "border-border bg-surface"}`}
                        aria-label={`${item.label} ${score}점`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <textarea
            value={speakingNote}
            onChange={event => setSpeakingNote(event.target.value)}
            rows={3}
            placeholder="After recording, write one thing to improve next time."
            className="mt-3 w-full resize-none rounded-xl border border-border bg-surface-2 p-3 en outline-none focus:border-accent"
          />
          <button
            onClick={() => {
              recordSpeaking(article.id, {
                prompt: article.speakingPrompt,
                rubricScores,
                note: speakingNote.trim() || undefined,
              });
              setRubricScores({});
              setSpeakingNote("");
              setSpeakingSaved("발화 기록을 저장했습니다. 다음에는 가장 낮은 항목 하나만 의식하고 다시 말해보세요.");
            }}
            className="mt-2 w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm font-medium"
          >
            발화 평가 저장
          </button>
          {speakingSaved && (
            <div className="mt-2 rounded-xl bg-success/10 p-3 text-sm text-success">
              {speakingSaved}
            </div>
          )}
          {(progress?.speakingAttempts?.length ?? 0) > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold">발화 기록</h3>
              <div className="mt-2 grid gap-2">
                {progress!.speakingAttempts!.slice(0, 3).map(item => (
                  <div key={item.id} className="rounded-xl bg-surface-2 p-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">자기평가 {averageRubricScore(item.rubricScores)}</span>
                      <span className="text-xs text-text-muted">{formatDateTime(item.createdAt)}</span>
                    </div>
                    {item.note && <p className="mt-1 text-xs text-text-muted">{item.note}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <button
        onClick={saveAndComplete}
        className="rounded-xl bg-accent text-[#2A2522] px-4 py-3 font-medium"
      >
        상급 글 완료로 기록
      </button>
    </div>
  );
}

function ReadSection({ article }: { article: AdvancedArticle }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-4">
      <h2 className="font-semibold">본문</h2>
      <div className="en mt-3 whitespace-pre-line text-[15px] leading-7">
        {article.body}
      </div>
      <h3 className="mt-5 text-sm font-semibold">고급 표현</h3>
      <div className="mt-2 grid gap-2">
        {article.keyExpressions.map(expression => (
          <button
            key={expression.en}
            onClick={() => speak(expression.en)}
            className="rounded-xl bg-surface-2 p-3 text-left"
          >
            <div className="en text-sm font-medium">{expression.en}</div>
            <div className="mt-1 text-xs text-text-muted">{expression.ko} · {expression.usage}</div>
          </button>
        ))}
      </div>
    </section>
  );
}

function localWritingFeedback(text: string) {
  const words = countWords(text);
  const hasReason = /\b(because|since|as|therefore|so)\b/i.test(text);
  const hasContrast = /\b(however|but|although|while|on the other hand)\b/i.test(text);
  const tips = [
    words >= 45 ? "분량은 상급 의견문 연습에 충분합니다." : "조금 더 길게, 최소 45단어 이상으로 확장해보세요.",
    hasReason ? "이유 연결어가 들어가 있어 논리 흐름이 좋습니다." : "`because`, `therefore` 같은 이유 연결어를 하나 넣어보세요.",
    hasContrast ? "반대 관점이나 양보가 있어 글이 더 성숙합니다." : "`however`나 `although`로 반대 관점도 한 번 인정해보세요.",
  ];
  return `로컬 피드백\n${tips.join("\n")}`;
}

function countWords(text: string) {
  return text.split(/\s+/).filter(Boolean).length;
}

function averageRubricScore(scores: RubricScores) {
  const values = Object.values(scores).filter((value): value is number => typeof value === "number");
  if (values.length === 0) return "미입력";
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  return `${average.toFixed(1)}/3`;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function categoryLabel(category: AdvancedArticleCategory) {
  if (category === "work") return "업무";
  if (category === "news") return "뉴스형 이슈";
  return "사회";
}

function categoryEmoji(category: AdvancedArticleCategory) {
  if (category === "work") return "💼";
  if (category === "news") return "🗞️";
  return "🌐";
}
