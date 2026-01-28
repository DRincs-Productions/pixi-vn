import { defineConfig } from "tsup";

export default defineConfig({
    target: "es2020",
    entry: {
        pixi: "src/pixi-js/index.ts",
    },
    format: ["esm"],
    dts: true,
    treeshake: true,
    splitting: false,
    clean: false,
    minify: true,
    bundle: true,
    skipNodeModulesBundle: false,
    noExternal: ["pixi.js"],
});
