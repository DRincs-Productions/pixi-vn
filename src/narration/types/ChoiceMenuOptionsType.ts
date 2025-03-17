import ChoiceMenuOption, { ChoiceMenuOptionClose } from "../classes/ChoiceMenuOption";

/**
 * Munu is a type that contains a list of Label that a player can choose from.
 * For Ren'py this is the equivalent of a menu.
 */
export type ChoiceMenuOptionsType<T extends {} = {}> = (ChoiceMenuOption<T> | ChoiceMenuOptionClose)[];
