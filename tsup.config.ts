import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/**/*@(ts|tsx)"],
    format: ["cjs", "esm"], // Build for commonJS and ESmodules
    dts: true, // Generate declaration file (.d.ts)
    treeshake: true,
    splitting: false,
    sourcemap: true,
    clean: true,
});
