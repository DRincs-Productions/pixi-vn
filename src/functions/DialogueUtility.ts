import { CharacterModelBase, DialogueModelBase } from "../classes";
import { IStoratedChoiceMenuOptionLabel } from "../classes/ChoiceMenuOptionLabel";
import { getLabelTypeByClassName } from "../decorators/LabelDecorator";
import { IDialogueHistory } from "../interface";
import { GameStepManager, GameStorageManager } from "../managers";
import { ChoiceMenuOptionsType } from "../types/ChoiceMenuOptionsType";

/**
 * Set the dialogue to be shown in the game
 * @param text Text of the dialogue
 * @example
 * ```typescript
 * setDialogue("Hello World")
 * setDialogue({
 *       character: "characterTag",
 *       text: "Hello World"
 * })
 * ```
 */
export function setDialogue(props: {
    character: string | CharacterModelBase,
    text: string,
} | string): void {
    let text = ''
    let characterTag: string | undefined = undefined
    if (typeof props === 'string') {
        text = props
    }
    else {
        text = props.text
        if (props.character) {
            if (typeof props.character === 'string') {
                characterTag = props.character
            }
            else {
                characterTag = props.character.id
            }
        }
    }
    let dialogue = new DialogueModelBase(text, characterTag)
    GameStorageManager.setVariable(GameStorageManager.keysSystem.CURRENT_DIALOGUE_MEMORY_KEY, dialogue)
    GameStorageManager.setVariable(GameStorageManager.keysSystem.LAST_DIALOGUE_ADDED_IN_STEP_MEMORY_KEY, GameStepManager.lastStepIndex)
}

/**
 * Get the dialogue to be shown in the game
 * @returns Dialogue to be shown in the game
 */
export function getDialogue(): DialogueModelBase | undefined {
    return GameStorageManager.getVariable<DialogueModelBase>(GameStorageManager.keysSystem.CURRENT_DIALOGUE_MEMORY_KEY)
}

/**
 * Clear the dialogue to be shown in the game
 */
export function clearDialogue(): void {
    GameStorageManager.setVariable(GameStorageManager.keysSystem.CURRENT_DIALOGUE_MEMORY_KEY, undefined)
}

/**
 * Set the options to be shown in the game
 * @param options Options to be shown in the game
 * @example
 * ```typescript
 * setChoiceMenuOptions([
 *     new ChoiceMenuOptionLabel("Events Test", EventsTestLabel),
 *     new ChoiceMenuOptionLabel("Show Image Test", ShowImageTest),
 *     new ChoiceMenuOptionLabel("Ticker Test", TickerTestLabel),
 *     new ChoiceMenuOptionLabel("Tinting Test", TintingTestLabel),
 *     new ChoiceMenuOptionLabel("Base Canvas Element Test Label", BaseCanvasElementTestLabel)
 * ])
 * ```
 */
export function setChoiceMenuOptions(options: ChoiceMenuOptionsType): void {
    let value: IStoratedChoiceMenuOptionLabel[] = options.map((option) => {
        return {
            ...option,
            label: option.label.name
        }
    })
    GameStorageManager.setVariable(GameStorageManager.keysSystem.CURRENT_MENU_OPTIONS_MEMORY_KEY, value)
    GameStorageManager.setVariable(GameStorageManager.keysSystem.LAST_MENU_OPTIONS_ADDED_IN_STEP_MEMORY_KEY, GameStepManager.lastStepIndex)
}

/**
 * Get the options to be shown in the game
 * @returns Options to be shown in the game
 */
export function getChoiceMenuOptions(): ChoiceMenuOptionsType | undefined {
    let d = GameStorageManager.getVariable<IStoratedChoiceMenuOptionLabel[]>(GameStorageManager.keysSystem.CURRENT_MENU_OPTIONS_MEMORY_KEY)
    if (d) {
        let options: ChoiceMenuOptionsType = []
        d.forEach((option) => {
            let label = getLabelTypeByClassName(option.label)
            if (label) {
                options.push({
                    ...option,
                    label: label
                })
            }
        })
        return options
    }
    return undefined
}

/**
 * Clear the options to be shown in the game
 */
export function clearChoiceMenuOptions(): void {
    GameStorageManager.setVariable(GameStorageManager.keysSystem.CURRENT_MENU_OPTIONS_MEMORY_KEY, undefined)
}

/**
 * Get the history of the dialogues
 * @returns the history of the dialogues
 */
export function getDialogueHistory<T extends DialogueModelBase = DialogueModelBase>(): IDialogueHistory<T>[] {
    let list: IDialogueHistory<T>[] = []
    GameStepManager.stepsHistory.forEach((step) => {
        let dialoge = step.dialoge
        let requiredChoices = step.choices
        if (
            list.length > 0 &&
            list[list.length - 1].choices && !list[list.length - 1].choiceMade &&
            step.currentLabel
        ) {
            let oldChoices = list[list.length - 1].choices
            if (oldChoices) {
                list[list.length - 1].choiceMade = oldChoices.find((choice) => choice.label === step.currentLabel)
            }
        }
        if (dialoge || requiredChoices) {
            list.push({
                dialoge: dialoge as T,
                choiceMade: undefined,
                choices: requiredChoices,
                stepIndex: step.index
            })
        }
    })
    return list
}
