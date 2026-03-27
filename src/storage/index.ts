import StorageManagerInterface from "./interfaces/StorageManagerInterface";
import StorageManager from "./StorageManager";

export { default as StoredClassModel } from "./classes/StoredClassModel";
export type { default as StorageGameState } from "./interfaces/StorageGameState";
export type { default as StorageManagerInterface } from "./interfaces/StorageManagerInterface";
export { default as StorageManagerStatic } from "./StorageManagerStatic";
export type { StorageElementType, StorageObjectType } from "./types/StorageElementType";
export { storage };

const storage: StorageManagerInterface = new StorageManager();
