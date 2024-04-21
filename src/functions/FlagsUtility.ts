import { GameStorageManager } from "../managers"

export function setFlag(name: string, value: boolean) {
    GameStorageManager.setVariable(GameStorageManager.keysSystem.FLAGS_CATEGORY_KEY + name, value)
}

export function getFlag(name: string): boolean | undefined {
    return GameStorageManager.getVariable<boolean>(GameStorageManager.keysSystem.FLAGS_CATEGORY_KEY + name)
}

export function removeFlag(name: string) {
    GameStorageManager.removeVariable(GameStorageManager.keysSystem.FLAGS_CATEGORY_KEY + name)
}