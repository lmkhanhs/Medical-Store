import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://13.231.191.87:8080 ",
        changeOrigin: true,
      },
      "/auth": {
        target: "http://13.231.191.87:8080",
        changeOrigin: true,
      },
    },
  },
  define: {
    global: "window",
  },
});
