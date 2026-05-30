import { defineConfig } from "vitest/config";

// Unified test config. jsdom + setup file support Track B's component tests
// (.test.tsx) while still running Track A's pure-core tests (.test.ts).
export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    setupFiles: ["./src/test/setup.ts"],
    css: false,
  },
});
