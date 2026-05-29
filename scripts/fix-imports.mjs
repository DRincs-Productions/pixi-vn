/**
 * Post-build script: replaces self-referential @drincs/pixi-vn/* imports
 * with relative paths so bundlers that don't support the package exports field
 * (e.g. older CodeSandbox/Sandpack bundlers) don't fall into an infinite
 * resolution loop.
 *
 * The import maps are derived automatically from package.json "exports".
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const distDir = join(rootDir, "dist");

const pkg = JSON.parse(await readFile(join(rootDir, "package.json"), "utf8"));
const pkgName = pkg.name;

// Build ESM and CJS maps from package.json "exports"
// e.g. "./core" → { import: "./dist/core.mjs", require: "./dist/core.cjs" }
// becomes "@drincs/pixi-vn/core" → { esm: "./core.mjs", cjs: "./core.cjs" }
const esmMap = {};
const cjsMap = {};

for (const [subpath, conditions] of Object.entries(pkg.exports ?? {})) {
    if (subpath === ".") continue; // skip main entry

    const specifier = pkgName + subpath.slice(1); // "./core" → "@drincs/pixi-vn/core"

    if (conditions.import) {
        esmMap[specifier] = conditions.import.replace("./dist/", "./");
    }
    const cjsPath = conditions.require ?? conditions.import;
    if (cjsPath) {
        cjsMap[specifier] = cjsPath.replace("./dist/", "./");
    }
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function applyMap(content, map) {
    for (const [from, to] of Object.entries(map)) {
        const escaped = escapeRegex(from);
        content = content
            .replace(new RegExp(`from'${escaped}'`, "g"), `from'${to}'`)
            .replace(new RegExp(`from"${escaped}"`, "g"), `from"${to}"`)
            .replace(new RegExp(`require\\('${escaped}'\\)`, "g"), `require('${to}')`)
            .replace(new RegExp(`require\\("${escaped}"\\)`, "g"), `require("${to}")`);
    }
    return content;
}

const files = await readdir(distDir);
let fixed = 0;

for (const file of files) {
    const isMjs = file.endsWith(".mjs");
    const isCjs = file.endsWith(".cjs");
    if (!isMjs && !isCjs) continue;

    const filePath = join(distDir, file);
    const original = await readFile(filePath, "utf8");
    const updated = applyMap(original, isMjs ? esmMap : cjsMap);

    if (updated !== original) {
        await writeFile(filePath, updated, "utf8");
        console.log(`  fixed: ${file}`);
        fixed++;
    }
}

console.log(`fix-imports: ${fixed} file${fixed !== 1 ? "s" : ""} updated.`);
