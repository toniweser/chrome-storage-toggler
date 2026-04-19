import { resolve } from "node:path";
import { defineConfig } from "vite";

// Separate build for the content script: Chrome loads it as a classic
// script (not an ES module), so it must be self-contained — no imports,
// no chunk splitting. We build it as an IIFE in its own Vite pass so that
// shared code (e.g. @/shared/*) gets inlined instead of extracted into a chunk.
export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: false,
    target: "es2020",
    rolldownOptions: {
      input: resolve(__dirname, "src/content/index.ts"),
      output: {
        entryFileNames: "content.js",
        format: "iife",
      },
    },
  },
});
