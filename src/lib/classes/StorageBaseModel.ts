import { GameStorageManager } from "../managers/StorageManager"

export abstract class StorageBaseModel {
    id: string
    constructor(id: string) {
        this.id = id
    }
    private get nameClass(): string {
        return this.constructor.name + "Storage"
    }
    updateStorage(value: typeof this): void {
        let storage = GameStorageManager.getVariable<{ [key: string]: any }>(this.nameClass)
        if (!storage) {
            storage = {}
        }
        storage[this.id] = value
        GameStorageManager.setVariable(this.nameClass, storage)
    }
    getStorageProperty<T>(key: string): T | undefined {
        let storage = GameStorageManager.getVariable<{ [key: string]: any }>(this.nameClass)
        if (!storage) {
            return undefined
        }
        if (storage[this.id].hasOwnProperty(key)) {
            return storage[this.id][key]
        }
        return undefined
    }
}
