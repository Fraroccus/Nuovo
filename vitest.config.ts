import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./tests/setupTests.ts",
    globals: true,
    coverage: {
      reporter: ["text", "html"],
    },
  },
});
