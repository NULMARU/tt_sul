import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PLACE_META } from "@shared/data/taxonomy";
import { PHRASES } from "@shared/data/phrases.seed";
import { LESSONS } from "@shared/data/stages.seed";
import type { PlaceTag } from "@shared/types/schema";

export function AxisPlace() {
  const nav = useNavigate();
  const [sel, setSel] = useState<PlaceTag | null>(null);

  const placeKeys = Object.keys(PLACE_META) as PlaceTag[];
  const home = placeKeys.filter(k => PLACE_META[k].group === "home");
  const city = placeKeys.filter(k => PLACE_META[k].group === "city");

  function phrasesIn(place: PlaceTag) {
    return PHRASES.filter(p => p.coords.places?.includes(place));
  }
  function lessonsIn(place: PlaceTag) {
    return LESSONS.filter(l => l.coords.places?.includes(place));
  }

  return (
    <div className="px-5 pt-6 pb-4 flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <button onClick={() => nav("/")} className="w-9 h-9 rounded-full hover:bg-surface-2">←</button>
        <h1 className="text-xl font-bold">🗺️ 장소</h1>
      </header>

      <Section title="🏠 집" places={home} PlaceBtn={PlaceButton(setSel, phrasesIn)} />
      <Section title="🏙️ 도시" places={city} PlaceBtn={PlaceButton(setSel, phrasesIn)} />

      {sel && (
        <div className="rounded-2xl border border-border bg-surface p-4 mt-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{PLACE_META[sel].emoji}</span>
            <h2 className="font-semibold">{PLACE_META[sel].ko}</h2>
            <span className="text-xs text-text-muted ml-auto">표현 {phrasesIn(sel).length}개</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {phrasesIn(sel).slice(0, 12).map(p => (
              <span key={p.id} className="text-xs en rounded-full bg-surface-2 border border-border px-2 py-1">{p.en}</span>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-1.5">
            {lessonsIn(sel).slice(0, 4).map(l => (
              <button key={l.id} onClick={() => nav(`/lesson/${l.id}`)} className="text-left text-sm rounded-lg bg-surface-2 border border-border px-3 py-2">
                ▶ {l.title} — {l.subtitle}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, places, PlaceBtn }: { title: string; places: PlaceTag[]; PlaceBtn: (p: PlaceTag) => JSX.Element }) {
  return (
    <section>
      <h2 className="text-xs text-text-muted font-semibold mb-2">{title}</h2>
      <div className="grid grid-cols-4 gap-2">
        {places.map(PlaceBtn)}
      </div>
    </section>
  );
}

function PlaceButton(setSel: (p: PlaceTag) => void, phrasesIn: (p: PlaceTag) => unknown[]) {
  return (p: PlaceTag) => {
    const m = PLACE_META[p];
    const n = phrasesIn(p).length;
    const intensity = Math.min(1, n / 12);
    return (
      <button
        key={p}
        onClick={() => setSel(p)}
        className="aspect-square rounded-xl border border-border bg-surface flex flex-col items-center justify-center gap-0.5 active:scale-95"
        style={{ backgroundColor: `rgba(245,200,66,${0.05 + intensity * 0.25})` }}
      >
        <span className="text-2xl">{m.emoji}</span>
        <span className="text-[11px] text-text-muted">{m.ko}</span>
        {n > 0 && <span className="text-[10px] text-text-muted">{n}</span>}
      </button>
    );
  };
}
