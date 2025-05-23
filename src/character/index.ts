export { default as CharacterBaseModel } from "./classes/CharacterBaseModel";
export { default as CharacterStoredClass } from "./classes/CharacterStoredClass";
export {
    getAllCharacters,
    getCharacterById,
    default as RegisteredCharacters,
    saveCharacter,
} from "./decorators/character-decorator";
export type { default as CharacterInterface } from "./interfaces/CharacterInterface";
