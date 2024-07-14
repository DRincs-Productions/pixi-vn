import { CharacterBaseModel, DialogueBaseModel, Label } from "../classes";
import { ChoiceMenuOptionClose, IStoratedChoiceMenuOption } from "../classes/ChoiceMenuOption";
import newCloseLabel from "../classes/CloseLabel";
import { DialogueData } from "../classes/DialogueBaseModel";
import { getLabelById } from "../decorators";
import { DialogueHistory } from "../interface";
import { GameStepManager, GameStorageManager } from "../managers";
import { Close, HistoryChoiceMenuOption } from "../types";
import { ChoiceMenuOptionsType } from "../types/ChoiceMenuOptionsType";

/**
 * Set the dialogue to be shown in the game
 * @param text Text of the dialogue
 * @example
 * ```typescript
 * setDialogue("Hello World")
 * setDialogue({
 *       character: "characterId",
 *       text: "Hello World"
 * })
 * setDialogue(new DialogueBaseModel("Hello World", character))
 * ```
 */
export function setDialogue<TCharacter extends CharacterBaseModel = CharacterBaseModel, TDialogue extends DialogueBaseModel = DialogueBaseModel>(props: {
    character: string | TCharacter,
    text: string,
} | string | TDialogue): void {
    let text = ''
    let characterId: string | undefined = undefined
    let dialogue: TDialogue | DialogueBaseModel
    if (typeof props === 'string') {
        text = props
        dialogue = new DialogueBaseModel(text, characterId)
    }
    else if (!(props instanceof DialogueBaseModel)) {
        text = props.text
        if (props.character) {
            if (typeof props.character === 'string') {
                characterId = props.character
            }
            else {
                characterId = props.character.id
            }
        }
        dialogue = new DialogueBaseModel(text, characterId)
    }
    else {
        dialogue = props
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
 *     new ChoiceMenuOption("Events Test", EventsTestLabel),
 *     new ChoiceMenuOption("Show Image Test", ShowImageTest, "call", { image: "imageId" }),
 *     new ChoiceMenuOption("Ticker Test", TickerTestLabel),
 *     new ChoiceMenuOption("Tinting Test", TintingTestLabel, "jump"),
 *     new ChoiceMenuOption("Base Canvas Element Test Label", BaseCanvasElementTestLabel)
 * ])
 * ```
 */
export function setChoiceMenuOptions<T extends {} = {}>(options: ChoiceMenuOptionsType<T>): void {
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
                options.push({
                    text: option.text,
                    label: itemLabel,
                    type: Close,
                    closeCurrentLabel: option.closeCurrentLabel,
                    props: {},
                })
                return
            }
            let label = getLabelById(option.label)
            if (label) {
                let itemLabel = new Label(label.id, label.steps, label.onStepRun, index)
                options.push({
                    ...option,
                    label: itemLabel
                })
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
