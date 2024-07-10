/**
 * CharacterBaseModelProps is an interface that is used to create a character model.
 */
export default interface CharacterBaseModelProps {
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
