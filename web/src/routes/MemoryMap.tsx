import { useNavigate } from "react-router-dom";
import { PHRASES } from "@shared/data/phrases.seed";
import { useStore } from "../lib/store";
import { memoryStrength } from "../lib/srs";
import { speak } from "../lib/tts";

export function MemoryMap() {
  const nav = useNavigate();
  const srs = useStore(s => s.srs);

  return (
    <div className="px-5 pt-6 pb-4 flex flex-col gap-3">
      <header className="flex items-center gap-3">
        <button onClick={() => nav("/")} className="w-9 h-9 rounded-full hover:bg-surface-2">←</button>
        <h1 className="text-xl font-bold">🗺️ Phrase Memory Map</h1>
      </header>
      <p className="text-xs text-text-muted">색이 옅을수록 기억이 흐려진 표현입니다. 탭하여 발음 듣기.</p>

      <div className="grid grid-cols-4 gap-1.5">
        {PHRASES.map(p => {
          const s = srs[`q-mc-${p.id}`];
          const strength = memoryStrength(s);
          const opacity = 0.15 + strength * 0.75;
          return (
            <button
              key={p.id}
              className="aspect-square rounded-lg border border-border flex items-center justify-center text-[10px] text-center px-1"
              style={{ background: `rgba(245,200,66,${opacity})` }}
              title={p.ko}
              onClick={() => speak(p.en)}
            >
              <span className="en line-clamp-3">{p.en.replace(/^I\s+/, "")}</span>
            </button>
          );
        })}
      </div>

      <button onClick={() => nav("/review?n=10")} className="mt-2 rounded-xl bg-accent text-[#2A2522] px-4 py-3 font-medium">
        흐려진 표현 10개 복습 ▸
      </button>
    </div>
  );
}
