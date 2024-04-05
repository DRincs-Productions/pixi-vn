import { CharacterModelBase } from "../classes"

export const registeredCharacters: { [id: string]: CharacterModelBase } = {}
/**
 * Is a function that saves the character. If the character already exists, it will be overwritten.
 * @param character is the character to save
 * @returns 
 * @example
 * ```typescript
 * export const liam = new CharacterModelBase('liam', { name: 'Liam'});
 * export const alice = new CharacterModelBase('alice', { name: 'Alice'});
 * saveCharacter([liam, alice]);
 * ```
 */
export function saveCharacter<T extends CharacterModelBase = CharacterModelBase>(character: T | T[]) {
    if (Array.isArray(character)) {
        character.forEach(c => saveCharacter(c))
        return
    }
    if (registeredCharacters[character.id]) {
        console.warn(`Character id ${character.id} already exists, it will be overwritten`)
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
export function getCharacterById<T extends CharacterModelBase>(id: string): T | undefined {
    try {
        let character = registeredCharacters[id]
        if (!character) {
            console.error(`Character ${id} not found`)
            return
        }
        return character as T
    }
    catch (e) {
        console.error(e)
        return
    }
}
