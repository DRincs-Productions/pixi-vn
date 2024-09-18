import { storage } from "../managers"
import StoredClassModel from "./StoredClassModel"

const EMOTION_SEPARATOR = "@"
export default class CharacterStoredClass extends StoredClassModel {
    private sourceId: string
    constructor(id: string, emotion: string = "") {
        super(storage.keysSystem.CHARACTER_CATEGORY_KEY, id + (emotion ? EMOTION_SEPARATOR + emotion : ""))
        this.sourceId = id
    }

    override getStorageProperty<T>(propertyName: string): T | undefined {
        let value = super.getStorageProperty<T>(propertyName)
        if (value === undefined) {
            value = super.getStorageProperty<T>(propertyName, this.sourceId)
        }
        return value
    }
}
