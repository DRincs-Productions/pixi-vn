import { CharacterStoredClass } from "../classes"

/**
 * CharacterInterface is the interface that character must implement or extend.
 * So if you want to create your own Character, you must override this interface, implement or extend it and extend the {@link CharacterStoredClass} class. 
 * You can override this interface to add your own props.
 * @example
 * ```typescript
 * // pixi-vn.types.ts
 * declare module '@drincs/pixi-vn/dist/override' {
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
 *         this._icon = props.icon
 *         this._color = props.color
 *     }
 *     private defaultName: string = ""
 *     get name(): string {
 *         return this.getStorageProperty<string>("name") || this.defaultName
 *     }
 *     set name(value: string | undefined) {
 *         this.setStorageProperty<string>("name", value)
 *     }
 *     private defaultSurname?: string
 *     get surname(): string | undefined {
 *         return this.getStorageProperty<string>("surname") || this.defaultSurname
 *     }
 *     set surname(value: string | undefined) {
 *         this.setStorageProperty<string>("surname", value)
 *     }
 *     private defaultAge?: number | undefined
 *     get age(): number | undefined {
 *         return this.getStorageProperty<number>("age") || this.defaultAge
 *     }
 *     set age(value: number | undefined) {
 *         this.setStorageProperty<number>("age", value)
 *     }
 *     private _icon?: string
 *     get icon(): string | undefined {
 *         return this._icon
 *     }
 *     private _color?: string | undefined
 *     get color(): string | undefined {
 *         return this._color
 *     }
 * }
 * ```
 */
export default interface CharacterInterface {
    /**
     * The name of the character.
     */
    name: string
    /**
     * The surname of the character.
     */
    surname?: string
    /**
     * The age of the character.
     */
    age?: number
    /**
     * The icon of the character.
     */
    readonly icon?: string
    /**
     * The color of the character.
     */
    readonly color?: string
}
