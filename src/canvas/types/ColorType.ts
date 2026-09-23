export interface RgbColorType {
    r: number;
    g: number;
    b: number;
}
export interface RgbaColorType extends RgbColorType {
    a: number;
}
export interface HslColorType {
    h: number;
    s: number;
    l: number;
}
export interface HslaColorType extends HslColorType {
    a: number;
}
export interface HsvColorType {
    h: number;
    s: number;
    v: number;
}
export interface HsvaColorType extends HsvColorType {
    a: number;
}

/**
 * A color, accepted wherever Pixi'VN takes one (e.g. {@link FlashInOutProps.color}): a hex number
 * (`0xff0000`), a CSS-style string (`"#f00"`, `"red"`, `"rgb(255, 0, 0)"`, ...), an `[r, g, b]`/
 * `[r, g, b, a]` array, or one of the plain RGB(A)/HSL(A)/HSV(A) object shapes above.
 *
 * This is a JSON-serializable subset of `pixi.js`'s own `ColorSource` (which every value here is
 * still assignable to, so it can be passed straight into `Graphics.fill()`/`tint`/etc. unchanged) -
 * deliberately excluding `Float32Array`/`Uint8Array`/`Uint8ClampedArray` (which survive a
 * `JSON.stringify`/`JSON.parse` round-trip but lose their typed-array-ness, coming back as a plain
 * `{0: r, 1: g, ...}` object) and PixiJS's own `Color` class instance (not serializable at all). Both
 * would break `createExportableElement()` (ticker args, saved game state, ...) the same way a live
 * `Filter`/callback reference did elsewhere in the codebase.
 */
export type ColorType =
    | string
    | number
    | number[]
    | RgbColorType
    | RgbaColorType
    | HslColorType
    | HslaColorType
    | HsvColorType
    | HsvaColorType;
