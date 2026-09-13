import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "node:path";

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      // Next's "server-only" import-guard has no meaning under Vitest's node
      // environment; alias it to a no-op so test files don't each need their
      // own `vi.mock("server-only", () => ({}))`. Existing per-file mocks
      // still work fine alongside this.
      "server-only": path.resolve(__dirname, "test/stubs/server-only.ts"),
    },
  },
  test: {
    environment: "node",
  },
});