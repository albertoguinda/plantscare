import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import auth from "auth-astro";
import vercel from "@astrojs/vercel/serverless";

export default defineConfig({
  vite: {
    // Configuramos el dev server para proxyar /esp32 -> tu ESP32-CAM
    server: {
      https: false,        // importante: sin HTTPS para evitar mixed-content
      proxy: {
        "/esp32": {
          target: "http://192.168.15.165",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/esp32/, ""),
        },
      },
    },
    plugins: [tailwindcss()],
  },
  integrations: [react(), auth()],
  output: "server",
  adapter: vercel(),
});
