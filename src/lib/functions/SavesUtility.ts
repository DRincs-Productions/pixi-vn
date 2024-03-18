import { PIXIVM_VERSION } from "../constants";
import { ISaveData } from "../interface/ISaveData";
import { GameStepManager } from "../managers/StepManager";
import { GameStorageManager } from "../managers/StorageManager";
import { GameWindowManager } from "../managers/WindowManager";

/**
 * Get the save data
 * @returns The save data
 */
export function getSaveData(): ISaveData {
    return {
        version: PIXIVM_VERSION,
        stepData: GameStepManager.export(),
        storageData: GameStorageManager.export(),
        canvasData: GameWindowManager.export(),
    };
}

/**
 * Get the save data as a JSON string
 * @returns The save data as a JSON string
 */
export function loadSaveJson() {
    const saveData = getSaveData();
    return JSON.stringify(saveData);
}

/**
 * Load the save data
 * @param data The save data
 */
export function loadSave(data: ISaveData) {
    GameStepManager.import(data.stepData);
    GameStorageManager.import(data.storageData);
    GameWindowManager.import(data.canvasData);
}

/**
 * Load the save data from a JSON string
 * @param dataString The save data as a JSON string
 */
export function loadSaveJsonString(dataString: string) {
    loadSave(JSON.parse(dataString));
}
