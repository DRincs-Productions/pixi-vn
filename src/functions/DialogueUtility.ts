import { DialogueBaseModel } from "../classes";
import { CharacterInterface } from "../interface";
import { narration } from "../managers";
import { ChoiceMenuOptionsType } from "../types/ChoiceMenuOptionsType";

/**
 * @deprecated Use narration.dialogue
 */
export function setDialogue<TCharacter extends CharacterInterface = CharacterInterface, TDialogue extends DialogueBaseModel = DialogueBaseModel>(props: {
    character: string | TCharacter,
    text: string | string[],
} | string | string[] | TDialogue): void {
    narration.dialogue = props
}

/**
 * @deprecated Use narration.dialogue
 */
export function getDialogue<T extends DialogueBaseModel = DialogueBaseModel>(): T | undefined {
    return narration.dialogue as T
}

/**
 * @deprecated Use narration.dialogue = undefined
 */
export function clearDialogue(): void {
    narration.dialogue = undefined
}

/**
 * @deprecated Use narration.choiceMenuOptions
 */
export function setChoiceMenuOptions(options: ChoiceMenuOptionsType<any>): void {
    narration.choiceMenuOptions = options
}

/**
 * @deprecated Use narration.choiceMenuOptions
 */
export function getChoiceMenuOptions<TChoice extends ChoiceMenuOptionsType = ChoiceMenuOptionsType<{ [key: string | number | symbol]: any }>>(): TChoice | undefined {
    return narration.choiceMenuOptions as TChoice
}

/**
 * @deprecated Use narration.choiceMenuOptions
 */
export function clearChoiceMenuOptions(): void {
    narration.choiceMenuOptions = undefined
}
