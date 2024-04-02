import { PIXIVM_VERSION } from "../constants";
import ISaveData from "../interface/ISaveData";
import { GameStepManager, GameStorageManager, GameWindowManager } from "../managers";

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
 * @example
 * ```typescript
 * export function saveGame() {
 *     const jsonString = getSaveJson()
 *     const blob = new Blob([jsonString], { type: "application/json" });
 *     const url = URL.createObjectURL(blob);
 *     const a = document.createElement('a');
 *     a.href = url;
 *     a.download = "save.json";
 *     a.click();
 * }
 * ```
 */
export function getSaveJson() {
    const saveData = getSaveData();
    return JSON.stringify(saveData);
}

/**
 * Load the save data
 * @param data The save data
 * @param navigate The function to navigate to a path
 */
export function loadSaveData(data: ISaveData, navigate: (path: string) => void) {
    GameStepManager.import(data.stepData);
    GameStorageManager.import(data.storageData);
    GameWindowManager.import(data.canvasData);
    navigate(data.path);
}

/**
 * Load the save data from a JSON string
 * @param dataString The save data as a JSON string
 * @param navigate The function to navigate to a path
 * @example
 * ```typescript
 * export function loadGameSave(navigate: (path: string) => void, afterLoad?: () => void) {
 *     // load the save data from a JSON file
 *     const input = document.createElement('input');
 *     input.type = 'file';
 *     input.accept = 'application/json';
 *     input.onchange = (e) => {
 *         const file = (e.target as HTMLInputElement).files?.[0];
 *         if (file) {
 *             const reader = new FileReader();
 *             reader.onload = (e) => {
 *                 const jsonString = e.target?.result as string;
 *                 // load the save data from the JSON string
 *                 loadSaveJson(jsonString, navigate);
 *                 afterLoad && afterLoad();
 *             };
 *             reader.readAsText(file);
 *         }
 *     };
 *     input.click();
 * }
 * ```
 */
export function loadSaveJson(dataString: string, navigate: (path: string) => void) {
    loadSaveData(JSON.parse(dataString), navigate);
}
