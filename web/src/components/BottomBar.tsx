import { NavLink } from "react-router-dom";
import { stopSpeak } from "../lib/tts";
import { useStore } from "../lib/store";

export function BottomBar() {
  const currentCourseLevel = useStore(s => s.currentCourseLevel ?? "beginner");
  const reviewPath =
    currentCourseLevel === "advanced" ? "/review?practice=1&source=advanced&n=5" :
    currentCourseLevel === "intermediate" ? "/review?practice=1&source=intermediate&n=5" :
    "/review";
  const tabs = [
    { to: "/",           label: "오늘",     emoji: "🏠" },
    { to: reviewPath,    label: "1분학습", emoji: "⚡" },
    { to: "/memory-map", label: "메모리맵", emoji: "🗺️" },
    { to: "/toolbelt",   label: "도구",     emoji: "🛠️" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 safe-bottom">
      <div className="mx-auto w-full max-w-[480px] px-2 pt-2 pb-2 bg-surface/95 border-t border-border backdrop-blur">
        <ul className="flex">
          {tabs.map(t => (
            <li key={t.to} className="flex-1">
              <NavLink
                to={t.to}
                end={t.to === "/"}
                onClick={() => stopSpeak()}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 py-1.5 text-xs rounded-lg ${isActive ? "text-accent-strong font-semibold" : "text-text-muted"}`
                }
              >
                <span className="text-lg leading-none">{t.emoji}</span>
                {t.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
