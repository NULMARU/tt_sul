import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      maxWidth: { card: "480px" },
      colors: {
        // CSS variables 기반 (시간의 색으로 동적 전환)
        bg:           "var(--bg)",
        surface:      "var(--surface)",
        "surface-2":  "var(--surface-2)",
        border:       "var(--border)",
        text:         "var(--text)",
        "text-muted": "var(--text-muted)",
        accent:       "var(--accent)",
        "accent-strong": "var(--accent-strong)",
        success: "#10B981",
        error:   "#EF4444",
        warn:    "#F59E0B",
      },
      fontFamily: {
        sans: ['"Pretendard Variable"', "Pretendard", "system-ui", "-apple-system", "sans-serif"],
        en:   ['"Inter"', "system-ui", "-apple-system", "sans-serif"],
      },
      keyframes: {
        pop:   { "0%": { transform: "scale(0.92)" }, "60%": { transform: "scale(1.06)" }, "100%": { transform: "scale(1)" } },
        fadeUp:{ "0%": { opacity: "0", transform: "translateY(8px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
      animation: {
        pop:    "pop 280ms cubic-bezier(0.34,1.56,0.64,1)",
        fadeUp: "fadeUp 320ms ease-out",
      },
    },
  },
  plugins: [],
} satisfies Config;
