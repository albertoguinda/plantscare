import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import auth from "auth-astro";
import vercel from "@astrojs/vercel/serverless";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [react(), auth()],
  output: "server",
  adapter: vercel(),
});
