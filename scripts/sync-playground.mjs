/**
 * Copies the local dist/ into playground/node_modules/@drincs/pixi-vn/
 * as a real directory (not a symlink) so CRA's webpack can resolve
 * the exports field without symlink scope issues.
 */

import { cp, mkdir, writeFile, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const destDir = join(rootDir, "playground", "node_modules", "@drincs", "pixi-vn");

await mkdir(destDir, { recursive: true });

// Copy dist/
await cp(join(rootDir, "dist"), join(destDir, "dist"), { recursive: true });

// Copy package.json (needed for exports field resolution)
const pkg = await readFile(join(rootDir, "package.json"), "utf8");
await writeFile(join(destDir, "package.json"), pkg);

console.log("sync-playground: dist copied to playground/node_modules/@drincs/pixi-vn/");
