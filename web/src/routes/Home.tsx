import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "../lib/store";
import { useNavigate } from "react-router-dom";
import { NowCard } from "../components/NowCard";
import { CircuitDial } from "../components/CircuitDial";
import { DailyStoryCard } from "../components/DailyStoryCard";
import { AxisChips } from "../components/AxisChips";
import { bandLabel, currentTimeBand } from "../lib/time";
import { APP_VERSION } from "../lib/version";
import { COURSE_LEVEL_BY_ID } from "@shared/data/course-levels.seed";
import { DIALOGUE_LESSONS } from "@shared/data/dialogues.seed";
import { INTERMEDIATE_READING_LESSONS } from "@shared/data/intermediate-readings.seed";
import { ADVANCED_ARTICLES } from "@shared/data/advanced.seed";
import { buildPersonalizedAdvancedPlan } from "../lib/advanced-personalization";
import {
  precacheSupertonicTexts,
  stopSupertonicPrecache,
  supertonicConsentAccepted,
  supertonicPrecacheStatus,
  supertonicRuntimeStatus,
  type SupertonicPrecacheProgress,
  type SupertonicPrecacheStatus,
} from "../lib/supertonic-tts";
import type { AdvancedArticle, AudioPrebuildScope } from "@shared/types/schema";

export function Home() {
  const nav = useNavigate();
  const stats = useStore(s => s.stats);
  const goal = useStore(s => s.prefs.dailyMinutesGoal);
  const currentCourseLevel = useStore(s => s.currentCourseLevel ?? "beginner");
  const journalInsight = useStore(s => s.learnerProfile?.journalInsight);
  const todayMin = Math.floor(stats.totalStudySeconds / 60);
  const pct = Math.min(100, Math.round((todayMin / goal) * 100));
  const band = currentTimeBand();
  const currentLevel = COURSE_LEVEL_BY_ID[currentCourseLevel];

  return (
    <div className="px-5 pt-6 pb-4 flex flex-col gap-4">
      {/* 상단 헤더 */}
      <header className="flex items-center justify-between">
        <div>
          <div className="text-sm text-text-muted">{bandLabel(band)} · 환영합니다</div>
          <div className="text-2xl font-bold mt-0.5">Sulsul+ <span className="text-xs align-middle text-text-muted">v{APP_VERSION}</span></div>
          <button
            onClick={() => nav("/axis/stage")}
            className="mt-1 text-xs text-accent-strong"
          >
            현재 과정: {currentLevel?.shortTitle ?? "초급"} →
          </button>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1.5 text-sm bg-accent/15 border border-accent/40 rounded-full px-2.5 py-1">
            🔥 <span className="font-semibold">{stats.streak}</span>일
          </div>
          <div className="mt-1 text-xs text-text-muted">{todayMin}/{goal}분 · {pct}%</div>
        </div>
      </header>

      {/* 목표 진행률 바 */}
      <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
        <div className="h-full bg-accent transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>

      {currentCourseLevel === "beginner" && <BeginnerToday />}
      {currentCourseLevel === "intermediate" && <IntermediateToday />}
      {currentCourseLevel === "advanced" && <AdvancedToday />}

      <button
        onClick={() => nav("/journal")}
        className="w-full text-left rounded-2xl bg-surface border border-border p-4 active:scale-[0.99] transition-transform"
      >
        <div className="flex items-center gap-2 text-xs text-text-muted">
          📓 낙서장 · 다음날 퀴즈 씨앗
        </div>
        <div className="mt-1 font-semibold leading-snug">짧게 쓰거나 말해서 남기기</div>
        <div className="text-sm text-text-muted mt-0.5">
          영어 한 문장을 저장하면 복습 문제와 학습자 인사이트로 이어집니다.
        </div>
        {journalInsight && journalInsight.entryCount > 0 && (
          <div className="mt-2 rounded-xl bg-surface-2 px-3 py-2 text-xs text-text-muted">
            최근 낙서장: {journalInsight.preferredTopics[0] ?? "일상"} 중심 · 추천 {COURSE_LEVEL_BY_ID[journalInsight.suggestedLevel]?.shortTitle}
          </div>
        )}
      </button>

      {/* 5축 칩 */}
      <section className="mt-2">
        <div className="text-sm text-text-muted mb-1.5">다른 축으로 탐색</div>
        <AxisChips />
      </section>
    </div>
  );
}

function BeginnerToday() {
  return (
    <>
      <NowCard />

      <section className="rounded-2xl border border-border bg-surface p-4">
        <div className="text-center text-sm text-text-muted">오늘의 회로 — 4모드 회전 학습</div>
        <CircuitDial />
        <div className="text-center text-xs text-text-muted mt-2">중앙 = 5스텝 풀 코스 · 외곽 = 단일 모드</div>
      </section>

      <DailyStoryCard />
    </>
  );
}

function IntermediateToday() {
  const nav = useNavigate();
  const dialogueProgress = useStore(s => s.dialogueProgress ?? {});
  const readingProgress = useStore(s => s.intermediateReadingProgress ?? {});
  const completedDialogues = DIALOGUE_LESSONS.filter(dialogue => dialogueProgress[dialogue.id]?.completed).length;
  const completedReadings = INTERMEDIATE_READING_LESSONS.filter(lesson => readingProgress[lesson.id]?.completed).length;
  const nextDialogue = DIALOGUE_LESSONS.find(dialogue => !dialogueProgress[dialogue.id]?.completed) ?? DIALOGUE_LESSONS[0];
  const nextReading = INTERMEDIATE_READING_LESSONS.find(lesson => !readingProgress[lesson.id]?.completed) ?? INTERMEDIATE_READING_LESSONS[0];
  const recommendReading = completedReadings <= completedDialogues;
  const title = recommendReading ? nextReading?.title : nextDialogue?.title;
  const subtitle = recommendReading ? nextReading?.subtitle : nextDialogue?.subtitle;
  const path = recommendReading ? `/intermediate-reading/${nextReading?.id}` : `/dialogue/${nextDialogue?.id}`;
  const readingItems = INTERMEDIATE_READING_LESSONS.map(lesson => ({
    id: lesson.id,
    label: lesson.title,
    text: lesson.body,
  }));
  const suggestedReadingItems = uniqueListeningItems([
    nextReading,
    ...INTERMEDIATE_READING_LESSONS.filter(lesson => !readingProgress[lesson.id]?.completed),
    ...INTERMEDIATE_READING_LESSONS,
  ].map(lesson => ({ id: lesson.id, label: lesson.title, text: lesson.body }))).slice(0, 3);

  return (
    <>
      <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          🎭 Stage 2 · 오늘 추천
        </div>
        <div className="mt-1 font-semibold text-lg leading-snug">
          지금 추천 · {title}
        </div>
        <p className="mt-0.5 text-sm text-text-muted">{subtitle}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-surface-2 border border-border px-2 py-1 text-[11px] text-text-muted">
            대화 완료 {completedDialogues}/{DIALOGUE_LESSONS.length}
          </span>
          <span className="rounded-full bg-surface-2 border border-border px-2 py-1 text-[11px] text-text-muted">
            리딩 완료 {completedReadings}/{INTERMEDIATE_READING_LESSONS.length}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => nav(path)}
            className="rounded-xl bg-accent text-[#2A2522] px-4 py-2.5 text-sm font-medium"
          >
            시작 →
          </button>
          <button
            onClick={() => nav("/review?practice=1&source=intermediate&n=5")}
            className="rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm font-medium"
          >
            중급 1분학습
          </button>
        </div>
      </section>

      <ListeningPrebuildCard
        levelId="intermediate"
        levelLabel="중급"
        todayItems={[{ id: nextReading.id, label: nextReading.title, text: nextReading.body }]}
        recommendedItems={suggestedReadingItems}
        courseItems={readingItems}
      />

      <section className="grid grid-cols-2 gap-3">
        <button
          onClick={() => nav("/dialogues")}
          className="rounded-2xl border border-border bg-surface p-4 text-left"
        >
          <div className="text-2xl">🗣️</div>
          <div className="mt-2 font-semibold">대화 암송</div>
          <p className="mt-1 text-xs text-text-muted">역할 A/B와 한글 힌트로 출력 연습</p>
        </button>
        <button
          onClick={() => nav("/intermediate-readings")}
          className="rounded-2xl border border-border bg-surface p-4 text-left"
        >
          <div className="text-2xl">📰</div>
          <div className="mt-2 font-semibold">리딩·리스닝</div>
          <p className="mt-1 text-xs text-text-muted">뉴스형 글의 요지와 어휘 잡기</p>
        </button>
      </section>
    </>
  );
}

function AdvancedToday() {
  const nav = useNavigate();
  const progress = useStore(s => s.advancedArticleProgress ?? {});
  const journalInsight = useStore(s => s.learnerProfile?.journalInsight);
  const generatedArticles = useStore(s => s.generatedAdvancedArticles ?? []);
  const articles = mergeArticles(generatedArticles, ADVANCED_ARTICLES);
  const personalizedPlan = buildPersonalizedAdvancedPlan(articles, journalInsight);
  const recommended = personalizedPlan.personalizedArticles.find(article => !progress[article.id]?.completed)
    ?? articles.find(article => !progress[article.id]?.completed)
    ?? articles[0];
  const completed = articles.filter(article => progress[article.id]?.completed).length;
  const feedbackCount = articles.reduce((sum, article) =>
    sum + (progress[article.id]?.writingFeedbackHistory?.length ?? 0) + (progress[article.id]?.speakingAttempts?.length ?? 0),
  0);
  const articleItems = articles.map(article => ({
    id: article.id,
    label: article.title,
    text: article.body,
  }));
  const suggestedArticleItems = uniqueListeningItems([
    recommended,
    ...personalizedPlan.personalizedArticles,
    ...articles.filter(article => !progress[article.id]?.completed),
    ...articles,
  ].map(article => ({ id: article.id, label: article.title, text: article.body }))).slice(0, 3);

  return (
    <>
      <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          🛰️ Stage 3 · 오늘 추천
        </div>
        <div className="mt-1 font-semibold text-lg leading-snug">
          지금 추천 · {recommended.title}
        </div>
        <p className="mt-0.5 text-sm text-text-muted">{recommended.subtitle}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-surface-2 border border-border px-2 py-1 text-[11px] text-text-muted">
            완료 {completed}/{articles.length}
          </span>
          <span className="rounded-full bg-surface-2 border border-border px-2 py-1 text-[11px] text-text-muted">
            피드백·발화 {feedbackCount}회
          </span>
          {personalizedPlan.activeTopics[0] && (
            <span className="rounded-full bg-accent/15 border border-accent/40 px-2 py-1 text-[11px] text-accent-strong">
              관심 {personalizedPlan.activeTopics[0]}
            </span>
          )}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => nav(`/advanced/article/${recommended.id}`)}
            className="rounded-xl bg-accent text-[#2A2522] px-4 py-2.5 text-sm font-medium"
          >
            읽고 말하기 →
          </button>
          <button
            onClick={() => nav("/review?practice=1&source=advanced&n=5")}
            className="rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm font-medium"
          >
            상급 1분학습
          </button>
        </div>
      </section>

      <ListeningPrebuildCard
        levelId="advanced"
        levelLabel="상급"
        todayItems={[{ id: recommended.id, label: recommended.title, text: recommended.body }]}
        recommendedItems={suggestedArticleItems}
        courseItems={articleItems}
      />

      <button
        onClick={() => nav("/advanced")}
        className="w-full rounded-2xl border border-accent/50 bg-accent/10 p-4 text-left"
      >
        <div className="text-xs font-semibold text-accent-strong">상급 학습실</div>
        <div className="mt-1 font-semibold">긴 글, 토론, 작문, 발화 평가로 이어가기</div>
        <p className="mt-1 text-sm text-text-muted">
          낙서장 관심 주제와 최신 소스 기반 글은 상급 학습실에서 계속 관리됩니다.
        </p>
      </button>
    </>
  );
}

function mergeArticles(generated: AdvancedArticle[], seeded: AdvancedArticle[]): AdvancedArticle[] {
  const seen = new Set<string>();
  return [...generated, ...seeded].filter(article => {
    if (seen.has(article.id)) return false;
    seen.add(article.id);
    return true;
  });
}

interface ListeningPrebuildItem {
  id: string;
  label: string;
  text: string;
}

function ListeningPrebuildCard({
  levelId,
  levelLabel,
  todayItems,
  recommendedItems,
  courseItems,
}: {
  levelId: "intermediate" | "advanced";
  levelLabel: string;
  todayItems: ListeningPrebuildItem[];
  recommendedItems: ListeningPrebuildItem[];
  courseItems: ListeningPrebuildItem[];
}) {
  const prefs = useStore(s => s.prefs);
  const setPrefs = useStore(s => s.setPrefs);
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<SupertonicPrecacheProgress | null>(null);
  const [cacheStatus, setCacheStatus] = useState<SupertonicPrecacheStatus | null>(null);
  const [checkingCache, setCheckingCache] = useState(false);
  const [message, setMessage] = useState("");
  const autoRunRef = useRef("");
  const scope = prefs.audioPrebuildScope ?? "today";
  const time = prefs.audioPrebuildTime ?? "07:00";
  const selectedItems = useMemo(
    () => prebuildItemsForScope(scope, todayItems, recommendedItems, courseItems),
    [courseItems, recommendedItems, scope, todayItems],
  );
  const selectedItemsKey = useMemo(
    () => selectedItems.map(item => `${item.id}|${item.label}|${item.text}`).join("\n"),
    [selectedItems],
  );
  const status = supertonicRuntimeStatus();
  const supertonicReady = supertonicConsentAccepted() && status.supported && status.ready;
  const autoRunKey = `${localDateKey()}:${levelId}:${scope}:${time}`;
  const prebuildRate = levelId === "advanced" ? 0.86 : 0.88;
  const needsBuild = !!cacheStatus?.needsBuild;
  const hasPrebuildItems = selectedItems.length > 0;
  const canBuildNow = supertonicReady && hasPrebuildItems && needsBuild;
  const buildDisabledReason = (() => {
    if (!hasPrebuildItems) return "현재 범위에는 미리 만들 듣기자료가 없습니다.";
    if (!supertonicReady) return "Supertonic 준비가 필요합니다.";
    if (!cacheStatus) return "캐시 상태를 확인하고 있어요.";
    if (!needsBuild) return "선택한 범위의 듣기자료가 이미 준비되어 있습니다.";
    return "";
  })();
  const badgeLabel = !supertonicReady
    ? "준비 필요"
    : checkingCache
      ? "확인 중"
      : !hasPrebuildItems
        ? "자료 없음"
        : needsBuild
          ? "만들기 필요"
          : "준비됨";
  const buildButtonLabel = busy
    ? "중지"
    : checkingCache
      ? "확인 중..."
      : !supertonicReady
        ? "준비 필요"
        : !hasPrebuildItems
          ? "자료 없음"
          : needsBuild
            ? "지금 만들기"
            : "이미 준비됨";

  useEffect(() => () => stopSupertonicPrecache(), []);

  useEffect(() => {
    let cancelled = false;
    setCacheStatus(null);
    setCheckingCache(true);
    if (!supertonicReady) {
      setCacheStatus({
        supported: status.supported,
        ready: false,
        total: 0,
        cached: 0,
        missing: 0,
        needsBuild: false,
        reasonKo: status.reasonKo,
      });
      setCheckingCache(false);
      return () => { cancelled = true; };
    }
    void supertonicPrecacheStatus(selectedItems, { rate: prebuildRate })
      .then(next => {
        if (cancelled) return;
        setCacheStatus(next);
        setCheckingCache(false);
      })
      .catch(error => {
        if (cancelled) return;
        const reasonKo = error instanceof Error ? error.message : String(error);
        setCacheStatus({
          supported: true,
          ready: false,
          total: 0,
          cached: 0,
          missing: 0,
          needsBuild: false,
          reasonKo: `캐시 상태 확인 실패: ${reasonKo}`,
        });
        setCheckingCache(false);
      });
    return () => { cancelled = true; };
  }, [prebuildRate, selectedItemsKey, status.reasonKo, status.supported, supertonicReady]);

  useEffect(() => {
    if (!prefs.audioPrebuildAutoEnabled || busy || !supertonicReady || !needsBuild) return;
    if (prefs.audioPrebuildLastRunKey === autoRunKey || autoRunRef.current === autoRunKey) return;
    if (!timeHasPassed(time)) return;
    autoRunRef.current = autoRunKey;
    void runPrebuild("auto");
  }, [autoRunKey, busy, needsBuild, prefs.audioPrebuildAutoEnabled, prefs.audioPrebuildLastRunKey, supertonicReady, time]);

  async function runPrebuild(mode: "manual" | "auto") {
    if (busy) return;
    if (!supertonicReady) {
      setMessage("Supertonic 준비 후 사용할 수 있어요. 도구함에서 Supertonic 준비와 모델 캐시 준비를 먼저 해주세요.");
      return;
    }
    if (selectedItems.length === 0) {
      setMessage("미리 만들 듣기자료가 없습니다.");
      return;
    }
    if (cacheStatus && !cacheStatus.needsBuild) {
      setMessage("선택한 범위의 듣기자료가 이미 준비되어 있어요. 새 글이 추가되거나 캐시가 삭제되면 다시 만들 수 있습니다.");
      return;
    }

    setBusy(true);
    setProgress({ current: 0, total: selectedItems.length, label: "", prepared: 0, skipped: 0 });
    setMessage(mode === "auto" ? "예약 시간이라 듣기자료를 만들기 시작했어요." : "듣기자료를 만들고 있어요. 앱을 켜둔 채 잠시 기다려주세요.");
    const result = await precacheSupertonicTexts(selectedItems, { rate: prebuildRate }, setProgress);
    setBusy(false);
    if (!result.started) {
      setMessage(result.reasonKo ?? "듣기자료를 만들지 못했어요.");
      return;
    }
    if (result.reasonKo) {
      setMessage(result.reasonKo);
      return;
    }
    setMessage(`완료: 새로 만든 조각 ${result.prepared}개 · 이미 있던 조각 ${result.skipped}개`);
    setCacheStatus(await supertonicPrecacheStatus(selectedItems, { rate: prebuildRate }));
    if (mode === "auto") setPrefs({ audioPrebuildLastRunKey: autoRunKey });
  }

  function stopPrebuild() {
    stopSupertonicPrecache();
    setBusy(false);
    setMessage("듣기자료 만들기를 중지했습니다.");
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-accent-strong">듣기자료 미리만들어놓기</div>
          <h2 className="mt-1 font-semibold">{levelLabel} 본문듣기 첫 대기 줄이기</h2>
          <p className="mt-1 text-sm text-text-muted">
            사용법: 1. Supertonic 준비 후 2. 학습 전에 이 버튼을 누르고 3. 완료 후 본문듣기를 누르면 더 빨리 시작됩니다.
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] ${supertonicReady ? "bg-success/10 text-success" : "bg-surface-2 text-text-muted"}`}>
          {badgeLabel}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {(["today", "recommended", "course"] as AudioPrebuildScope[]).map(option => (
          <button
            key={option}
            onClick={() => setPrefs({ audioPrebuildScope: option })}
            disabled={busy}
            className={`rounded-xl border px-2 py-2 text-xs font-medium disabled:opacity-50 ${
              scope === option ? "border-accent bg-accent/20" : "border-border bg-surface-2 text-text-muted"
            }`}
          >
            {prebuildScopeLabel(option, todayItems.length, recommendedItems.length, courseItems.length)}
          </button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
        <button
          onClick={() => busy ? stopPrebuild() : void runPrebuild("manual")}
          disabled={!busy && !canBuildNow}
          className={`rounded-xl px-4 py-2.5 text-sm font-medium disabled:opacity-50 ${busy ? "bg-danger text-white" : "bg-accent text-[#2A2522]"}`}
        >
          {buildButtonLabel}
        </button>
        <button
          onClick={() => nav("/toolbelt")}
          className="rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-xs font-medium"
        >
          TTS 설정
        </button>
      </div>

      {cacheStatus && (
        <p className="mt-2 rounded-xl bg-surface-2 p-3 text-xs text-text-muted">
          {cacheStatus.ready
            ? `캐시 상태: 준비됨 ${cacheStatus.cached}/${cacheStatus.total} · 필요한 조각 ${cacheStatus.missing}개`
            : cacheStatus.reasonKo}
          {!busy && buildDisabledReason && ` ${buildDisabledReason}`}
        </p>
      )}

      {progress && busy && (
        <div className="mt-3 rounded-xl bg-surface-2 p-3 text-xs text-text-muted">
          <div className="flex items-center justify-between gap-3">
            <span className="truncate">합성 중: {progress.label || "준비 중"}</span>
            <span>{progress.current}/{progress.total}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface">
            <div
              className="h-full bg-accent transition-[width]"
              style={{ width: `${Math.round((progress.current / Math.max(1, progress.total)) * 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-3 rounded-xl border border-border bg-surface-2 p-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!prefs.audioPrebuildAutoEnabled}
            onChange={event => setPrefs({ audioPrebuildAutoEnabled: event.target.checked })}
          />
          매일 한 번 자동으로 만들기
        </label>
        <div className="mt-2 flex items-center gap-2 text-xs text-text-muted">
          <span>실행 시간</span>
          <input
            type="time"
            value={time}
            onChange={event => setPrefs({ audioPrebuildTime: event.target.value || "07:00" })}
            className="rounded-lg border border-border bg-surface px-2 py-1 text-text"
          />
          <span>앱이 열려 있을 때 실행</span>
        </div>
      </div>

      {message && (
        <p className="mt-2 rounded-xl bg-surface-2 p-3 text-xs text-text-muted">
          {message}
        </p>
      )}
    </section>
  );
}

function prebuildItemsForScope(
  scope: AudioPrebuildScope,
  todayItems: ListeningPrebuildItem[],
  recommendedItems: ListeningPrebuildItem[],
  courseItems: ListeningPrebuildItem[],
) {
  if (scope === "course") return courseItems;
  if (scope === "recommended") return recommendedItems;
  return todayItems;
}

function prebuildScopeLabel(scope: AudioPrebuildScope, todayCount: number, recommendedCount: number, courseCount: number) {
  if (scope === "course") return `전체 ${courseCount}`;
  if (scope === "recommended") return `맞춤 ${recommendedCount}`;
  return `오늘 ${todayCount}`;
}

function uniqueListeningItems(items: ListeningPrebuildItem[]) {
  const seen = new Set<string>();
  return items.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function timeHasPassed(value: string) {
  const [hourText, minuteText] = value.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return false;
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes() >= hour * 60 + minute;
}
