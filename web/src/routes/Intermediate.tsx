import { useNavigate } from "react-router-dom";
import { DIALOGUE_LESSONS } from "@shared/data/dialogues.seed";
import { INTERMEDIATE_READING_LESSONS, INTERMEDIATE_SOURCE_PROFILES } from "@shared/data/intermediate-readings.seed";
import { useStore } from "../lib/store";

export function Intermediate() {
  const nav = useNavigate();
  const dialogueProgress = useStore(s => s.dialogueProgress ?? {});
  const readingProgress = useStore(s => s.intermediateReadingProgress ?? {});
  const setCurrentCourseLevel = useStore(s => s.setCurrentCourseLevel);

  const completedDialogues = DIALOGUE_LESSONS.filter(dialogue => dialogueProgress[dialogue.id]?.completed).length;
  const completedReadings = INTERMEDIATE_READING_LESSONS.filter(lesson => readingProgress[lesson.id]?.completed).length;
  const total = DIALOGUE_LESSONS.length + INTERMEDIATE_READING_LESSONS.length;
  const completed = completedDialogues + completedReadings;
  const pct = Math.round((completed / Math.max(1, total)) * 100);

  return (
    <div className="px-5 pt-6 pb-4 flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <button onClick={() => nav("/axis/stage")} className="w-9 h-9 rounded-full hover:bg-surface-2">←</button>
        <div>
          <div className="text-xs text-text-muted">Stage 2 · 중급 과정</div>
          <h1 className="text-xl font-bold">🎭 대화 + 뉴스 리딩</h1>
        </div>
      </header>

      <section className="rounded-3xl border border-accent/40 bg-accent/10 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-accent-strong">중급 완성 루프</div>
            <h2 className="mt-1 text-lg font-bold">듣고, 요지를 잡고, 내 말로 답하기</h2>
            <p className="mt-2 text-sm text-text-muted">
              대화 암송으로 말문을 늘리고, BBC/VOA/아시아 뉴스형 원본 리딩으로 시사·문화 주제의 이해력을 키웁니다.
            </p>
          </div>
          <div className="text-right text-sm">
            <div className="font-bold">{pct}%</div>
            <div className="text-xs text-text-muted">{completed}/{total}</div>
          </div>
        </div>
        <div className="mt-4 h-2 rounded-full bg-surface/70 overflow-hidden">
          <div className="h-full bg-accent transition-[width]" style={{ width: `${pct}%` }} />
        </div>
      </section>

      <section className="grid gap-3">
        <LearningCard
          emoji="🗣️"
          title="A/B 대화 암송"
          desc="6턴 대화를 전체 듣기, 끊어 읽기, 역할 A/B, 한글 힌트로 반복합니다."
          meta={`완료 ${completedDialogues}/${DIALOGUE_LESSONS.length}`}
          onClick={() => {
            setCurrentCourseLevel("intermediate");
            nav("/dialogues");
          }}
        />
        <LearningCard
          emoji="📰"
          title="중급 리딩·리스닝 랩"
          desc="뉴스·문화·커뮤니티 설명문을 B1-B2 원본 글로 읽고 요지, 어휘, 말하기까지 연습합니다."
          meta={`완료 ${completedReadings}/${INTERMEDIATE_READING_LESSONS.length} · 소스 ${INTERMEDIATE_SOURCE_PROFILES.length}개 검토`}
          onClick={() => {
            setCurrentCourseLevel("intermediate");
            nav("/intermediate-readings");
          }}
        />
      </section>

      <section className="rounded-2xl border border-border bg-surface p-4">
        <div className="font-semibold">소스 반영 원칙</div>
        <p className="mt-1 text-sm text-text-muted">
          외부 기사는 앱에 복제하지 않고, 공개적으로 확인한 학습 방식과 주제 범주를 바탕으로 술술+ 내부 원본 콘텐츠를 제공합니다.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <SourcePill label="BBC/VOA/BNE" value="듣기·레벨형 뉴스" />
          <SourcePill label="SCMP/ST/Nikkei" value="아시아 사회·문화" />
          <SourcePill label="Guardian/Newsela" value="사회·레벨 조절" />
          <SourcePill label="Linguapress/Reddit" value="세미테크·쉬운 설명" />
        </div>
      </section>

      <button
        onClick={() => nav("/review?practice=1&source=intermediate-readings&n=5")}
        className="rounded-2xl border border-accent/50 bg-accent/10 px-4 py-3 text-sm font-medium"
      >
        중급 리딩 1분복습 풀기 →
      </button>
    </div>
  );
}

function LearningCard({
  emoji,
  title,
  desc,
  meta,
  onClick,
}: {
  emoji: string;
  title: string;
  desc: string;
  meta: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl border border-border bg-surface p-4 text-left active:scale-[0.99] transition-transform"
    >
      <div className="flex items-start gap-3">
        <div className="text-3xl">{emoji}</div>
        <div className="flex-1">
          <div className="font-semibold">{title}</div>
          <p className="mt-1 text-sm text-text-muted">{desc}</p>
          <div className="mt-2 text-xs text-text-muted">{meta}</div>
        </div>
        <div className="text-text-muted">→</div>
      </div>
    </button>
  );
}

function SourcePill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-2 px-3 py-2">
      <div className="font-semibold">{label}</div>
      <div className="mt-0.5 text-text-muted">{value}</div>
    </div>
  );
}
