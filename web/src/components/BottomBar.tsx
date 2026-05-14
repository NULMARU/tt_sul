import { NavLink } from "react-router-dom";

const tabs = [
  { to: "/review",     label: "1분복습", emoji: "⚡" },
  { to: "/",           label: "오늘",    emoji: "🏠" },
  { to: "/memory-map", label: "메모리맵",emoji: "🗺️" },
  { to: "/toolbelt",   label: "도구",    emoji: "🛠️" },
];

export function BottomBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 safe-bottom">
      <div className="app-shell px-2 pt-2 pb-2 bg-surface/95 border-t border-border backdrop-blur">
        <ul className="flex">
          {tabs.map(t => (
            <li key={t.to} className="flex-1">
              <NavLink
                to={t.to}
                end={t.to === "/"}
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
