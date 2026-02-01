// In browser bundles we want to export the global `PIXI` (window.PIXI)
// while keeping the same named-export shape as `export * from "pixi.js"`.
declare var module: any;
declare var exports: any;

const globalAny: any = (globalThis as any) || (window as any);
const PIXI = globalAny && globalAny.PIXI;

if (PIXI) {
    Object.keys(PIXI).forEach((k) => {
        (exports as any)[k] = (PIXI as any)[k];
    });
    (exports as any).default = PIXI;
    Object.defineProperty(exports, "__esModule", { value: true });
} else {
    // Fallback to importing the module (e.g., in Node or bundlers that resolve it)
    module.exports = require("pixi.js");
}
