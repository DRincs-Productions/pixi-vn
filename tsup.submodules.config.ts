import { defineConfig } from "tsup";

export default defineConfig({
    target: "es2020",
    entry: {
        narration: "src/narration/index.ts",
    },
    format: ["cjs", "esm"],
    dts: true,
    treeshake: true,
    splitting: false,
    clean: false,
    minify: true,
    bundle: true,
    skipNodeModulesBundle: false,
    external: ["@drincs/pixi-vn/unifier"],
    outExtension({ format }) {
        return {
            js: format === "esm" ? ".mjs" : ".cjs",
        };
    },
});
