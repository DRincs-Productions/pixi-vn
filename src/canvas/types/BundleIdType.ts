/**
 * An empty interface that can be augmented via `declare module '@drincs/pixi-vn/canvas'`
 * to constrain the set of valid asset bundle names to a known union of string literals.
 *
 * When this interface has no keys (the default), {@link BundleIdType} resolves to `string`,
 * preserving full backwards compatibility. Once you augment it, {@link BundleIdType} becomes
 * the union of the declared keys and the compiler will reject any unknown bundle name.
 *
 * The augmentation is typically written into an auto-generated declaration file by the
 * Vite plugin (see the `assetsManifest` option of `vitePluginPixivn`), but it can
 * also be written by hand.
 *
 * @example
 * ```ts
 * // pixi-vn.gen.d.ts  (auto-generated — do not edit manually)
 * declare module "@drincs/pixi-vn/canvas" {
 *     interface PixivnBundleIds {
 *         main: never;
 *         ui: never;
 *     }
 * }
 * export {};
 * ```
 */
// biome-ignore lint/suspicious/noEmptyInterface: intentionally empty — users augment this interface via `declare module "@drincs/pixi-vn/canvas"`
export interface PixivnBundleIds {}

/**
 * The type used wherever an asset bundle name is expected (e.g. `Assets.loadBundle`).
 *
 * - **Default** — resolves to `string` so that existing code that passes arbitrary strings
 *   continues to compile without any changes.
 * - **Augmented** — when {@link PixivnBundleIds} has been extended via
 *   `declare module "@drincs/pixi-vn/canvas"`, this type resolves to the union of the
 *   declared keys, giving you compile-time safety against typos and unknown bundle names.
 */
export type BundleIdType = [keyof PixivnBundleIds] extends [never] ? string : keyof PixivnBundleIds;
