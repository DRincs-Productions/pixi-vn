export * from "@drincs/pixi-vn/canvas";
export * from "@drincs/pixi-vn/characters";
export * from "@drincs/pixi-vn/core";
export * from "@drincs/pixi-vn/history";
export * from "@drincs/pixi-vn/narration";
export type {
    AllFederatedEventMap,
    ApplicationOptions,
    AssetsBundle,
    AssetsManifest,
    AssetSrc,
    FederatedEvent,
    LoadParserName,
    ResolvedAsset,
    ResolvedSrc,
    UnresolvedAsset,
} from "@drincs/pixi-vn/pixi.js";
export * from "@drincs/pixi-vn/sound";
export * from "@drincs/pixi-vn/storage";
export * from "./classes";
export {
    CANVAS_APP_GAME_LAYER_ALIAS,
    GENERAL_CHANNEL,
    Pause,
    PIXIVN_VERSION,
    Repeat,
    SYSTEM_RESERVED_STORAGE_KEYS,
} from "./constants";
export * from "./interfaces";
export * from "./utils";

import * as canvasUtils from "@drincs/pixi-vn/canvas";
import * as characterUtils from "@drincs/pixi-vn/characters";
import { GameUnifier } from "@drincs/pixi-vn/core";
import * as historyUtils from "@drincs/pixi-vn/history";
import { motion } from "@drincs/pixi-vn/motion";
import * as narrationUtils from "@drincs/pixi-vn/narration";
import type { ApplicationOptions } from "@drincs/pixi-vn/pixi.js";
import * as soundUtils from "@drincs/pixi-vn/sound";
import * as storageUtils from "@drincs/pixi-vn/storage";
import type { Devtools } from "@pixi/devtools";
import { CANVAS_APP_GAME_LAYER_ALIAS, Pause, PIXIVN_VERSION, Repeat } from "./constants";
import * as pixivninterface from "./interfaces";
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
     * @param options The options of PixiJS Application and other options
     * @param devtoolsOptions The options of the devtools. You can read more about it in the [PixiJS Devtools documentation](https://pixijs.io/devtools/docs/plugin/)
     * @example
     * ```typescript
     * const body = document.body
     * if (!body) {
     *     throw new Error('body element not found')
     * }
     * await Game.initialize(body, {
     *     navigate: (path) => {
     *         // navigate to the path
     *     },
     *     width: 1920,
     *     height: 1080,
     *     backgroundColor: "#303030"
     *     resizeMode: "contain"
     * })
     * ```
     */
    export async function init(
        element: HTMLElement,
        options: Partial<ApplicationOptions> & {
            /**
             * The id of the canvas element.
             * @default "pixi-vn-canvas"
             */
            id?: string;
            /**
             * The route navigate function.
             * You can set this function after the initialization using {@link GameUnifier.navigate}
             * @param path The path to navigate to.
             * @returns
             */
            navigate?: (path: string) => void | Promise<void>;
            /**
             * The resize mode of the canvas.
             * @default "contain"
             */
            resizeMode?: "contain" | "none";
        },
        devtoolsOptions?: Devtools,
    ): Promise<void>;
    /**
     * Initialize only the GameUnifier, and not the PixiJS Application and the interface div.
     * This method can be used if you want to use only the GameUnifier features, such as save/load game,
     * without initializing the canvas.
     */
    export async function init(): Promise<void>;
    export async function init(
        element?: HTMLElement,
        options?: Partial<ApplicationOptions> & {
            /**
             * The id of the canvas element.
             * @default "pixi-vn-canvas"
             */
            id?: string;
            /**
             * The route navigate function.
             * You can set this function after the initialization using {@link GameUnifier.navigate}
             * @param path The path to navigate to.
             * @returns
             */
            navigate?: (path: string) => void | Promise<void>;
            /**
             * The resize mode of the canvas.
             * @default "contain"
             */
            resizeMode?: "contain" | "none";
        },
        devtoolsOptions?: Devtools,
    ): Promise<void> {
        GameUnifier.init({
            navigate: options?.navigate,
            getCurrentGameStepState: () => {
                let canvasData = {};
                try {
                    canvasData = canvasUtils.canvas.export();
                } catch (e) {}
                return {
                    path: getGamePath(),
                    storage: storageUtils.storage.export(),
                    canvas: canvasData,
                    sound: soundUtils.sound.export(),
                    labelIndex: narrationUtils.NarrationManagerStatic.currentLabelStepIndex || 0,
                    openedLabels: narrationUtils.narration.openedLabels,
                };
            },
            restoreGameStepState: async (state, navigate) => {
                historyUtils.HistoryManagerStatic._originalStepData = state;
                narrationUtils.NarrationManagerStatic.openedLabels = state.openedLabels;
                storageUtils.storage.restore(state.storage);
                try {
                    await canvasUtils.canvas.restore(state.canvas);
                    await soundUtils.sound.restore(state.sound);
                } catch (e) {}
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
            getCharacter: (id: string) => {
                return characterUtils.RegisteredCharacters.get(id);
            },
            processNavigationRequests: (
                navigationRequestsCount: number,
                props: narrationUtils.StepLabelPropsType<any>,
            ) => {
                let newValue = navigationRequestsCount;
                let result: Promise<void | narrationUtils.StepLabelResultType> = Promise.resolve();
                if (navigationRequestsCount > 0) {
                    newValue--;
                    result = narrationUtils.narration.continue(props);
                } else if (navigationRequestsCount < 0) {
                    newValue = 0;
                    result = historyUtils.stepHistory.back(props, { steps: navigationRequestsCount * -1 });
                }
                return { newValue, result };
            },
            // animate function
            animate: (components, keyframes, options, priority) => {
                return motion.animate(components, keyframes, options, priority);
            },
            // storage
            getVariable: (prefix, key) => storageUtils.StorageManagerStatic.getVariable(prefix, key),
            setVariable: (prefix, key, value) => storageUtils.StorageManagerStatic.setVariable(prefix, key, value),
            removeVariable: (key) => storageUtils.storage.remove(key),
            getFlag: (key) => storageUtils.storage.getFlag(key),
            setFlag: (name, value) => storageUtils.storage.setFlag(name, value),
            onLabelClosing: (openedLabelsNumber) =>
                storageUtils.StorageManagerStatic.clearOldTempVariables(openedLabelsNumber),
        });
        asciiArtLog();
        if (!element || !options) {
            logger.warn("The canvas element or options are not defined. The canvas will not be initialized.");
            return;
        }
        return await canvasUtils.canvas.init(element, options, devtoolsOptions);
    }

    /**
     * Clear all game data. This function is used to reset the game.
     */
    export function clear() {
        storageUtils.storage.clear();
        try {
            canvasUtils.canvas.clear();
        } catch (e) {}
        soundUtils.sound.clear();
        narrationUtils.narration.clear();
        historyUtils.stepHistory.clear();
    }

    /**
     * Get all the game data. It can be used to save the game.
     * @returns The game data
     */
    export function exportGameState(): pixivninterface.GameState {
        let canvasData: any = {};
        try {
            canvasData = canvasUtils.canvas.export();
        } catch (e) {}
        return {
            pixivn_version: PIXIVN_VERSION,
            stepData: narrationUtils.narration.export(),
            storageData: storageUtils.storage.export(),
            canvasData: canvasData as canvasUtils.CanvasGameState,
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
        navigate: (path: string) => void | Promise<void>,
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
        try {
            await canvasUtils.canvas.restore(data.canvasData);
            await soundUtils.sound.restore(data.soundData);
        } catch (e) {}
        await navigate(data.path);
    }

    /**
     * Start the game with a label. This function will clear the canvas, stop all sounds and start the narration with the given label.
     * @param label The label to start the game with. It can be a string or a LabelAbstract instance. If it is a string, it will be used as the id of the label to start. If it is a LabelAbstract instance, it will be used directly. If the label is not found, an error will be thrown.
     * @param props The properties to pass to the label. It will be passed to the {@link StepLabelType} of the label when it is executed.
     * @returns The result of the label execution. It can be a {@link StepLabelResultType} or a Promise that resolves to a {@link StepLabelResultType}.
     */
    export async function start<T extends {} = {}>(
        label: narrationUtils.LabelAbstract<any, T> | string,
        props: narrationUtils.StepLabelPropsType<T>,
    ) {
        canvasUtils.canvas.removeAll();
        canvasUtils.canvas.clear();
        soundUtils.sound.stopAll();
        return await narrationUtils.narration.call(label, props);
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
     * Supports both synchronous and asynchronous error handlers.
     * @example
     * ```typescript
     * // Synchronous error handler
     * Game.onError((type, error, props) => {
     *    props.notify("An error occurred")
     *    // send a notification to GlitchTip, Sentry, etc...
     * })
     *
     * // Asynchronous error handler
     * Game.onError(async (type, error, props) => {
     *    await logErrorToServer(error)
     *    props.notify("An error occurred")
     * })
     *
     * // Error handler with step restoration/rollback
     * Game.onError(async (type, error, props) => {
     *    // Restore the game state to the previous step
     *    await stepHistory.back(props)
     *    props.notify("An error occurred, returning to previous step")
     * })
     * ```
     */
    export function onError(
        value: (
            /**
             * The type of error. Currently, only "step" type is supported.
             */
            type: "step",
            /**
             * The error object
             */
            error: any,
            /**
             * The step label properties
             */
            props: narrationUtils.StepLabelPropsType,
        ) => void | Promise<void>,
    ) {
        GameUnifier.onError = async (type, error, props) => {
            return value(type, error, props);
        };
    }
    /**
     * Is a function that will be executed before any step is executed.
     * @param stepId Step id
     * @param label Label
     * @returns
     */
    export function onStepStart(
        value: (stepId: number, label: narrationUtils.LabelAbstract<any>) => void | Promise<void>,
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
        value: (stepId: number, label: narrationUtils.LabelAbstract<any>) => void | Promise<void>,
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
        value: (stepId: number, label: narrationUtils.LabelAbstract<any>) => void | Promise<void>,
    ) {
        narrationUtils.NarrationManagerStatic.onStepEnd = value;
    }

    /**
     * Function to be executed when navigation is requested.
     * @example
     * ```typescript
     * Game.onNavigate(async (path) => {
     *    // custom navigation logic
     *    window.history.pushState({}, "title", path)
     * })
     * ```
     */
    export function onNavigate(value: (path: string) => void | Promise<void>) {
        GameUnifier.navigate = value;
    }

    /**
     * Register a handler to run immediately before a narration "continue" operation.
     * Handlers are executed in registration order and may be async. Use
     * `{@link addOnPreContinue}` / `{@link removeOnPreContinue}` to manage them programmatically.
     */
    export function addOnPreContinue(handler: () => Promise<void> | void) {
        return GameUnifier.addOnPreContinue(handler);
    }
    export function removeOnPreContinue(handler: () => Promise<void> | void) {
        return GameUnifier.removeOnPreContinue(handler);
    }
}

export default {
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
