import { defineConfig } from "tsup";

// https://dev.to/orabazu/how-to-bundle-a-tree-shakable-typescript-library-with-tsup-and-publish-with-npm-3c46
export default defineConfig({
    entry: ["src/**/*.ts"],
    format: ["cjs", "esm"], // Build for commonJS and ESmodules
    dts: true, // Generate declaration file (.d.ts)
    treeshake: true,
    splitting: false,
    // sourcemap: true, // Generate sourcemap, it was removed because otherwise it would explode
    clean: true,
    minify: true,
    bundle: true,
    skipNodeModulesBundle: false, // Skip bundling of node_modules
    entryPoints: ["src/index.ts"],
    noExternal: ["pixi.js", "@pixi/sound", "@pixi/devtools"],
});
