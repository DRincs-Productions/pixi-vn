import { StorageManagerInterface } from "..";
import StorageManager from "./StorageManager";

export { default as StoredClassModel } from "./classes/StoredClassModel";
export { default as StorageManagerStatic } from "./StorageManagerStatic";
export { storage };

const storage: StorageManagerInterface = new StorageManager();
