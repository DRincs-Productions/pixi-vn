import { GameStorageManager } from "../managers"

/**
 * StoredClassModel is a abstract class that contains the methods to store a class in the game.
 * I suggest you extend this class to create your own stored class.
 * @example
 * ```typescript
 * export class CharacterModelBase extends StoredClassModel implements ICharacterModelBase {
 *     constructor(id: string, props: ICharacterModelBase) {
 *         super("___character___", id)
 *         this.defaultName = props.name
 *         this.defaultSurname = props.surname
 *     }
 *     private defaultName: string = ""
 *     get name(): string {
 *         return this.getStorageProperty<string>("name") || this.defaultName
 *     }
 *     set name(value: string) {
 *         this.updateStorageProperty<string>("name", value)
 *     }
 *     private defaultSurname?: string
 *     get surname(): string | undefined {
 *         return this.getStorageProperty<string>("surname") || this.defaultSurname
 *     }
 *     set surname(value: string | undefined) {
 *         this.updateStorageProperty<string>("surname", value)
 *     }
 * }
 * ```
 */
export default abstract class StoredClassModel {
    /**
     * @param categoryId The id of the category. For example if you are storing a character class, you can use "characters" as categoryId. so all instances of the character class will be stored in the "characters" category.
     * @param id The id of instance of the class. This id must be unique for the category.
     */
    constructor(categoryId: string, id: string) {
        this.categoryId = categoryId
        this._id = id
    }
    private _id: string
    /**
     * Is id of the stored class. is unique for this class.
     */
    get id(): string {
        return this._id
    }
    private categoryId: string
    /**
     * Update a property in the storage.
     * @param propertyName The name of the property to set.
     * @param value The value to set. If is undefined, the property will be removed from the storage.
     */
    updateStorageProperty<T>(propertyName: string, value: T | undefined): void {
        let storage = GameStorageManager.getVariable<{ [key: string]: any }>(this.categoryId + this.id)
        if (!storage) {
            storage = {}
        }
        if (value) {
            storage = { ...storage, [propertyName]: value }
        }
        else {
            if (storage.hasOwnProperty(propertyName)) {
                delete storage[propertyName]
            }
        }
        GameStorageManager.setVariable(this.categoryId + this.id, storage)
    }
    /**
     * Get a property from the storage.
     * @param propertyName The name of the property to get.
     * @returns The value of the property. If the property is not found, returns undefined.
     */
    getStorageProperty<T>(propertyName: string): T | undefined {
        let storage = GameStorageManager.getVariable<any>(this.categoryId + this.id)
        if (storage && storage.hasOwnProperty(propertyName)) {
            return storage[propertyName]
        }
        return undefined
    }
}
