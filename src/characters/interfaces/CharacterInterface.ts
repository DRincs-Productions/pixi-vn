/**
 * CharacterInterface is the interface that character must implement or extend.
 * So if you want to create your own Character, you must override this interface, implement or extend it and extend the {@link CharacterStoredClass} class.
 * You can override this interface to add your own props.
 * @example
 * ```typescript
 * // pixi-vn.d.ts
 * declare module '@drincs/pixi-vn' {
 *     interface CharacterInterface {
 *         name: string
 *         surname?: string
 *         age?: number
 *         icon?: string
 *         color?: string
 *     }
 * }
 * // You Character class
 * export class Character extends CharacterStoredClass implements CharacterInterface {
 *     constructor(id: string, props: CharacterProps) {
 *         super(id)
 *         this.defaultName = props.name
 *         this.defaultSurname = props.surname
 *         this.defaultAge = props.age
 *         this.icon = props.icon
 *         this.color = props.color
 *     }
 *     readonly defaultName: string = ""
 *     get name(): string {
 *         return this.getStorageProperty<string>("name") || this.defaultName
 *     }
 *     set name(value: string | undefined) {
 *         this.setStorageProperty("name", value)
 *     }
 *     readonly defaultSurname?: string
 *     get surname(): string | undefined {
 *         return this.getStorageProperty<string>("surname") || this.defaultSurname
 *     }
 *     set surname(value: string | undefined) {
 *         this.setStorageProperty("surname", value)
 *     }
 *     readonly defaultAge?: number | undefined
 *     get age(): number | undefined {
 *         return this.getStorageProperty<number>("age") || this.defaultAge
 *     }
 *     set age(value: number | undefined) {
 *         this.setStorageProperty("age", value)
 *     }
 *     readonly icon?: string
 *     get icon(): string | undefined {
 *         return this._icon
 *     }
 *     readonly color?: string | undefined
 * }
 * ```
 */
export default interface CharacterInterface {
    /**
     * The id of the character. It must be unique.
     */
    id: string;
}
