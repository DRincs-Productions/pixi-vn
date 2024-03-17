import { CharacterModelBase } from "../classes/CharacterModelBase";
import { DialogueModelBase } from "../classes/DialogueModelBase";
import { getLabelTypeByClassName } from "../decorators/LabelDecorator";
import { RunModeLabelEnum } from "../enums/RunModeLabelEnum";
import { GameStepManager } from "../managers/StepManager";
import { GameStorageManager } from "../managers/StorageManager";
import { MunuOptionsType } from "../types/MunuOptionsType";

/**
 * Set the dialogue to be shown in the game
 * @param text Text of the dialogue
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

export function getDialogueHistory() {
    let a: (DialogueModelBase | undefined)[] = GameStepManager.stepsHistory.map((step) => {
        return step.storage.storage[GameStorageManager.keysSystem.CURRENT_DIALOGUE_MEMORY_KEY] as DialogueModelBase | undefined
    })
    return a.filter((d) => d !== undefined)
}