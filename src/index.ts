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
export { default as GameUnifier } from "./unifier";
export * from "./utils";

import { GameStepState } from "@drincs/pixi-vn";
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
import { logger } from "./utils/log-utility";
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
        GameUnifier.initialize({
            getCurrentGameStepState: () => {
                return {
                    path: getGamePath(),
                    storage: storageUtils.storage.export(),
                    canvas: canvasUtils.canvas.export(),
                    sound: soundUtils.sound.export(),
                    labelIndex: narrationUtils.NarrationManagerStatic.currentLabelStepIndex || 0,
                    openedLabels: narrationUtils.narration.openedLabels,
                };
            },
            ignoreAddChangeHistory: (originalState: GameStepState, newState: GameStepState) => {
                if (originalState.openedLabels.length === newState.openedLabels.length) {
                    try {
                        let lastStepDataOpenedLabelsString = JSON.stringify(originalState.openedLabels);
                        let historyStepOpenedLabelsString = JSON.stringify(newState.openedLabels);
                        if (
                            lastStepDataOpenedLabelsString === historyStepOpenedLabelsString &&
                            originalState.path === newState.path &&
                            originalState.labelIndex === newState.labelIndex
                        ) {
                            return true;
                        }
                    } catch (e) {
                        logger.error("Error comparing opened labels", e);
                        return true;
                    }
                }
                return false;
            },
            restoreGameStepState: async (state, navigate) => {
                narrationUtils.NarrationManagerStatic._originalStepData = state;
                narrationUtils.NarrationManagerStatic._openedLabels = state.openedLabels;
                storageUtils.storage.restore(state.storage);
                await canvasUtils.canvas.restore(state.canvas);
                soundUtils.sound.restore(state.sound);
                navigate(state.path);
            },
            // narration
            getStepCounter: () => narrationUtils.narration.stepCounter,
            getOpenedLabels: () => narrationUtils.narration.openedLabels.length,
            restoreOriginalOpenedLabels: (originalStepData) => {
                narrationUtils.NarrationManagerStatic._openedLabels = originalStepData.openedLabels;
            },
            // canvas
            onGoNextEnd: async () => {
                canvasUtils.CanvasManagerStatic._tickersToCompleteOnStepEnd.tikersIds.forEach(({ id }) => {
                    canvasUtils.canvas.forceCompletionOfTicker(id);
                });
                canvasUtils.CanvasManagerStatic._tickersToCompleteOnStepEnd.stepAlias.forEach(({ alias, id }) => {
                    canvasUtils.canvas.forceCompletionOfTicker(id, alias);
                });
                canvasUtils.CanvasManagerStatic._tickersToCompleteOnStepEnd = { tikersIds: [], stepAlias: [] };
            },
            // storage
            getVariable: (key) => storageUtils.storage.getVariable(key),
            setVariable: (key, value) => storageUtils.storage.setVariable(key, value),
            removeVariable: (key) => storageUtils.storage.removeVariable(key),
            getFlag: (key) => storageUtils.storage.getFlag(key),
            setFlag: (name, value) => storageUtils.storage.setFlag(name, value),
            onLabelClosing: (openedLabelsNumber) =>
                storageUtils.StorageManagerStatic.clearOldTempVariables(openedLabelsNumber),
        });
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
     * Load the save data
     * @param data The save data
     * @param navigate The function to navigate to a path
     */
    export async function restoreGameState(data: pixivninterface.GameState, navigate: (path: string) => void) {
        await narrationUtils.narration.restore(data.stepData);
        storageUtils.storage.restore(data.storageData);
        await canvasUtils.canvas.restore(data.canvasData);
        soundUtils.sound.restore(data.soundData);
        navigate(data.path);
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
 * @deprecated Use the `Game.exportGameState()` function instead
 */
export function getSaveData() {
    return Game.exportGameState();
}

/**
 * @deprecated Use the `JSON.stringify(Game.exportGameState())` function instead
 */
export function getSaveJson() {
    return JSON.stringify(Game.exportGameState());
}

/**
 * @deprecated Use the `Game.restoreGameState(data, navigate)` function instead
 */
export async function loadSaveData(data: pixivninterface.GameState, navigate: (path: string) => void) {
    return Game.restoreGameState(data, navigate);
}

/**
 * @deprecated Use the `Game.restoreGameState(JSON.parse(dataString) as GameState, navigate)` function instead
 */
export async function loadSaveJson(dataString: string, navigate: (path: string) => void) {
    return Game.restoreGameState(JSON.parse(dataString) as pixivninterface.GameState, navigate);
}

/**
 * @deprecated Use the `Game.jsonToGameState(json)` function instead
 */
export function jsonToSaveData(json: string) {
    return Game.jsonToGameState(json);
}
