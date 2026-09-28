import { defineConfig, loadEnv } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import copy from "rollup-plugin-copy";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  // Load env berdasarkan mode (development / production)
  const env = loadEnv(mode, process.cwd(), "");

  return {
    base: env.VITE_BASENAME,
    plugins: [
      tanstackRouter(),
      react({
        babel: {
          plugins: [["babel-plugin-react-compiler"]],
        },
      }),
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: "auto",
        manifestFilename: "manifest.webmanifest.json",
        devOptions: {
          enabled: true,
          type: "module",
        },
        includeAssets: ["icons/icon-192.png", "icons/icon-512.png"],
        workbox: {
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
        },
        manifest: {
          name: "Portal Non Vendor",
          short_name: "Portal Non Vendor",
          start_url: "./",
          scope: "./",
          display: "standalone",
          background_color: "#ffffff",
          theme_color: "#2563eb",
          icons: [
            {
              src: "icons/icon-192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "icons/icon-512.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        },
      }),
      copy({
        targets: [{ src: "version.json", dest: "dist" }],
        hook: "writeBundle",
      }),
      tailwindcss(),
    ],
    server: {
      host: true,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
