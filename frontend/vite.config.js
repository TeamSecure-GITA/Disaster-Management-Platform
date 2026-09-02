import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // Exclude firebase-messaging-sw.js — it self-manages its own SW lifecycle
      includeAssets: ["favicon.ico", "robots.txt", "apple-touch-icon.png", "pwa-192x192.png", "pwa-512x512.png"],
      manifest: {
        name: "Disaster Management Platform",
        short_name: "DisasterApp",
        description: "Emergency alerts, disaster information, rescue centers and safety",
        theme_color: "#0f172a",
        background_color: "#0f172a",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        // Do NOT let workbox precache firebase-messaging-sw.js
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json}"],
        globIgnores: ["firebase-messaging-sw.js"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          // OpenStreetMap tiles — cache-first, 30 days
          {
            urlPattern: /^https:\/\/.*\.tile\.openstreetmap\.org\/.*$/,
            handler: "CacheFirst",
            options: {
              cacheName: "offline-map-tiles",
              expiration: { maxEntries: 500, maxAgeSeconds: 86400 * 30 },
            },
          },
          // Backend API — network-first with short timeout
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 100, maxAgeSeconds: 86400 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
});