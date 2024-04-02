import { createExportableElement } from "../functions/ExportUtility"
import { ExportedStorage } from "../interface/export"
import { StorageElementType } from "../types/StorageElementType"

export default class GameStorageManager {
    private static oidsUsed: string[] = []
    private static storage: { [key: string]: StorageElementType } = {}
    private constructor() { }
    public static get keysSystem() {
        return {
            CURRENT_DIALOGUE_MEMORY_KEY: "___current_dialogue_memory_key___",
            LAST_DIALOGUE_ADDED_IN_STEP_MEMORY_KEY: "___last_dialogue_added_in_step_memory_key___",
            CURRENT_MENU_OPTIONS_MEMORY_KEY: "___current_menu_options_memory_key___",
            CHARACTER_PREKEY: "___character___",
        }
    }
    /**
     * Get a new oid that is not used yet
     * @returns A new oid that is not used yet
     */
    public static getNewOid(): string {
        let oid = ""
        do {
            oid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        } while (GameStorageManager.oidsUsed.includes(oid))
        GameStorageManager.oidsUsed.push(oid)
        return oid
    }
    /**
     * Set a variable in the storage
     * @param key The key of the variable
     * @param value The value of the variable. If undefined, the variable will be removed
     * @returns
     */
    public static setVariable(key: string, value: StorageElementType) {
        key = key.toLowerCase()
        if (value === undefined) {
            if (GameStorageManager.storage.hasOwnProperty(key)) {
                delete GameStorageManager.storage[key]
            }
            return
        }
        GameStorageManager.storage[key] = value
    }
    /**
     * Get a variable from the storage
     * @param key The key of the variable
     * @returns The value of the variable. If the variable does not exist, it will return undefined
     */
    public static getVariable<T extends StorageElementType>(key: string): T | undefined {
        key = key.toLowerCase()
        if (GameStorageManager.storage.hasOwnProperty(key)) {
            return GameStorageManager.storage[key] as T
        }
        return undefined
    }
    /**
     * Remove a variable from the storage
     * @param key The key of the variable
     * @returns
     */
    public static removeVariable(key: string) {
        key = key.toLowerCase()
        if (GameStorageManager.storage.hasOwnProperty(key)) {
            delete GameStorageManager.storage[key]
        }
    }
    /**
     * Clear the storage and the oidsUsed
     * @returns
     */
    public static clear() {
        GameStorageManager.oidsUsed = []
        GameStorageManager.storage = {}
    }
    public static exportJson(): string {
        return JSON.stringify(this.export())
    }
    public static export(): ExportedStorage {
        return {
            storage: createExportableElement(GameStorageManager.storage),
            stepOidUsedList: createExportableElement(GameStorageManager.oidsUsed),
        }
    }
    public static importJson(dataString: string) {
        GameStorageManager.import(JSON.parse(dataString))
    }
    public static import(data: object) {
        GameStorageManager.clear()
        try {
            if (data.hasOwnProperty("storage")) {
                GameStorageManager.storage = (data as ExportedStorage)["storage"]
            }
            else {
                console.warn("[Pixi'VN] No storage data found")
            }
            if (data.hasOwnProperty("stepOidUsedList")) {
                GameStorageManager.oidsUsed = (data as ExportedStorage)["stepOidUsedList"]
            }
            else {
                console.warn("[Pixi'VN] No stepOidUsed data found")
            }
        }
        catch (e) {
            console.error("[Pixi'VN] Error importing data", e)
        }
    }
}
