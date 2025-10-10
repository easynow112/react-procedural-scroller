import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  preview: {
    port: 4173,
    strictPort: true,
  },
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  plugins: [react()],
});
