/**
 * An empty interface that can be augmented via `declare module '@drincs/pixi-vn/narration'`
 * to constrain the set of valid label IDs to a known union of string literals.
 *
 * When this interface has no keys (the default), {@link LabelIdType} resolves to `string`,
 * preserving full backwards compatibility. Once you augment it, {@link LabelIdType} becomes
 * the union of the declared keys and the compiler will reject any unknown label ID.
 *
 * The augmentation is typically written into an auto-generated declaration file by the
 * Vite plugin (see the `labelTypeFilePath` option of `vitePluginPixivn`), but it can
 * also be written by hand.
 *
 * @example
 * ```ts
 * // pixi-vn.gen.d.ts  (auto-generated — do not edit manually)
 * declare module "@drincs/pixi-vn/narration" {
 *     interface PixivnLabelIds {
 *         startLabel: never;
 *         menuLabel: never;
 *     }
 * }
 * export {};
 * ```
 */
// biome-ignore lint/suspicious/noEmptyInterface: intentionally empty — users augment this interface via `declare module "@drincs/pixi-vn/narration"`
export interface PixivnLabelIds {}

/**
 * The type used wherever a label ID is expected (e.g. `narration.call`, `narration.jump`,
 * `newLabel`, choice options, …).
 *
 * - **Default** — resolves to `string` so that existing code that passes arbitrary strings
 *   continues to compile without any changes.
 * - **Augmented** — when {@link PixivnLabelIds} has been extended via
 *   `declare module "@drincs/pixi-vn/narration"`, this type resolves to the union of the
 *   declared keys, giving you compile-time safety against typos and unknown label IDs.
 */
export type LabelIdType = [keyof PixivnLabelIds] extends [never] ? string : keyof PixivnLabelIds;
