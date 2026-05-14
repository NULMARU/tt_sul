import { getTimeBand } from "@shared/data/taxonomy";
import type { TimeBand } from "@shared/types/schema";

export function currentTimeBand(): TimeBand {
  return getTimeBand(new Date().getHours());
}

export function applyTimeOfDay() {
  const band = currentTimeBand();
  document.documentElement.setAttribute("data-time", band);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    const colors: Record<TimeBand, string> = {
      dawn:      "#0F172A",
      morning:   "#F5C842",
      midday:    "#4F46E5",
      afternoon: "#F97316",
      evening:   "#A78BFA",
      night:     "#0F172A",
    };
    meta.setAttribute("content", colors[band]);
  }
}

export function bandLabel(band: TimeBand): string {
  return ({ dawn: "새벽", morning: "아침", midday: "낮", afternoon: "오후", evening: "저녁", night: "밤" } as const)[band];
}

export function bandEmoji(band: TimeBand): string {
  return ({ dawn: "🌌", morning: "🌅", midday: "☀️", afternoon: "🌤️", evening: "🌆", night: "🌙" } as const)[band];
}
