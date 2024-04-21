import { GameStorageManager } from "../managers"

/**
 * Set a flag to true or false. 
 * @param name The name of the flag
 * @param value The value of the flag.
 */
export function setFlag(name: string, value: boolean) {
    let flags = GameStorageManager.getVariable<string[]>(GameStorageManager.keysSystem.FLAGS_CATEGORY_KEY) || []
    if (value) {
        if (!flags.includes(name)) {
            flags.push(name)
        }
    } else {
        let index = flags.indexOf(name)
        if (index > -1) {
            flags.splice(index, 1)
        }
    }
    GameStorageManager.setVariable(GameStorageManager.keysSystem.FLAGS_CATEGORY_KEY, flags)
}

/**
 * Get the value of a flag
 * @param name The name of the flag
 * @returns The value of the flag
 */
export function getFlag(name: string): boolean {
    let flags = GameStorageManager.getVariable<string[]>(GameStorageManager.keysSystem.FLAGS_CATEGORY_KEY) || []
    return flags.includes(name)
}
