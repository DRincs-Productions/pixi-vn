import ChoiceMenuOption from "../classes/ChoiceMenuOption";
import ChoiceMenuOptionClose from "../classes/ChoiceMenuOptionClose";

/**
 * Munu is a type that contains a list of Label that a player can choose from.
 * For Ren'py this is the equivalent of a menu.
 */
export type ChoiceMenuOptionsType<T extends {} = {}> = (ChoiceMenuOption<T> | ChoiceMenuOptionClose)[];
