import { CharacterModelBase } from "../classes"

export const registeredCharacters: { [tag: string]: CharacterModelBase } = {}
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
        console.warn(`Character tag ${character.id} already exists, it will be overwritten`)
    }
    registeredCharacters[character.id] = character
}

/**
 * is a function that returns the character by the tag
 * @param tag is the tag of the character
 * @returns the character
 * @example
 * ```typescript
 * const liam = getCharacterByTag('liam');
 * ```
 */
export function getCharacterByTag<T extends CharacterModelBase>(tag: string): T | undefined {
    try {
        let character = registeredCharacters[tag]
        if (!character) {
            console.error(`Character ${tag} not found`)
            return
        }
        return character as T
    }
    catch (e) {
        console.error(e)
        return
    }
}
