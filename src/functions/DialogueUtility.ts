import { CharacterBaseModel, DialogueBaseModel, Label } from "../classes";
import ChoiceMenuOption, { ChoiceMenuOptionClose, IStoratedChoiceMenuOption } from "../classes/ChoiceMenuOption";
import newCloseLabel from "../classes/CloseLabel";
import { DialogueData } from "../classes/DialogueBaseModel";
import { getLabelById } from "../decorators";
import { DialogueHistory } from "../interface";
import { GameStepManager, GameStorageManager } from "../managers";
import { Close, HistoryChoiceMenuOption } from "../types";
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
export function setDialogue<TCharacter extends CharacterBaseModel = CharacterBaseModel, TDialogue extends DialogueBaseModel = DialogueBaseModel>(props: {
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

    if (getFlag(GameStorageManager.keysSystem.ADD_NEXT_DIALOG_TEXT_INTO_THE_CURRENT_DIALOG_FLAG_KEY)) {
        let glueDialogue = getDialogue<TDialogue>()
        if (glueDialogue) {
            dialogue.text = `${glueDialogue.text}${dialogue.text}`
            dialogue = glueDialogue
        }
        setFlag(GameStorageManager.keysSystem.ADD_NEXT_DIALOG_TEXT_INTO_THE_CURRENT_DIALOG_FLAG_KEY, false)
    }

    GameStorageManager.setVariable(GameStorageManager.keysSystem.CURRENT_DIALOGUE_MEMORY_KEY, dialogue as DialogueData)
    GameStorageManager.setVariable(GameStorageManager.keysSystem.LAST_DIALOGUE_ADDED_IN_STEP_MEMORY_KEY, GameStepManager.lastStepIndex)
}

/**
 * Get the dialogue to be shown in the game
 * @returns Dialogue to be shown in the game
 */
export function getDialogue<T extends DialogueBaseModel = DialogueBaseModel>(): T | undefined {
    return GameStorageManager.getVariable<DialogueData>(GameStorageManager.keysSystem.CURRENT_DIALOGUE_MEMORY_KEY) as T
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
    GameStorageManager.setVariable(GameStorageManager.keysSystem.CURRENT_MENU_OPTIONS_MEMORY_KEY, value)
    GameStorageManager.setVariable(GameStorageManager.keysSystem.LAST_MENU_OPTIONS_ADDED_IN_STEP_MEMORY_KEY, GameStepManager.lastStepIndex)
}

/**
 * Get the options to be shown in the game
 * @returns Options to be shown in the game
 */
export function getChoiceMenuOptions<TChoice extends ChoiceMenuOptionsType = ChoiceMenuOptionsType<{ [key: string | number | symbol]: any }>>(): TChoice | undefined {
    let d = GameStorageManager.getVariable<IStoratedChoiceMenuOption[]>(GameStorageManager.keysSystem.CURRENT_MENU_OPTIONS_MEMORY_KEY)
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
    GameStorageManager.setVariable(GameStorageManager.keysSystem.CURRENT_MENU_OPTIONS_MEMORY_KEY, undefined)
}

/**
 * Get the history of the dialogues
 * @returns the history of the dialogues
 */
export function getDialogueHistory<T extends DialogueBaseModel = DialogueBaseModel>(): DialogueHistory<T>[] {
    let list: DialogueHistory<T>[] = []
    GameStepManager.stepsHistory.forEach((step) => {
        let dialoge = step.dialoge
        let requiredChoices = step.choices
        if (
            list.length > 0 &&
            list[list.length - 1].choices &&
            !list[list.length - 1].playerMadeChoice &&
            step.currentLabel
        ) {
            let oldChoices = list[list.length - 1].choices
            if (oldChoices) {
                let choiceMade = false
                if (step.choiceIndexMade !== undefined && oldChoices.length > step.choiceIndexMade) {
                    oldChoices[step.choiceIndexMade].isResponse = true
                    choiceMade = true
                }
                list[list.length - 1].playerMadeChoice = choiceMade
                list[list.length - 1].choices = oldChoices
            }
        }
        if (dialoge || requiredChoices) {
            let choices: HistoryChoiceMenuOption[] | undefined = requiredChoices?.map((choice) => {
                return {
                    text: choice.text,
                    type: choice.type,
                    isResponse: false
                }
            })
            list.push({
                dialoge: dialoge as T,
                playerMadeChoice: false,
                choices: choices,
                stepIndex: step.index
            })
        }
    })
    return list
}
