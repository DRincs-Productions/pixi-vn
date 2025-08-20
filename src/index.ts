export * from "@drincs/pixi-vn/canvas";
export * from "@drincs/pixi-vn/history";
export * from "@drincs/pixi-vn/narration";
export { Assets, Rectangle, Texture, UPDATE_PRIORITY } from "@drincs/pixi-vn/pixi.js";
export type { ContainerOptions, TextureSourceLike, Ticker as TickerValue } from "@drincs/pixi-vn/pixi.js";
export * from "@drincs/pixi-vn/sound";
export * from "@drincs/pixi-vn/storage";
export * from "@drincs/pixi-vn/unifier";
export type {
    AssetsBundle,
    AssetsManifest,
    AssetSrc,
    LoadParserName,
    ResolvedAsset,
    ResolvedSrc,
    UnresolvedAsset,
} from "pixi.js/lib/assets/types";
export * from "./character";
export * from "./classes";
export { CANVAS_APP_GAME_LAYER_ALIAS, Pause, PIXIVN_VERSION, Repeat } from "./constants";
export * from "./interfaces";
export * from "./utils";

import * as canvasUtils from "@drincs/pixi-vn/canvas";
import * as historyUtils from "@drincs/pixi-vn/history";
import * as narrationUtils from "@drincs/pixi-vn/narration";
import { ApplicationOptions, Assets, Rectangle } from "@drincs/pixi-vn/pixi.js";
import * as soundUtils from "@drincs/pixi-vn/sound";
import * as storageUtils from "@drincs/pixi-vn/storage";
import { GameUnifier } from "@drincs/pixi-vn/unifier";
import type { Devtools } from "@pixi/devtools";
import * as characterUtils from "./character";
import { registeredCharacters } from "./character/decorators/character-decorator";
import { CANVAS_APP_GAME_LAYER_ALIAS, Pause, PIXIVN_VERSION, Repeat } from "./constants";
import * as pixivninterface from "./interfaces";
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
    export async function init(
        element: HTMLElement,
        options: Partial<ApplicationOptions> & { width: number; height: number },
        devtoolsOptions?: Devtools
    ) {
        GameUnifier.init({
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
            restoreGameStepState: async (state, navigate) => {
                historyUtils.HistoryManagerStatic._originalStepData = state;
                narrationUtils.NarrationManagerStatic.openedLabels = state.openedLabels;
                storageUtils.storage.restore(state.storage);
                await canvasUtils.canvas.restore(state.canvas);
                soundUtils.sound.restore(state.sound);
                navigate(state.path);
            },
            // narration
            getStepCounter: () => narrationUtils.narration.stepCounter,
            setStepCounter: (value) => {
                narrationUtils.NarrationManagerStatic._stepCounter = value;
            },
            getOpenedLabels: () => narrationUtils.narration.openedLabels.length,
            addHistoryItem: (historyInfo, options) => {
                return historyUtils.stepHistory.add(historyInfo, options);
            },
            getCurrentStepsRunningNumber: () => narrationUtils.NarrationManagerStatic.stepsRunning,
            getCharacter: (id: string) => {
                return registeredCharacters.get(id);
            },
            // canvas
            onGoNextEnd: async () => {
                const promises = canvasUtils.CanvasManagerStatic._tickersToCompleteOnStepEnd.tikersIds.map(({ id }) =>
                    canvasUtils.canvas.forceCompletionOfTicker(id)
                );
                const promises2 = canvasUtils.CanvasManagerStatic._tickersToCompleteOnStepEnd.stepAlias.map(
                    ({ alias, id }) => canvasUtils.canvas.forceCompletionOfTicker(id, alias)
                );
                await Promise.all([...promises, ...promises2]);
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
        return await canvasUtils.canvas.init(element, options, devtoolsOptions);
    }

    /**
     * Clear all game data. This function is used to reset the game.
     */
    export function clear() {
        storageUtils.storage.clear();
        canvasUtils.canvas.clear();
        soundUtils.sound.clear();
        narrationUtils.narration.clear();
        historyUtils.stepHistory.clear();
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
            historyData: historyUtils.stepHistory.export(),
            path: getGamePath(),
        };
    }

    /**
     * Load the save data
     * @param data The save data
     * @param navigate The function to navigate to a path
     */
    export async function restoreGameState(
        data: pixivninterface.GameState,
        navigate: (path: string) => void | Promise<void>
    ) {
        if (data.stepData.hasOwnProperty("stepsHistory") && data.stepData.stepsHistory) {
            data.historyData.stepsHistory = data.stepData.stepsHistory;
        }
        if (data.stepData.hasOwnProperty("originalStepData") && data.stepData.originalStepData) {
            data.historyData.originalStepData = data.stepData.originalStepData;
        }
        historyUtils.stepHistory.restore(data.historyData);
        const lastHistoryKey = historyUtils.stepHistory.lastKey;
        if (typeof lastHistoryKey === "number") {
            const historyItem = historyUtils.stepHistory.stepsInfoMap.get(lastHistoryKey) || null;
            await narrationUtils.narration.restore(data.stepData, historyItem);
        }
        storageUtils.storage.restore(data.storageData);
        await canvasUtils.canvas.restore(data.canvasData);
        soundUtils.sound.restore(data.soundData);
        await navigate(data.path);
    }

    /**
     * Convert a JSON string to a save data
     * @param json The JSON string
     * @returns The save data
     */
    export function jsonToGameState(json: string): pixivninterface.GameState {
        return JSON.parse(json);
    }

    /**
     * Function to be executed at the end of the game. It should be set in the game initialization.
     * @example
     * ```typescript
     * Game.onEnd(async (props) => {
     *    props.navigate("/end")
     * })
     * ```
     */
    export function onEnd(value: narrationUtils.StepLabelType) {
        GameUnifier.onEnd = value;
    }
    /**
     * Function to be executed when an error occurs in the step.
     * @example
     * ```typescript
     * Game.onError((type, error, props) => {
     *    props.notify("An error occurred")
     *    // send a notification to GlitchTip, Sentry, etc...
     * })
     * ```
     */
    export function onError(value: (type: "step", error: any, props: narrationUtils.StepLabelPropsType) => void) {
        GameUnifier.onError = value;
    }
    /**
     * Is a function that will be executed before any step is executed.
     * @param stepId Step id
     * @param label Label
     * @returns
     */
    export function onStepStart(
        value: (stepId: number, label: narrationUtils.LabelAbstract<any>) => void | Promise<void>
    ) {
        narrationUtils.NarrationManagerStatic.onStepStart = value;
    }
    /**
     * Is a function that will be executed in {@link Game.onStepStart} if the id of the step is 0
     * and when the user laods a save file.
     * When you load a save file, will be executed all onLoadingLabel functions of the {@link narrationUtils.narration}.openedLabels.
     * It is useful for example to make sure all images used have been cached
     * @param stepId Step id
     * @param label Label
     * @returns
     * @example
     * ```typescript
     * Game.onLoadingLabel(async (stepId, label) => {
     *     await Assets.load('path/to/image1.png')
     *     await Assets.load('path/to/image2.png')
     * })
     * ```
     */
    export function onLoadingLabel(
        value: (stepId: number, label: narrationUtils.LabelAbstract<any>) => void | Promise<void>
    ) {
        narrationUtils.NarrationManagerStatic.onLoadingLabel = value;
    }
    /**
     * Is a function that will be executed when the step ends.
     * @param stepId Step id
     * @param label Label
     * @returns
     */
    export function onStepEnd(
        value: (stepId: number, label: narrationUtils.LabelAbstract<any>) => void | Promise<void>
    ) {
        narrationUtils.NarrationManagerStatic.onStepEnd = value;
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
    Pause,
    Repeat,
    PIXIVN_VERSION,
    ...functions,
    ...pixivninterface,
    canvas: canvasUtils.canvas,
    narration: narrationUtils.narration,
    sound: soundUtils.sound,
    storage: storageUtils.storage,
    history: historyUtils.stepHistory,
    Game,
    GameUnifier,
};
