import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/health": "http://localhost:3001",
      "/promociones": "http://localhost:3001",
      "/productos": "http://localhost:3001",
      "/resumen": "http://localhost:3001",
    },
  },
  test: {
    environment: "node",
  },
});
