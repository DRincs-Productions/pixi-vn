import { PIXIVN_VERSION } from "../constants";
import ISaveData from "../interface/ISaveData";
import { canvas, narration, sound, storage } from "../managers";

/**
 * Get the save data
 * @returns The save data
 */
export function getSaveData(): ISaveData {
    return {
        pixivn_version: PIXIVN_VERSION,
        stepData: narration.export(),
        storageData: storage.export(),
        canvasData: canvas.export(),
        soundData: sound.export(),
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
export async function loadSaveData(data: ISaveData, navigate: (path: string) => void) {
    await narration.import(data.stepData);
    storage.import(data.storageData);
    canvas.import(data.canvasData);
    sound.import(data.soundData);
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
export async function loadSaveJson(dataString: string, navigate: (path: string) => void) {
    await loadSaveData(jsonToSaveData(dataString), navigate);
}

/**
 * Convert a JSON string to a save data
 * @param json The JSON string
 * @returns The save data
 */
export function jsonToSaveData(json: string): ISaveData {
    return JSON.parse(json);
}
