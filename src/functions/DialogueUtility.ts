import { DialogueBaseModel, Label } from "../classes";
import ChoiceMenuOption, { ChoiceMenuOptionClose, IStoratedChoiceMenuOption } from "../classes/ChoiceMenuOption";
import newCloseLabel from "../classes/CloseLabel";
import { DialogueData } from "../classes/DialogueBaseModel";
import { getLabelById } from "../decorators";
import { CharacterInterface } from "../interface";
import { narration, storage } from "../managers";
import { Close } from "../types";
import { ChoiceMenuOptionsType } from "../types/ChoiceMenuOptionsType";
import { getFlag, setFlag } from "./FlagsUtility";

/**
 * Set the dialogue to be shown in the game
 * @param text Text of the dialogue
 * @example
 * ```typescript
 * setDialogue("Hello World")
 * setDialogue({
 *       character: "character",
 *       text: "Hello World"
 * })
 * setDialogue(new DialogueBaseModel("Hello World", character))
 * ```
 */
export function setDialogue<TCharacter extends CharacterInterface = CharacterInterface, TDialogue extends DialogueBaseModel = DialogueBaseModel>(props: {
    character: string | TCharacter,
    text: string | string[],
} | string | string[] | TDialogue): void {
    let text = ''
    let character: string | undefined = undefined
    let dialogue: TDialogue | DialogueBaseModel
    if (typeof props === 'string') {
        text = props
        dialogue = new DialogueBaseModel(text, character)
    }
    else if (Array.isArray(props)) {
        text = props.join()
        dialogue = new DialogueBaseModel(text, character)
    }
    else if (!(props instanceof DialogueBaseModel)) {
        if (Array.isArray(props.text)) {
            text = props.text.join()
        }
        else {
            text = props.text
        }
        if (props.character) {
            if (typeof props.character === 'string') {
                character = props.character
            }
            else {
                character = props.character.id
            }
        }
        dialogue = new DialogueBaseModel(text, character)
    }
    else {
        dialogue = props
    }

    if (getFlag(storage.keysSystem.ADD_NEXT_DIALOG_TEXT_INTO_THE_CURRENT_DIALOG_FLAG_KEY)) {
        let glueDialogue = getDialogue<TDialogue>()
        if (glueDialogue) {
            dialogue.text = `${glueDialogue.text}${dialogue.text}`
        }
        setFlag(storage.keysSystem.ADD_NEXT_DIALOG_TEXT_INTO_THE_CURRENT_DIALOG_FLAG_KEY, false)
    }

    storage.setVariable(storage.keysSystem.CURRENT_DIALOGUE_MEMORY_KEY, dialogue as DialogueData)
    storage.setVariable(storage.keysSystem.LAST_DIALOGUE_ADDED_IN_STEP_MEMORY_KEY, narration.lastStepIndex)
}

/**
 * Get the dialogue to be shown in the game
 * @returns Dialogue to be shown in the game
 */
export function getDialogue<T extends DialogueBaseModel = DialogueBaseModel>(): T | undefined {
    return storage.getVariable<DialogueData>(storage.keysSystem.CURRENT_DIALOGUE_MEMORY_KEY) as T
}

/**
 * Clear the dialogue to be shown in the game
 */
export function clearDialogue(): void {
    storage.setVariable(storage.keysSystem.CURRENT_DIALOGUE_MEMORY_KEY, undefined)
}

/**
 * Set the options to be shown in the game
 * @param options Options to be shown in the game
 * @example
 * ```typescript
 * setChoiceMenuOptions([
 *     new ChoiceMenuOption("Events Test", EventsTestLabel, {}),
 *     new ChoiceMenuOption("Show Image Test", ShowImageTest, { image: "imageId" }, "call"),
 *     new ChoiceMenuOption("Ticker Test", TickerTestLabel, {}),
 *     new ChoiceMenuOption("Tinting Test", TintingTestLabel, {}, "jump"),
 *     new ChoiceMenuOption("Base Canvas Element Test", BaseCanvasElementTestLabel, {})
 * ])
 * ```
 */
export function setChoiceMenuOptions(options: ChoiceMenuOptionsType<any>): void {
    let value: IStoratedChoiceMenuOption[] = options.map((option) => {
        if (option instanceof ChoiceMenuOptionClose) {
            return {
                text: option.text,
                type: Close,
                closeCurrentLabel: option.closeCurrentLabel,
            }
        }
        return {
            ...option,
            label: option.label.id,
        }
    })
    storage.setVariable(storage.keysSystem.CURRENT_MENU_OPTIONS_MEMORY_KEY, value)
    storage.setVariable(storage.keysSystem.LAST_MENU_OPTIONS_ADDED_IN_STEP_MEMORY_KEY, narration.lastStepIndex)
}

/**
 * Get the options to be shown in the game
 * @returns Options to be shown in the game
 */
export function getChoiceMenuOptions<TChoice extends ChoiceMenuOptionsType = ChoiceMenuOptionsType<{ [key: string | number | symbol]: any }>>(): TChoice | undefined {
    let d = storage.getVariable<IStoratedChoiceMenuOption[]>(storage.keysSystem.CURRENT_MENU_OPTIONS_MEMORY_KEY)
    if (d) {
        let options: ChoiceMenuOptionsType = []
        d.forEach((option, index) => {
            if (option.type === Close) {
                let itemLabel = newCloseLabel(index)
                let choice = new ChoiceMenuOptionClose(option.text, option.closeCurrentLabel)
                choice.label = itemLabel
                options.push(choice)
                return
            }
            let label = getLabelById(option.label)
            if (label) {
                let itemLabel = new Label(label.id, label.steps, {
                    onStepStart: label.onStepStart,
                    choiseIndex: index
                })
                options.push(new ChoiceMenuOption(option.text, itemLabel, option.props, option.type))
            }
        })
        return options as TChoice
    }
    return undefined
}

/**
 * Clear the options to be shown in the game
 */
export function clearChoiceMenuOptions(): void {
    storage.setVariable(storage.keysSystem.CURRENT_MENU_OPTIONS_MEMORY_KEY, undefined)
}
