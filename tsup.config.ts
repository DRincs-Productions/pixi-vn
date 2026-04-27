import { defineConfig, type Options } from "tsup";

export default defineConfig((options) => {
    const sourcemap = Boolean(options.watch);
    const createConfig = (config: Options): Options => ({
        sourcemap,
        ...config,
    });

    return [
        createConfig({
            target: "es2020",
            entry: {
                core: "src/core/index.ts",
            },
            format: ["cjs", "esm"],
            dts: true,
            treeshake: true,
            clean: true,
            minify: true,
            bundle: true,
            skipNodeModulesBundle: false,
            outExtension({ format }) {
                return {
                    js: format === "esm" ? ".mjs" : ".cjs",
                };
            },
        }),
        createConfig({
            target: "es2020",
            entry: {
                "pixi/index": "src/pixi-js/index.ts",
            },
            format: ["esm"],
            dts: true,
            splitting: false,
            clean: false,
            minify: true,
            bundle: true,
            external: ["pixi.js"],
        }),
        createConfig({
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
        }),
        createConfig({
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
                "@drincs/pixi-vn/core",
                "@drincs/pixi-vn/pixi.js",
                // external dependencies
                "tone",
                "@pixi/devtools",
            ],
            outExtension({ format }) {
                return {
                    js: format === "esm" ? ".mjs" : ".cjs",
                };
            },
        }),
        createConfig({
            target: "es2020",
            entry: {
                motion: "src/motion/index.ts",
            },
            format: ["cjs", "esm"],
            dts: true,
            treeshake: true,
            clean: false,
            minify: true,
            bundle: true,
            skipNodeModulesBundle: false,
            external: [
                "@drincs/pixi-vn/core",
                "@drincs/pixi-vn/pixi.js",
                // submodules
                "@drincs/pixi-vn/narration",
                "@drincs/pixi-vn/history",
                "@drincs/pixi-vn/storage",
                "@drincs/pixi-vn/canvas",
                "@drincs/pixi-vn/sound",
                "@drincs/pixi-vn/characters",
                // external dependencies
                "motion",
            ],
            outExtension({ format }) {
                return {
                    js: format === "esm" ? ".mjs" : ".cjs",
                };
            },
        }),
        createConfig({
            target: "es2020",
            entry: {
                index: "src/index.ts",
                vite: "src/vite/index.ts",
                "vite-listener": "src/vite-listener/index.ts",
            },
            format: ["cjs", "esm"], // Build for commonJS and ESmodules
            dts: true, // Generate declaration file (.d.ts)
            treeshake: true,
            clean: false,
            minify: true,
            bundle: true,
            skipNodeModulesBundle: false, // Skip bundling of node_modules
            external: [
                "@drincs/pixi-vn/core",
                "@drincs/pixi-vn/pixi.js",
                // submodules
                "@drincs/pixi-vn/narration",
                "@drincs/pixi-vn/history",
                "@drincs/pixi-vn/storage",
                "@drincs/pixi-vn/canvas",
                "@drincs/pixi-vn/sound",
                "@drincs/pixi-vn/characters",
                // animation
                "@drincs/pixi-vn/motion",
            ],
            outExtension({ format }) {
                return {
                    js: format === "esm" ? ".mjs" : ".cjs",
                };
            },
        }),
    ];
});
