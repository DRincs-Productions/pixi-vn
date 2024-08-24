import { createExportableElement } from "../functions/ExportUtility"
import { ExportedStorage } from "../interface"
import { StorageElementType } from "../types/StorageElementType"
import StorageManagerStatic from "./StorageManagerStatic"

export default class StorageManager {
    get keysSystem() {
        return StorageManagerStatic._keysSystem
    }
    /**
     * Set a variable in the storage
     * @param key The key of the variable
     * @param value The value of the variable. If undefined, the variable will be removed
     * @returns
     */
    public setVariable(key: string, value: StorageElementType) {
        key = key.toLowerCase()
        if (value === undefined || value === null) {
            if (StorageManagerStatic.storage.hasOwnProperty(key)) {
                delete StorageManagerStatic.storage[key]
            }
            return
        }
        StorageManagerStatic.storage[key] = value
    }
    /**
     * Get a variable from the storage
     * @param key The key of the variable
     * @returns The value of the variable. If the variable does not exist, it will return undefined
     */
    public getVariable<T extends StorageElementType>(key: string): T | undefined {
        key = key.toLowerCase()
        if (StorageManagerStatic.storage.hasOwnProperty(key)) {
            return StorageManagerStatic.storage[key] as T
        }
        return undefined
    }
    /**
     * Remove a variable from the storage
     * @param key The key of the variable
     * @returns
     */
    public removeVariable(key: string) {
        key = key.toLowerCase()
        if (StorageManagerStatic.storage.hasOwnProperty(key)) {
            delete StorageManagerStatic.storage[key]
        }
    }
    /**
     * Clear the storage and the oidsUsed
     * @returns
     */
    public clear() {
        StorageManagerStatic.storage = {}
    }
    public exportJson(): string {
        return JSON.stringify(this.export())
    }
    public export(): ExportedStorage {
        return createExportableElement(StorageManagerStatic.storage)
    }
    public importJson(dataString: string) {
        this.import(JSON.parse(dataString))
    }
    public import(data: object) {
        this.clear()
        try {
            if (data) {
                StorageManagerStatic.storage = (data as ExportedStorage)
            }
            else {
                console.warn("[Pixi'VN] No storage data found")
            }
        }
        catch (e) {
            console.error("[Pixi'VN] Error importing data", e)
        }
    }
}
