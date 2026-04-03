import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import devtools from "solid-devtools/vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import solidPlugin from "vite-plugin-solid";
import svg from "vite-plugin-solid-svg";

export default defineConfig({
  plugins: [
    devtools(),
    solidPlugin(),
    tailwindcss(),
    svg(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "fonts/*.woff2"],
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        navigateFallbackDenylist: [/^\/api/],
      },
      manifest: {
        name: "The Scoreboard App",
        short_name: "Scoreboard",
        description:
          "A scoreboard web-app for tracking you and your friends scores in games - providing graphs and stats ",
        display: "standalone",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
  },
  build: {
    target: "esnext",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
