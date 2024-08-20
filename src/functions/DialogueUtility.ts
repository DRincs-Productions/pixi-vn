import { DialogueBaseModel, Label } from "../classes";
import ChoiceMenuOption, { ChoiceMenuOptionClose, IStoratedChoiceMenuOption } from "../classes/ChoiceMenuOption";
import newCloseLabel from "../classes/CloseLabel";
import { getLabelById } from "../decorators";
import { CharacterInterface } from "../interface";
import { narration, storage } from "../managers";
import { Close } from "../types";
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
    options = options.filter((option, index) => {
        if (option.oneTime) {
            let alreadyChoices = narration.alreadyCurrentStepMadeChoices
            if (alreadyChoices && alreadyChoices.includes(index)) {
                return false
            }
        }
        return true
    })
    let value: IStoratedChoiceMenuOption[] = options.map((option) => {
        if (option instanceof ChoiceMenuOptionClose) {
            return {
                text: option.text,
                type: Close,
                closeCurrentLabel: option.closeCurrentLabel,
                oneTime: option.oneTime,
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
                let choice = new ChoiceMenuOptionClose(option.text, {
                    closeCurrentLabel: option.closeCurrentLabel,
                    oneTime: option.oneTime
                })
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
                options.push(new ChoiceMenuOption(option.text, itemLabel, option.props, {
                    type: option.type,
                    oneTime: option.oneTime
                }))
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
