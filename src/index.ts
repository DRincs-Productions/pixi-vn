export { Assets, Rectangle } from "pixi.js";
export type {
    ContainerOptions,
    SpriteOptions,
    TextOptions,
    Texture,
    TextureSourceLike,
    Ticker as TickerValue,
    UPDATE_PRIORITY,
} from "pixi.js";
export * from "./canvas";
export * from "./character";
export {
    CANVAS_APP_GAME_LAYER_ALIAS,
    filters,
    Pause,
    PIXIVN_VERSION,
    Repeat,
    SYSTEM_RESERVED_STORAGE_KEYS,
} from "./constants";
export * from "./interfaces";
export * from "./narration";
export * from "./sound";
export * from "./storage";
export * from "./types";
export { default as GameUnifier } from "./unifier";
export * from "./utils";

import { Devtools } from "@pixi/devtools";
import { ApplicationOptions, Assets, Rectangle } from "pixi.js";
import * as canvasUtils from "./canvas";
import * as characterUtils from "./character";
import {
    CANVAS_APP_GAME_LAYER_ALIAS,
    filters,
    Pause,
    PIXIVN_VERSION,
    Repeat,
    SYSTEM_RESERVED_STORAGE_KEYS,
} from "./constants";
import * as pixivninterface from "./interfaces";
import * as narrationUtils from "./narration";
import * as soundUtils from "./sound";
import * as storageUtils from "./storage";
import GameUnifier from "./unifier";
import * as functions from "./utils";
import { asciiArtLog } from "./utils/easter-egg";
import { getGamePath } from "./utils/path-utility";

export namespace Game {
    /**
     * Initialize the Game and PixiJS Application and the interface div.
     * This method should be called before any other method.
     * @param element The html element where I will put the canvas. Example: document.body
     * @param width The width of the canvas
     * @param height The height of the canvas
     * @param options The options of PixiJS Application
     * @param devtoolsOptions The options of the devtools. You can read more about it in the [PixiJS Devtools documentation](https://pixijs.io/devtools/docs/plugin/)
     * @example
     * ```typescript
     * const body = document.body
     * if (!body) {
     *     throw new Error('body element not found')
     * }
     * await Game.initialize(body, {
     *     width: 1920,
     *     height: 1080,
     *     backgroundColor: "#303030"
     * })
     * ```
     */
    export async function initialize(
        element: HTMLElement,
        options: Partial<ApplicationOptions> & { width: number; height: number },
        devtoolsOptions?: Devtools
    ) {
        // storage
        GameUnifier.exportStorageData = () => storageUtils.storage.export();
        GameUnifier.importStorageData = (data) => storageUtils.storage.import(data);
        GameUnifier.getVariable = (key) => storageUtils.storage.getVariable(key);
        GameUnifier.setVariable = (key, value) => storageUtils.storage.setVariable(key, value);
        GameUnifier.removeVariable = (key) => storageUtils.storage.removeVariable(key);
        GameUnifier.getFlag = (key) => storageUtils.storage.getFlag(key);
        GameUnifier.setFlag = (name, value) => storageUtils.storage.setFlag(name, value);
        GameUnifier.clearOldTempVariables = (openedLabelsNumber) =>
            storageUtils.StorageManagerStatic.clearOldTempVariables(openedLabelsNumber);
        // canvas
        GameUnifier.exportCanvasData = () => canvasUtils.canvas.export();
        GameUnifier.importCanvasData = (data) => canvasUtils.canvas.import(data);
        GameUnifier.forceCompletionOfTicker = () => {
            canvasUtils.CanvasManagerStatic._tickersToCompleteOnStepEnd.tikersIds.forEach(({ id }) => {
                canvasUtils.canvas.forceCompletionOfTicker(id);
            });
            canvasUtils.CanvasManagerStatic._tickersToCompleteOnStepEnd.stepAlias.forEach(({ alias, id }) => {
                canvasUtils.canvas.forceCompletionOfTicker(id, alias);
            });
            canvasUtils.CanvasManagerStatic._tickersToCompleteOnStepEnd = { tikersIds: [], stepAlias: [] };
        };
        // sound
        GameUnifier.exportSoundData = () => soundUtils.sound.export();
        GameUnifier.importSoundData = (data) => soundUtils.sound.import(data);
        // narration
        GameUnifier.getLastStepIndex = () => narrationUtils.narration.lastStepIndex;
        GameUnifier.getOpenedLabels = () => functions.createExportableElement(narrationUtils.narration.openedLabels);
        GameUnifier.getCurrentLabelStepIndex = () => narrationUtils.NarrationManagerStatic.currentLabelStepIndex || 0;
        GameUnifier.exportNarrationData = narrationUtils.narration.export;
        GameUnifier.importNarrationData = narrationUtils.narration.import;
        asciiArtLog();
        return await canvasUtils.canvas.initialize(element, options, devtoolsOptions);
    }

    /**
     * Clear all game data. This function is used to reset the game.
     */
    export function clear() {
        storageUtils.storage.clear();
        canvasUtils.canvas.clear();
        soundUtils.sound.clear();
        narrationUtils.narration.clear();
    }

    /**
     * Get all the game data. It can be used to save the game.
     * @returns The game data
     */
    export function exportGameState(): pixivninterface.GameState {
        return {
            pixivn_version: PIXIVN_VERSION,
            stepData: narrationUtils.narration.export(),
            storageData: storageUtils.storage.export(),
            canvasData: canvasUtils.canvas.export(),
            soundData: soundUtils.sound.export(),
            path: getGamePath(),
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
    export function exportGameJsonState() {
        const saveData = exportGameState();
        return JSON.stringify(saveData);
    }

    /**
     * Load the save data
     * @param data The save data
     * @param navigate The function to navigate to a path
     */
    export async function importGameState(data: pixivninterface.GameState, navigate: (path: string) => void) {
        await narrationUtils.narration.import(data.stepData);
        storageUtils.storage.import(data.storageData);
        await canvasUtils.canvas.import(data.canvasData);
        soundUtils.sound.import(data.soundData);
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
    export async function importGameJsonState(dataString: string, navigate: (path: string) => void) {
        await importGameState(jsonToGameState(dataString), navigate);
    }

    /**
     * Convert a JSON string to a save data
     * @param json The JSON string
     * @returns The save data
     */
    export function jsonToGameState(json: string): pixivninterface.GameState {
        return JSON.parse(json);
    }
}

export default {
    Assets,
    Rectangle,
    characterUtils,
    canvasUtils,
    narrationUtils,
    soundUtils,
    CANVAS_APP_GAME_LAYER_ALIAS,
    filters,
    Pause,
    Repeat,
    SYSTEM_RESERVED_STORAGE_KEYS,
    PIXIVN_VERSION,
    ...functions,
    ...pixivninterface,
    canvas: canvasUtils.canvas,
    narration: narrationUtils.narration,
    sound: soundUtils.sound,
    storage: storageUtils.storage,
    Game,
    GameUnifier,
};

/**
 * @deprecated Use the `Game.clearAllGameDatas` function instead
 */
export function clearAllGameDatas() {
    return Game.clear();
}

/**
 * @deprecated Use the `Game.getSaveData` function instead
 */
export function getSaveData() {
    return Game.exportGameState();
}

/**
 * @deprecated Use the `Game.getSaveJson` function instead
 */
export function getSaveJson() {
    return Game.exportGameJsonState();
}

/**
 * @deprecated Use the `Game.loadSaveData` function instead
 */
export async function loadSaveData(data: pixivninterface.GameState, navigate: (path: string) => void) {
    return Game.importGameState(data, navigate);
}

/**
 * @deprecated Use the `Game.loadSaveJson` function instead
 */
export async function loadSaveJson(dataString: string, navigate: (path: string) => void) {
    return Game.importGameJsonState(dataString, navigate);
}

/**
 * @deprecated Use the `Game.jsonToSaveData` function instead
 */
export function jsonToSaveData(json: string) {
    return Game.jsonToGameState(json);
}
