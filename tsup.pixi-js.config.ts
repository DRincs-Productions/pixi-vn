import { defineConfig } from "tsup";

export default defineConfig({
    target: "es2020",
    entry: {
        pixi: "src/pixi-js/index.ts",
    },
    format: ["esm"],
    dts: true,
    splitting: false,
    clean: true,
    minify: true,
    bundle: true,
    skipNodeModulesBundle: false,
    external: ["pixi.js"],
});
