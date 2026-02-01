// CommonJS-flavored TypeScript for bundles inside a "type": "module" package.
// This file intentionally uses CommonJS `module.exports`/`exports` so esbuild
// (through tsup) will treat it as CJS when building the browser bundle.
declare const globalThis: any;

const globalAny: any = globalThis || (global as any);
const PIXI = globalAny && globalAny.PIXI;

if (PIXI) {
    console.log("Using global PIXI for browser bundle.");
    Object.keys(PIXI).forEach((k) => {
        (exports as any)[k] = (PIXI as any)[k];
    });
    (exports as any).default = PIXI;
    Object.defineProperty(exports, "__esModule", { value: true });
} else {
    console.log("Falling back to require('pixi.js')");
    module.exports = require("pixi.js");
}
