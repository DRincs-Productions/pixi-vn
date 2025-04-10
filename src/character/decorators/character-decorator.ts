import { CharacterInterface } from "@drincs/pixi-vn";
import { logger } from "../../utils/log-utility";

export const registeredCharacters = new Map<string, CharacterInterface>();
/**
 * Is a function that saves the character. If the character already exists, it will be overwritten.
 * @param character is the character to save
 * @returns
 * @example
 * ```typescript
 * export const liam = new CharacterBaseModel('liam', { name: 'Liam'});
 * export const alice = new CharacterBaseModel('alice', { name: 'Alice'});
 * saveCharacter([liam, alice]);
 * ```
 */
export function saveCharacter<T extends CharacterInterface = CharacterInterface>(character: T | T[]) {
    if (Array.isArray(character)) {
        character.forEach((c) => saveCharacter(c));
        return;
    }
    if (registeredCharacters.get(character.id)) {
        logger.info(`Character id ${character.id} already exists, it will be overwritten`);
    }
    registeredCharacters.set(character.id, character);
}

/**
 * is a function that returns the character by the id
 * @param id is the id of the character
 * @returns the character
 * @example
 * ```typescript
 * const liam = getCharacterById('liam');
 * ```
 */
export function getCharacterById<T extends CharacterInterface>(id: string): T | undefined {
    try {
        let character = registeredCharacters.get(id);
        if (!character) {
            logger.error(`Character ${id} not found, did you forget to register it with the saveCharacter?`);
            return;
        }
        return character as T;
    } catch (e) {
        logger.error(`Error while getting Character ${id}`, e);
        return;
    }
}

/**
 * is a function that returns all characters
 * @returns all characters
 * @example
 * ```typescript
 * const allCharacters = getAllCharacters();
 * ```
 */
export function getAllCharacters<T extends CharacterInterface>(): T[] {
    return Object.values(registeredCharacters) as T[];
}
