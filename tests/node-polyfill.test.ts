// @vitest-environment node

import { execFile } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { build, type Options } from "tsup";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import tsupConfig from "../tsup.config";

/**
 * Node.js 20 has no global `navigator` and pixi.js reads it while being evaluated.
 * These tests build `@drincs/pixi-vn/pixi.js` with the real tsup config and import it in a separate
 * Node.js process where `navigator` has been removed, so Node.js 20 is simulated on any Node.js version.
 */

const execFileAsync = promisify(execFile);
const root = resolve(__dirname, "..");
let outDir: string;

/** Runs `code` as an ES module in a new Node.js process without a global `navigator`. */
async function runWithoutNavigator(code: string) {
    const { stdout } = await execFileAsync(
        process.execPath,
        ["--input-type=module", "-e", `delete globalThis.navigator;\n${code}`],
        { cwd: root },
    );
    return stdout.trim();
}

beforeAll(async () => {
    // Inside node_modules so the built files can resolve `pixi.js`
    outDir = await mkdtemp(join(root, "node_modules", ".pixi-vn-node-polyfill-test-"));
    const configs = (tsupConfig as (overrideOptions: Options) => Options[])({});
    const pixiConfig = configs.find(
        (config) => !config.dts && config.entry && "pixi/index" in (config.entry as Record<string, string>),
    );
    if (!pixiConfig) throw new Error('tsup config for "pixi/index" not found');
    await build({ ...pixiConfig, config: false, silent: true, outDir });
}, 60_000);

afterAll(async () => {
    if (outDir) await rm(outDir, { recursive: true, force: true });
});

describe("Node.js navigator polyfill", () => {
    test("pixi.js cannot be imported without navigator (Node.js 20)", async () => {
        await expect(runWithoutNavigator('await import("pixi.js");')).rejects.toThrow(
            /navigator is not defined/,
        );
    }, 30_000);

    test("@drincs/pixi-vn/pixi.js can be imported without navigator (Node.js 20)", async () => {
        const url = pathToFileURL(join(outDir, "pixi", "index.js")).href;
        const stdout = await runWithoutNavigator(
            `const PIXI = await import(${JSON.stringify(url)});\n` +
                `console.log(typeof PIXI.Container, navigator.userAgent);`,
        );
        expect(stdout).toBe(`function Node.js/${process.version}`);
    }, 30_000);

    test("an existing navigator is not replaced (Node.js 22+ and browsers)", async () => {
        const url = pathToFileURL(join(outDir, "pixi", "node-polyfill.js")).href;
        const stdout = await runWithoutNavigator(
            `globalThis.navigator = { userAgent: "existing" };\n` +
                `await import(${JSON.stringify(url)});\n` +
                `console.log(navigator.userAgent);`,
        );
        expect(stdout).toBe("existing");
    }, 30_000);
});
