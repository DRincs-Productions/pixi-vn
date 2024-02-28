import { DialogueModelBase } from "../classes/DialogueModelBase";
import { GameStorageManager } from "../managers/StorageManager";

export function setDialogue(text: string): void {
    let dialogue = new DialogueModelBase(text)
    GameStorageManager.setVariable(GameStorageManager.keysSystem.CURRENT_DIALOGUE_MEMORY_KEY, dialogue)
}

export function getDialogue(): DialogueModelBase | undefined {
    let d = GameStorageManager.getVariable(GameStorageManager.keysSystem.CURRENT_DIALOGUE_MEMORY_KEY)
    if (d instanceof DialogueModelBase) {
        return d
    }
    console.error("No dialogue found")
    return undefined
}

export function clearDialogue(): void {
    GameStorageManager.setVariable(GameStorageManager.keysSystem.CURRENT_DIALOGUE_MEMORY_KEY, undefined)
}