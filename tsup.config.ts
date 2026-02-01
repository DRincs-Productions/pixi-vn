import { defineConfig } from "tsup";

export default defineConfig([
    {
        target: "es2020",
        entry: {
            "pixi/index": "src/pixi-js/index.ts",
        },
        format: ["esm"],
        dts: true,
        splitting: false,
        clean: true,
        minify: true,
        bundle: true,
        external: ["pixi.js"],
    },
    {
        target: "es2020",
        entry: {
            "pixi/browser": "src/pixi-js/browser.cts",
        },
        format: ["esm"],
        dts: false,
        splitting: false,
        clean: false,
        minify: true,
        bundle: true,
        noExternal: ["pixi.js"],
    },
    {
        target: "es2020",
        entry: {
            unifier: "src/unifier/index.ts",
        },
        format: ["cjs", "esm"],
        dts: true,
        treeshake: true,
        clean: false,
        minify: true,
        bundle: true,
        skipNodeModulesBundle: false,
        outExtension({ format }) {
            return {
                js: format === "esm" ? ".mjs" : ".cjs",
            };
        },
    },
    {
        target: "es2020",
        entry: {
            narration: "src/narration/index.ts",
            history: "src/history/index.ts",
            storage: "src/storage/index.ts",
            canvas: "src/canvas/index.ts",
            sound: "src/sound/index.ts",
            characters: "src/characters/index.ts",
        },
        format: ["cjs", "esm"],
        dts: true,
        treeshake: true,
        clean: false,
        minify: true,
        bundle: true,
        skipNodeModulesBundle: false,
        external: [
            "@drincs/pixi-vn/unifier",
            "@drincs/pixi-vn/pixi.js",
            "@pixi/sound",
            "@pixi/devtools",
            "motion",
            "pixi.js",
        ],
        outExtension({ format }) {
            return {
                js: format === "esm" ? ".mjs" : ".cjs",
            };
        },
    },
    {
        target: "es2020",
        entry: {
            index: "src/index.ts",
            vite: "src/vite/index.ts",
            "vite-listener": "src/vite-listener/index.ts",
        },
        format: ["cjs", "esm"], // Build for commonJS and ESmodules
        dts: true, // Generate declaration file (.d.ts)
        treeshake: true,
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
            "@drincs/pixi-vn/characters",
        ],
        outExtension({ format }) {
            return {
                js: format === "esm" ? ".mjs" : ".cjs",
            };
        },
    },
]);
