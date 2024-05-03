import { GameStorageManager } from "../managers"
import StoredClassModel from "./StoredClassModel"

/**
 * CharacterBaseModelProps is an interface that is used to create a character model.
 */
export interface CharacterBaseModelProps {
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
    icon?: string
    /**
     * The color of the character.
     */
    color?: string
}

/**
 * CharacterBaseModel is a class that is used to create a character model.
 * I suggest you extend this class to create your own character models.
 * You must use the saveCharacter function to save the character in the game.
 * @example
 * ```typescript
 * export const liam = new CharacterBaseModel('liam', {
 *     name: 'Liam',
 *     surname: 'Smith',
 *     age: 25,
 *     icon: "https://pixijs.com/assets/eggHead.png",
 *     color: "#9e2e12"
 * });
 * export const alice = new CharacterBaseModel('alice', {
 *     name: 'Alice',
 *     surname: 'Smith',
 *     age: 25,
 *     icon: "https://pixijs.com/assets/eggHead.png",
 *     color: "#9e2e12"
 * });
 * saveCharacter([liam, alice]);
 * ```
 */
export default class CharacterBaseModel extends StoredClassModel implements CharacterBaseModelProps {
    /**
     * @param id The id of the character.
     * @param props The properties of the character.
     */
    constructor(id: string, props: CharacterBaseModelProps) {
        super(GameStorageManager.keysSystem.CHARACTER_CATEGORY_KEY, id)
        this.defaultName = props.name
        this.defaultSurname = props.surname
        this.defaultAge = props.age
        this._icon = props.icon
        this._color = props.color
    }
    private defaultName: string = ""
    /***
     * The name of the character.
     * If you set undefined, it will return the default name.
     */
    get name(): string {
        return this.getStorageProperty<string>("name") || this.defaultName
    }
    set name(value: string | undefined) {
        this.setStorageProperty<string>("name", value)
    }
    private defaultSurname?: string
    /**
     * The surname of the character.
     * If you set undefined, it will return the default surname.
     */
    get surname(): string | undefined {
        return this.getStorageProperty<string>("surname") || this.defaultSurname
    }
    set surname(value: string | undefined) {
        this.setStorageProperty<string>("surname", value)
    }
    private defaultAge?: number | undefined
    /**
     * The age of the character.
     * If you set undefined, it will return the default age.
     */
    get age(): number | undefined {
        return this.getStorageProperty<number>("age") || this.defaultAge
    }
    set age(value: number | undefined) {
        this.setStorageProperty<number>("age", value)
    }
    private _icon?: string
    /**
     * The icon of the character.
     */
    get icon(): string | undefined {
        return this._icon
    }
    private _color?: string | undefined
    /**
     * The color of the character.
     */
    get color(): string | undefined {
        return this._color
    }
}
