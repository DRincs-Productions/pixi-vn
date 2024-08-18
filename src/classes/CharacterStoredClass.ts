import { storage } from "../managers"
import StoredClassModel from "./StoredClassModel"

export default class CharacterStoredClass extends StoredClassModel {
    constructor(id: string) {
        super(storage.keysSystem.CHARACTER_CATEGORY_KEY, id)
    }
}
