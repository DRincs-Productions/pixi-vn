declare global {
    const __VITE__: boolean | undefined;
    const __ROLLUP_PLUGIN__: boolean | undefined;
    const __webpack_require__: unknown;
}

import * as bundler from "pixi.js";
import * as browser from "./browser.cjs";

const isBundler =
    typeof __VITE__ !== "undefined" ||
    typeof __ROLLUP_PLUGIN__ !== "undefined" ||
    typeof __webpack_require__ !== "undefined";

const impl = isBundler ? bundler : browser;

export default impl;
export * from "pixi.js";
