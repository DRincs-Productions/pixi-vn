import { DialogueModelBase } from "../classes/DialogueModelBase";
import { getLabelTypeByClassName } from "../decorators/LabelDecorator";
import { RunModeLabelEnum } from "../enums/LabelEventEnum";
import { GameStorageManager } from "../managers/StorageManager";
import { MunuOptionsType } from "../types/MunuOptionsType";

/**
 * Set the dialogue to be shown in the game
 * @param text Text of the dialogue
 */
export function setDialogue(text: string): void {
    let dialogue = new DialogueModelBase(text)
    GameStorageManager.setVariable(GameStorageManager.keysSystem.CURRENT_DIALOGUE_MEMORY_KEY, dialogue)
}

/**
 * Get the dialogue to be shown in the game
 * @returns Dialogue to be shown in the game
 */
export function getDialogue(): DialogueModelBase | undefined {
    let d = GameStorageManager.getVariable(GameStorageManager.keysSystem.CURRENT_DIALOGUE_MEMORY_KEY)
    if (d instanceof DialogueModelBase) {
        return d
    }
    return undefined
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
 */
export function setMenuOptions(options: MunuOptionsType): void {
    let value: {
        text: string
        label: string
        type: RunModeLabelEnum
    }[] = options.map((option) => {
        return {
            ...option,
            label: option.label.name
        }
    })
    GameStorageManager.setVariable(GameStorageManager.keysSystem.CURRENT_MENU_OPTIONS_MEMORY_KEY, value)
}

/**
 * Get the options to be shown in the game
 * @returns Options to be shown in the game
 */
export function getMenuOptions(): MunuOptionsType | undefined {
    let d = GameStorageManager.getVariable<{
        text: string
        label: string
        type: RunModeLabelEnum
    }[]>(GameStorageManager.keysSystem.CURRENT_MENU_OPTIONS_MEMORY_KEY)
    if (d) {
        let options: MunuOptionsType = []
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
export function clearMenuOptions(): void {
    GameStorageManager.setVariable(GameStorageManager.keysSystem.CURRENT_MENU_OPTIONS_MEMORY_KEY, undefined)
}
