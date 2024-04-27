import { GameStorageManager } from "../managers"

/**
 * StoredClassModel is a abstract class that contains the methods to store a class in the game.
 * I suggest you extend this class to create your own stored class.
 * @example
 * ```typescript
 * export class CharacterBaseModel extends StoredClassModel implements ICharacterBaseModel {
 *     constructor(id: string, props: ICharacterBaseModel) {
 *         super("___character___", id)
 *         this.defaultName = props.name
 *         this.defaultSurname = props.surname
 *     }
 *     private defaultName: string = ""
 *     get name(): string {
 *         return this.getStorageProperty<string>("name") || this.defaultName
 *     }
 *     set name(value: string) {
 *         this.setStorageProperty<string>("name", value)
 *     }
 *     private defaultSurname?: string
 *     get surname(): string | undefined {
 *         return this.getStorageProperty<string>("surname") || this.defaultSurname
 *     }
 *     set surname(value: string | undefined) {
 *         this.setStorageProperty<string>("surname", value)
 *     }
 * }
 * ```
 */
export default class StoredClassModel {
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
    setStorageProperty<T>(propertyName: string, value: T | undefined): void {
        let storage = GameStorageManager.getVariable<any>(this.categoryId)
        if (!storage) {
            storage = {}
        }
        // if storage not have a key with the id
        if (!storage.hasOwnProperty(this.id)) {
            storage[this.id] = {}
        }

        if (value === undefined || value === null) {
            if (storage[this.id].hasOwnProperty(propertyName)) {
                delete storage[this.id][propertyName]
            }
        }
        else {
            storage[this.id] = { ...storage[this.id], [propertyName]: value }
        }

        if (Object.keys(storage[this.id]).length === 0) {
            delete storage[this.id]
        }

        GameStorageManager.setVariable(this.categoryId, storage)
    }
    /**
     * Get a property from the storage.
     * @param propertyName The name of the property to get.
     * @returns The value of the property. If the property is not found, returns undefined.
     */
    getStorageProperty<T>(propertyName: string): T | undefined {
        let storage = GameStorageManager.getVariable<any>(this.categoryId)
        if (storage && storage.hasOwnProperty(this.id) && storage[this.id].hasOwnProperty(propertyName)) {
            return storage[this.id][propertyName]
        }
        return undefined
    }
}
