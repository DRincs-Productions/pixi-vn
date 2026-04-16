import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [tsconfigPaths({ projects: ["./tsconfig.json", "./tests/tsconfig.json"] })],
    test: {
        environment: "jsdom",
        setupFiles: ["tests/setup.ts"],
    },
});
