import { GameStorageManager } from "../managers/StorageManager"

/**
 * StoredClassModel is a abstract class that contains the methods to store a class in the game.
 * I suggest you extend this class to create your own stored class.
 * @example
 * ```typescript
 * export class CharacterModelBase extends StoredClassModel implements ICharacterModelBase {
 *     constructor(tag: string, props: ICharacterModelBase) {
 *         super(tag)
 *         this.defaultName = props.name
 *         this.defaultSurname = props.surname
 *     }
 *     private defaultName: string = ""
 *     get name(): string {
 *         return this.getStorageProperty<string>("name") || this.defaultName
 *     }
 *     set name(value: string) {
 *         this.updateStorage({ ...this, name: value })
 *     }
 *     private defaultSurname?: string
 *     get surname(): string | undefined {
 *         return this.getStorageProperty<string>("surname") || this.defaultSurname
 *     }
 *     set surname(value: string | undefined) {
 *         this.updateStorage({ ...this, surname: value })
 *     }
 * }
 * ```
 */
export abstract class StoredClassModel {
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
