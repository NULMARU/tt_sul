import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/icon-192.png", "icons/icon-512.png"],
      manifest: {
        name: "Sulsul+ 통합 영어 학습",
        short_name: "Sulsul+",
        description: "회로형 영어 학습 — 짬짬이 5분으로 이해→흡수→독해→출력→각인",
        start_url: "./",
        scope: "./",
        display: "standalone",
        orientation: "portrait",
        lang: "ko",
        background_color: "#FFFBF2",
        theme_color: "#F5C842",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
        shortcuts: [
          { name: "오늘의 복습",   short_name: "복습",     url: "./#/review",       description: "SRS 큐 풀기" },
          { name: "1분 복습",      short_name: "1분",      url: "./#/review?n=3",   description: "자투리 3문항" },
          { name: "오답 복습",     short_name: "오답",     url: "./#/review?wrong=1", description: "어제 틀린 문제" },
          { name: "오늘의 스토리", short_name: "스토리",   url: "./#/story/today",  description: "장문 독해" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,webp,woff2}"],
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === "https://cdn.jsdelivr.net",
            handler: "CacheFirst",
            options: { cacheName: "cdn-fonts", expiration: { maxEntries: 10, maxAgeSeconds: 31_536_000 } },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "../src"),
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5173,
    host: true,
    fs: {
      // ../src 의 공유 타입·시드를 dev 서버에서 import 허용
      strict: false,
      allow: [path.resolve(__dirname, ".."), path.resolve(__dirname)],
    },
  },
  optimizeDeps: {
    exclude: ["onnxruntime-web"],
  },
});
