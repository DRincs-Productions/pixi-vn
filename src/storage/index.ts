import type StorageManagerInterface from "@storage/interfaces/StorageManagerInterface";
import StorageManager from "@storage/StorageManager";

export { default as StoredClassModel } from "@storage/classes/StoredClassModel";
export type { default as StorageExternalStoreHandler } from "@storage/interfaces/StorageExternalStoreHandler";
export type { default as StorageGameState } from "@storage/interfaces/StorageGameState";
export type { default as StorageManagerInterface } from "@storage/interfaces/StorageManagerInterface";
export { default as StorageRegistry } from "@storage/StorageRegistry";
export type { StorageElementType, StorageObjectType } from "@storage/types/StorageElementType";
export { storage };

const storage: StorageManagerInterface = new StorageManager();
