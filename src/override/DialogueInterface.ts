/**
 * DialogueInterface is the type of dialogue used in the game.
 * So if you want to create your own Dialogue, you must override this interface. If you want to create your own Dialogue class, you must extend or implement this interface.
 * Keep in mind that this class will be saved on storage as json with JSON.stringify and JSON.parse, so you can't use functions or classes that are not serializable.
 * You can override this interface to add your own props.
 * @example
 * ```typescript
 * // pixi-vn.types.ts
 * declare module '@drincs/pixi-vn/dist/override' {
 *     interface DialogueInterface {
 *         color: string
 *     }
 * }
 * ```
 */
export default interface DialogueInterface { }
