import { DialogueModelBase } from "../classes/DialogueModelBase";
import { GameStorageManager } from "../managers/StorageManager";

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
