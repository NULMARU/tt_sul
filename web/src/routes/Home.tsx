import { useStore } from "../lib/store";
import { NowCard } from "../components/NowCard";
import { CircuitDial } from "../components/CircuitDial";
import { DailyStoryCard } from "../components/DailyStoryCard";
import { AxisChips } from "../components/AxisChips";
import { bandLabel, currentTimeBand } from "../lib/time";

export function Home() {
  const stats = useStore(s => s.stats);
  const goal = useStore(s => s.prefs.dailyMinutesGoal);
  const todayMin = Math.floor(stats.totalStudySeconds / 60);
  const pct = Math.min(100, Math.round((todayMin / goal) * 100));
  const band = currentTimeBand();

  return (
    <div className="px-5 pt-6 pb-4 flex flex-col gap-4">
      {/* 상단 헤더 */}
      <header className="flex items-center justify-between">
        <div>
          <div className="text-sm text-text-muted">{bandLabel(band)} · 환영합니다</div>
          <div className="text-2xl font-bold mt-0.5">Sulsul+</div>
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

      {/* Now Card */}
      <NowCard />

      {/* Circuit Dial */}
      <section className="rounded-2xl border border-border bg-surface p-4">
        <div className="text-center text-sm text-text-muted">오늘의 회로 — 4모드 회전 학습</div>
        <CircuitDial />
        <div className="text-center text-xs text-text-muted mt-2">중앙 = 5스텝 풀 코스 · 외곽 = 단일 모드</div>
      </section>

      {/* Daily Story */}
      <DailyStoryCard />

      {/* 5축 칩 */}
      <section className="mt-2">
        <div className="text-sm text-text-muted mb-1.5">다른 축으로 탐색</div>
        <AxisChips />
      </section>
    </div>
  );
}
