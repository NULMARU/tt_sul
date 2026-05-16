import { useNavigate } from "react-router-dom";
import { PHRASES } from "@shared/data/phrases.seed";
import { useStore } from "../lib/store";
import { memoryStrength } from "../lib/srs";
import { speak, waitForTtsIdle } from "../lib/tts";
import { activePatch } from "../lib/adaptive-ui";

export function MemoryMap() {
  const nav = useNavigate();
  const srs = useStore(s => s.srs);
  const patches = useStore(s => s.adaptiveUiPatches);
  const weakFirst = !!activePatch(patches, "memory-map", "change_default_filter");
  const phrases = weakFirst ? [...PHRASES].sort((a, b) => {
    const sa = memoryStrength(srs[`q-mc-${a.id}`]);
    const sb = memoryStrength(srs[`q-mc-${b.id}`]);
    return sa - sb;
  }) : PHRASES;

  return (
    <div className="px-5 pt-6 pb-4 flex flex-col gap-3">
      <header className="flex items-center gap-3">
        <button onClick={async () => { await waitForTtsIdle(); nav("/"); }} className="w-9 h-9 rounded-full hover:bg-surface-2">←</button>
        <h1 className="text-xl font-bold">Phrase Memory Map</h1>
      </header>
      <p className="text-sm text-text-muted">
        {weakFirst ? "복습이 필요한 표현부터 보여줍니다." : "표현 지도를 한눈에 봅니다."} 카드를 탭하면 발음을 들을 수 있어요.
      </p>
      <div className="rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs text-text-muted leading-relaxed">
        <b className="text-text">복습 필요</b>는 아직 맞힌 기록이 없거나 기억 강도가 낮은 표현이에요. 맞힌 기록이 쌓이면 <b className="text-text">익숙해짐</b>, <b className="text-text">기억 선명</b>으로 바뀝니다.
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {phrases.map(p => {
          const s = srs[`q-mc-${p.id}`];
          const strength = memoryStrength(s);
          const opacity = 0.18 + strength * 0.62;
          const status = memoryLabel(strength);
          return (
            <button
              key={p.id}
              className="min-h-[104px] rounded-xl border border-border flex flex-col items-start justify-between text-left px-3 py-3 active:scale-[0.99] transition-transform"
              style={{ background: `rgba(245,200,66,${opacity})` }}
              title={p.ko}
              onClick={() => speak(p.en)}
            >
              <span className="en text-[15px] leading-snug font-semibold line-clamp-2">{p.en}</span>
              <span className="text-xs text-text-muted line-clamp-2 mt-1">{p.ko}</span>
              <span className={`mt-2 rounded-full border px-2 py-0.5 text-[11px] ${status.className}`}>
                {status.label}
              </span>
            </button>
          );
        })}
      </div>

      <button onClick={async () => { await waitForTtsIdle(); nav("/review?practice=1&source=weak&n=10"); }} className="mt-2 rounded-xl bg-accent text-[#2A2522] px-4 py-3 font-medium">
        복습 필요한 표현 10개 연습 ▸
      </button>
    </div>
  );
}

function memoryLabel(strength: number): { label: string; className: string } {
  if (strength < 0.35) return { label: "복습 필요", className: "border-error/40 bg-error/10 text-error" };
  if (strength < 0.7) return { label: "익숙해짐", className: "border-warn/40 bg-warn/10 text-warn" };
  return { label: "기억 선명", className: "border-success/40 bg-success/10 text-success" };
}
