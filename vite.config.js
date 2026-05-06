import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/snowstorm": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/snowstorm/, ""),
      },
      // Proxy /api/* to the Node.js Express server
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});