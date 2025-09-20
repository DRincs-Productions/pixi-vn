import { CharacterInterface } from "@drincs/pixi-vn";
import { CachedMap } from "../../classes";
import { logger } from "../../utils/log-utility";

export const registeredCharacters = new CachedMap<string, CharacterInterface>({ cacheSize: 10 });

namespace RegisteredCharacters {
    /**
     * is a function that returns the character by the id
     * @param id is the id of the character
     * @returns the character
     * @example
     * ```typescript
     * const liam = RegisteredCharacters.get('liam');
     * ```
     */
    export function get<T = CharacterInterface>(id: string): T | undefined {
        try {
            let character = registeredCharacters.get(id);
            if (!character) {
                logger.warn(
                    `Character "${id}" not found, did you forget to register it with the RegisteredCharacters.add?`
                );
                return;
            }
            return character as T;
        } catch (e) {
            logger.error(`Error while getting Character "${id}"`, e);
            return;
        }
    }

    /**
     * Is a function that saves the character. If the character already exists, it will be overwritten.
     * @param character is the character to save
     * @returns
     * @example
     * ```typescript
     * export const liam = new CharacterBaseModel('liam', { name: 'Liam'});
     * export const alice = new CharacterBaseModel('alice', { name: 'Alice'});
     * RegisteredCharacters.add([liam, alice]);
     * ```
     */
    export function add(character: CharacterInterface | CharacterInterface[]) {
        if (Array.isArray(character)) {
            character.forEach((c) => add(c));
            return;
        }
        if (registeredCharacters.get(character.id)) {
            logger.info(`Character id "${character.id}" already exists, it will be overwritten`);
        }
        registeredCharacters.set(character.id, character);
    }

    /**
     * is a function that returns all characters
     * @returns all characters
     * @example
     * ```typescript
     * const allCharacters = RegisteredCharacters.values();
     * ```
     */
    export function values<T extends CharacterInterface>(): T[] {
        return Array.from(registeredCharacters.values()) as T[];
    }

    /**
     * Check if a character is registered.
     * @param id is the id of the character
     * @returns true if the character exists, false otherwise
     */
    export function has(id: string): boolean {
        return registeredCharacters.has(id);
    }

    /**
     * Get a list of all character ids registered.
     * @returns An array of label ids.
     */
    export function keys(): string[] {
        return Array.from(registeredCharacters.keys());
    }
}
export default RegisteredCharacters;
