/**
 * CharacterBaseModelProps is an interface that is used to create a character model.
 */
export default interface CharacterBaseModelProps {
    /**
     * The character's name.
     */
    name?: string;
    /**
     * The character's surname.
     */
    surname?: string;
    /**
     * The character's age.
     */
    age?: number;
    /**
     * The character's icon image URL.
     */
    icon?: string;
    /**
     * The character's color.
     */
    color?: string;
}
