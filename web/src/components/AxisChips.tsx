import { useNavigate } from "react-router-dom";

const axes = [
  { to: "/axis/day",       label: "일자", emoji: "📅" },
  { to: "/axis/stage",     label: "단계", emoji: "🪜" },
  { to: "/axis/place",     label: "장소", emoji: "🗺️" },
  { to: "/axis/situation", label: "상황", emoji: "🎬" },
  { to: "/axis/time",      label: "시간", emoji: "⏰" },
];

export function AxisChips() {
  const nav = useNavigate();
  return (
    <div className="flex gap-2 overflow-x-auto py-1 -mx-1 px-1">
      {axes.map(a => (
        <button
          key={a.to}
          className="shrink-0 rounded-full bg-surface border border-border px-3 py-1.5 text-sm active:scale-95"
          onClick={() => nav(a.to)}
        >
          {a.emoji} {a.label}
        </button>
      ))}
    </div>
  );
}
