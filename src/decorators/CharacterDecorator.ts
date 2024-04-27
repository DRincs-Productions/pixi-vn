import { CharacterBaseModel } from "../classes"

export const registeredCharacters: { [id: string]: CharacterBaseModel } = {}
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
export function saveCharacter<T extends CharacterBaseModel = CharacterBaseModel>(character: T | T[]) {
    if (Array.isArray(character)) {
        character.forEach(c => saveCharacter(c))
        return
    }
    if (registeredCharacters[character.id]) {
        console.warn(`[Pixi'VN] Character id ${character.id} already exists, it will be overwritten`)
    }
    registeredCharacters[character.id] = character
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
export function getCharacterById<T extends CharacterBaseModel>(id: string): T | undefined {
    try {
        let character = registeredCharacters[id]
        if (!character) {
            console.error(`[Pixi'VN] Character ${id} not found`)
            return
        }
        return character as T
    }
    catch (e) {
        console.error(`[Pixi'VN] Error while getting Character ${id}`, e)
        return
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
export function getAllCharacters<T extends CharacterBaseModel>(): T[] {
    return Object.values(registeredCharacters) as T[]
}
