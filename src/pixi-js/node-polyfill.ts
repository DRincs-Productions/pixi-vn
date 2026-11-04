/**
 * pixi.js reads the global `navigator` while its modules are being evaluated (e.g. `isSafari()`),
 * so importing it from Node.js (Vite config files, plugins that load game content via `ssrLoadModule`,
 * tests) throws `ReferenceError: navigator is not defined` on Node.js 20, which has no global `navigator`.
 *
 * Node.js 22 and later already define a global `navigator` (as browsers do), so there this module does
 * nothing: it is only needed while Node.js 20 is supported and can be removed afterwards.
 *
 * It must stay a separate module imported before `pixi.js` (see `src/pixi-js/index.ts` and `tsup.config.ts`):
 * ES modules evaluate their imports in order, while code bundled inline would run after `pixi.js`.
 */
if (typeof globalThis.navigator === "undefined") {
    Object.defineProperty(globalThis, "navigator", {
        value: { userAgent: `Node.js/${globalThis.process?.version}` },
        configurable: true,
        writable: true,
    });
}
