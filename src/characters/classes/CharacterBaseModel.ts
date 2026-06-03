import CharacterStoredClass from "@characters/classes/CharacterStoredClass";
import RegisteredCharacters from "@characters/decorators/RegisteredCharacters";
import type CharacterBaseModelProps from "@characters/interfaces/CharacterBaseModelProps";
import type { CharacterEmotionId } from "@characters/types/CharacterEmotionId";

/**
 * CharacterBaseModel is a class that is used to create a character model.
 * You must use the {@link RegisteredCharacters.add} function to save the character in the game.
 * It is raccomended to create your own class Character, read more here: https://pixi-vn.com/start/character.html#custom-character
 * @example
 * ```ts
 * import { CharacterBaseModel, RegisteredCharacters } from "@drincs/pixi-vn";
 *
 * export const liam = new CharacterBaseModel("liam", {
 *     name: "Liam",
 *     surname: "Smith",
 *     age: 25,
 *     icon: "https://example.com/liam.png",
 *     color: "#9e2e12",
 * });
 *
 * export const emma = new CharacterBaseModel("emma", {
 *     name: "Emma",
 *     surname: "Johnson",
 *     age: 23,
 *     icon: "https://example.com/emma.png",
 *     color: "#9e2e12",
 * });
 *
 * RegisteredCharacters.add([liam, emma]);
 * ```
 */
export default class CharacterBaseModel extends CharacterStoredClass {
    /**
     * @param id A unique identifier (string). It is used to reference the character in the game (must be unique). If you want to create a character with an "emotion", you can pass an object.
     * @param props The properties of the character.
     */
    constructor(id: string | CharacterEmotionId, props: CharacterBaseModelProps) {
        super(typeof id === "string" ? id : id.id, typeof id === "string" ? "" : id.emotion);
        this.defaultName = props.name;
        this.defaultSurname = props.surname;
        this.defaultAge = props.age;
        this.icon = props.icon;
        this.color = props.color;
    }
    readonly defaultName?: string;
    /***
     * The name of the character.
     * If you set undefined, it will return the default name.
     */
    get name(): string {
        return this.getStorageProperty<string>("name") || this.defaultName || this.id;
    }
    set name(value: string | undefined) {
        this.setStorageProperty("name", value);
    }
    readonly defaultSurname?: string;
    /**
     * The surname of the character.
     * If you set undefined, it will return the default surname.
     */
    get surname(): string | undefined {
        return this.getStorageProperty<string>("surname") || this.defaultSurname;
    }
    set surname(value: string | undefined) {
        this.setStorageProperty("surname", value);
    }
    readonly defaultAge?: number | undefined;
    /**
     * The age of the character.
     * If you set undefined, it will return the default age.
     */
    get age(): number | undefined {
        return this.getStorageProperty<number>("age") || this.defaultAge;
    }
    set age(value: number | undefined) {
        this.setStorageProperty("age", value);
    }
    /**
     * The icon of the character.
     */
    readonly icon?: string;
    /**
     * The color of the character.
     */
    readonly color?: string | undefined;
}
