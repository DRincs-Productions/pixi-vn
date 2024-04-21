import { GameStorageManager } from "../managers"
import StoredClassModel from "./StoredClassModel"

export interface ICharacterModelBase {
    name: string
    surname?: string
    age?: number
    icon?: string
    color?: string
}

/**
 * CharacterModelBase is a class that is used to create a character model.
 * I suggest you extend this class to create your own character models.
 * You must use the saveCharacter function to save the character in the game.
 * @example
 * ```typescript
 * export const liam = new CharacterModelBase('liam', {
 *     name: 'Liam',
 *     surname: 'Smith',
 *     age: 25,
 *     icon: "https://pixijs.com/assets/eggHead.png",
 *     color: "#9e2e12"
 * });
 * export const alice = new CharacterModelBase('alice', {
 *     name: 'Alice',
 *     surname: 'Smith',
 *     age: 25,
 *     icon: "https://pixijs.com/assets/eggHead.png",
 *     color: "#9e2e12"
 * });
 * saveCharacter([liam, alice]);
 * ```
 */
export default class CharacterModelBase extends StoredClassModel implements ICharacterModelBase {
    constructor(id: string, props: ICharacterModelBase) {
        super(GameStorageManager.keysSystem.CHARACTER_CATEGORY_ID, id)
        this.defaultName = props.name
        this.defaultSurname = props.surname
        this.defaultAge = props.age
        this._icon = props.icon
        this._color = props.color
    }
    private defaultName: string = ""
    get name(): string {
        return this.getStorageProperty<string>("name") || this.defaultName
    }
    set name(value: string) {
        this.updateStorageProperty<string>("name", value)
    }
    private defaultSurname?: string
    get surname(): string | undefined {
        return this.getStorageProperty<string>("surname") || this.defaultSurname
    }
    set surname(value: string | undefined) {
        this.updateStorageProperty<string>("surname", value)
    }
    private defaultAge?: number | undefined
    get age(): number | undefined {
        return this.getStorageProperty<number>("age") || this.defaultAge
    }
    set age(value: number | undefined) {
        this.updateStorageProperty<number>("age", value)
    }
    private _icon?: string
    get icon(): string | undefined {
        return this._icon
    }
    private _color?: string | undefined
    get color(): string | undefined {
        return this._color
    }
}
