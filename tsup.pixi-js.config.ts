import { defineConfig } from "tsup";

export default defineConfig({
    target: "es2020",
    entry: {
        "pixi.js": "src/pixi-js/index.ts",
    },
    format: ["cjs", "esm"],
    dts: true,
    treeshake: true,
    splitting: false,
    clean: false,
    minify: true,
    bundle: true,
    skipNodeModulesBundle: false,
    noExternal: ["pixi.js"],
    outExtension({ format }) {
        return {
            js: format === "esm" ? ".mjs" : ".cjs",
        };
    },
});
