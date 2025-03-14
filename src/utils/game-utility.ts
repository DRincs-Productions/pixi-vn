import { Game } from "..";
import SaveData from "../interface/SaveData";

/**
 * @deprecated Use the `Game.clearAllGameDatas` function instead
 */
export function clearAllGameDatas() {
    return Game.clearAllGameDatas();
}

/**
 * @deprecated Use the `Game.getSaveData` function instead
 */
export function getSaveData() {
    return Game.getSaveData();
}

/**
 * @deprecated Use the `Game.getSaveJson` function instead
 */
export function getSaveJson() {
    return Game.getSaveJson();
}

/**
 * @deprecated Use the `Game.loadSaveData` function instead
 */
export async function loadSaveData(data: SaveData, navigate: (path: string) => void) {
    return Game.loadSaveData(data, navigate);
}

/**
 * @deprecated Use the `Game.loadSaveJson` function instead
 */
export async function loadSaveJson(dataString: string, navigate: (path: string) => void) {
    return Game.loadSaveJson(dataString, navigate);
}

/**
 * @deprecated Use the `Game.jsonToSaveData` function instead
 */
export function jsonToSaveData(json: string) {
    return Game.jsonToSaveData(json);
}
