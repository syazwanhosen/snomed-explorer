import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In local dev, Vite serves the React app.
// We proxy /api/* to Vercel's local dev server (vercel dev runs on 3000 by default).
// If you use `vercel dev` instead of `vite`, this proxy is not needed —
// both the frontend and serverless functions run on the same port.
// But if you run `vite` separately, uncomment the proxy block below.

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});