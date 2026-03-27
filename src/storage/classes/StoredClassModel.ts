import { MAIN_STORAGE_KEY } from "../../constants";
import StorageManagerStatic from "../StorageManagerStatic";
import { StorageElementType } from "../types/StorageElementType";

/**
 * StoredClassModel is a abstract class that contains the methods to store a class in the game.
 * I suggest you extend this class to create your own stored class.
 * @example
 * ```typescript
 * export class CharacterBaseModel extends StoredClassModel implements CharacterBaseModelProps {
 *     constructor(id: string, props: CharacterBaseModelProps) {
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
        this.categoryId = categoryId;
        this.id = id;
        this.migrateOldStorage();
    }
    protected migrateOldStorage(oldCategoryId: string = this.categoryId) {
        const oldStorage = StorageManagerStatic.getVariable<any>(MAIN_STORAGE_KEY, oldCategoryId);
        if (oldStorage) {
            Object.entries(oldStorage).forEach(([id, value]) => {
                if (typeof value === "object" && value !== null) {
                    Object.entries(value).forEach(([propertyName, propertyValue]) => {
                        StorageManagerStatic.setVariable(this.categoryId, `${id}:${propertyName}`, propertyValue);
                    });
                }
            });
            StorageManagerStatic.removeVariable(MAIN_STORAGE_KEY, oldCategoryId);
        }
    }
    /**
     * Is id of the stored class. is unique for this class.
     */
    readonly id: string;
    private categoryId: string;
    /**
     * Update a property in the storage.
     * @param propertyName The name of the property to set.
     * @param value The value to set. If is undefined, the property will be removed from the storage.
     */
    protected setStorageProperty<T extends StorageElementType>(propertyName: string, value: T | undefined): void {
        StorageManagerStatic.setVariable(this.categoryId, `${this.id}:${propertyName}`, value);
    }
    /**
     * Get a property from the storage.
     * @param propertyName The name of the property to get.
     * @param idToUse The id of the instance to get the property. @default this.id
     * @returns The value of the property. If the property is not found, returns undefined.
     */
    protected getStorageProperty<T extends StorageElementType>(
        propertyName: string,
        idToUse: string = this.id,
    ): T | undefined {
        return StorageManagerStatic.getVariable<T>(this.categoryId, `${idToUse}:${propertyName}`);
    }
}
