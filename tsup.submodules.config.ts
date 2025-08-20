import { defineConfig } from "tsup";

export default defineConfig({
    target: "es2020",
    entry: {
        narration: "src/narration/index.ts",
        history: "src/history/index.ts",
        storage: "src/storage/index.ts",
    },
    format: ["cjs", "esm"],
    dts: true,
    treeshake: true,
    splitting: false,
    clean: false,
    minify: true,
    bundle: true,
    skipNodeModulesBundle: false,
    external: ["@drincs/pixi-vn/unifier", "@drincs/pixi-vn/pixi.js", "@pixi/sound", "@pixi/devtools", "motion"],
    outExtension({ format }) {
        return {
            js: format === "esm" ? ".mjs" : ".cjs",
        };
    },
});
