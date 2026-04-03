import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (id.includes("@tiptap")) {
            return "tiptap";
          }

          if (
            id.includes("react-markdown")
            || id.includes("remark-")
            || id.includes("rehype-")
            || id.includes("katex")
          ) {
            return "markdown";
          }

          if (
            id.includes("jspdf")
            || id.includes("html2canvas")
            || id.includes("pdf-lib")
          ) {
            return "pdf";
          }

          if (id.includes("recharts") || id.includes("d3-")) {
            return "charts";
          }

          if (id.includes("framer-motion") || id.includes("motion")) {
            return "motion";
          }

          if (id.includes("three")) {
            return "three";
          }
        },
      },
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
  },
});
