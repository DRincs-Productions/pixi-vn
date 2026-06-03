/**
 * An empty interface that can be augmented via `declare module '@drincs/pixi-vn/characters'`
 * to constrain the set of valid character IDs to a known union of string literals.
 *
 * When this interface has no keys (the default), {@link CharacterIdType} resolves to `string`,
 * preserving full backwards compatibility. Once you augment it, {@link CharacterIdType} becomes
 * the union of the declared keys and the compiler will reject any unknown character ID.
 *
 * The augmentation is typically written into an auto-generated declaration file by the
 * Vite plugin (see the `typeFilePath` option of `vitePluginPixivn`), but it can
 * also be written by hand.
 *
 * @example
 * ```ts
 * // pixi-vn.gen.d.ts  (auto-generated — do not edit manually)
 * declare module "@drincs/pixi-vn/characters" {
 *     interface PixivnCharacterIds {
 *         liam: never;
 *         emma: never;
 *     }
 * }
 * export {};
 * ```
 */
// biome-ignore lint/suspicious/noEmptyInterface: intentionally empty — users augment this interface via `declare module "@drincs/pixi-vn/characters"`
export interface PixivnCharacterIds {}

/**
 * The type used wherever a character ID is expected (e.g. `RegisteredCharacters.get`,
 * `RegisteredCharacters.has`, character constructors, …).
 *
 * - **Default** — resolves to `string` so that existing code that passes arbitrary strings
 *   continues to compile without any changes.
 * - **Augmented** — when {@link PixivnCharacterIds} has been extended via
 *   `declare module "@drincs/pixi-vn/characters"`, this type resolves to the union of the
 *   declared keys, giving you compile-time safety against typos and unknown character IDs.
 */
export type CharacterIdType = [keyof PixivnCharacterIds] extends [never]
    ? string
    : keyof PixivnCharacterIds;
