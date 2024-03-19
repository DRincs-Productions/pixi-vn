import { PIXIVM_VERSION } from "../constants";
import ISaveData from "../interface/ISaveData";
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
        path: window.location.pathname,
    };
}

/**
 * Get the save data as a JSON string
 * @returns The save data as a JSON string
 */
export function getSaveJson() {
    const saveData = getSaveData();
    return JSON.stringify(saveData);
}

/**
 * Load the save data
 * @param data The save data
 */
export function loadSave(data: ISaveData, navigate: (path: string) => void) {
    GameStepManager.import(data.stepData);
    GameStorageManager.import(data.storageData);
    GameWindowManager.import(data.canvasData);
    navigate(data.path);
}

/**
 * Load the save data from a JSON string
 * @param dataString The save data as a JSON string
 */
export function loadSaveJsonString(dataString: string, navigate: (path: string) => void) {
    loadSave(JSON.parse(dataString), navigate);
}
