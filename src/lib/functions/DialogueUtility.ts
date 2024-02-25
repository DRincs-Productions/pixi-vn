import { DialogueModel } from "../classes/DialogueModel";
import { GameStorageManager } from "../managers/StorageManager";

export function setDialogue(text: string): void {
    let dialogue = new DialogueModel(text)
    GameStorageManager.setVariable(GameStorageManager.keysSystem.CURRENT_DIALOGUE_MEMORY_KEY, dialogue)
}

export function getDialogue(): DialogueModel | undefined {
    let d = GameStorageManager.getVariable<DialogueModel>(GameStorageManager.keysSystem.CURRENT_DIALOGUE_MEMORY_KEY)
    if (d instanceof DialogueModel) {
        return d
    }
    console.error("No dialogue found")
    return undefined
}

export function clearDialogue(): void {
    GameStorageManager.setVariable(GameStorageManager.keysSystem.CURRENT_DIALOGUE_MEMORY_KEY, undefined)
}