// tsup.config.ts per l'index
import { defineConfig } from "tsup";

// https://dev.to/orabazu/how-to-bundle-a-tree-shakable-typescript-library-with-tsup-and-publish-with-npm-3c46
export default defineConfig({
    target: "es2020",
    entry: {
        index: "src/index.ts",
    },
    format: ["cjs", "esm"], // Build for commonJS and ESmodules
    dts: true, // Generate declaration file (.d.ts)
    treeshake: true,
    splitting: false,
    // sourcemap: true, // Generate sourcemap, it was removed because otherwise it would explode
    clean: false,
    minify: true,
    bundle: true,
    skipNodeModulesBundle: false, // Skip bundling of node_modules
    external: [
        "@drincs/pixi-vn/unifier",
        "@drincs/pixi-vn/pixi.js",
        "@drincs/pixi-vn/narration",
        "@drincs/pixi-vn/history",
        "@drincs/pixi-vn/storage",
        "@drincs/pixi-vn/canvas",
        "@drincs/pixi-vn/sound",
    ],
    outExtension({ format }) {
        return {
            js: format === "esm" ? ".mjs" : ".cjs",
        };
    },
});
