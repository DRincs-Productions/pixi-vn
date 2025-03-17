import { SYSTEM_RESERVED_STORAGE_KEYS } from "../../constants";
import { StoredClassModel } from "../../storage";

const EMOTION_SEPARATOR = "@";
export default class CharacterStoredClass extends StoredClassModel {
    private sourceId: string;
    constructor(id: string, emotion: string = "") {
        super(SYSTEM_RESERVED_STORAGE_KEYS.CHARACTER_CATEGORY_KEY, id + (emotion ? EMOTION_SEPARATOR + emotion : ""));
        this.sourceId = id;
    }

    override getStorageProperty<T>(propertyName: string): T | undefined {
        let value = super.getStorageProperty<T>(propertyName);
        if (value === undefined) {
            value = super.getStorageProperty<T>(propertyName, this.sourceId);
        }
        return value;
    }
}
