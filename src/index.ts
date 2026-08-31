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
    PIXIVN_VERSION,
    SYSTEM_RESERVED_STORAGE_KEYS,
} from "./constants";
export * from "./interfaces";
export * from "./utils";

import * as canvasUtils from "@drincs/pixi-vn/canvas";
import * as characterUtils from "@drincs/pixi-vn/characters";
import type { OnErrorHandler } from "@drincs/pixi-vn/core";
import { GameUnifier, PixiError } from "@drincs/pixi-vn/core";
import * as historyUtils from "@drincs/pixi-vn/history";
import { motion } from "@drincs/pixi-vn/motion";
import * as narrationUtils from "@drincs/pixi-vn/narration";
import type { ApplicationOptions } from "@drincs/pixi-vn/pixi.js";
import * as soundUtils from "@drincs/pixi-vn/sound";
import * as storageUtils from "@drincs/pixi-vn/storage";
import type { Devtools } from "@pixi/devtools";
import { CANVAS_APP_GAME_LAYER_ALIAS, PIXIVN_VERSION } from "./constants";
import * as pixivninterface from "./interfaces";
import * as functions from "./utils";
import { asciiArtLog } from "./utils/easter-egg";
import { logger } from "./utils/log-utility";
import { getGamePath } from "./utils/path-utility";

asciiArtLog();

export namespace Game {
    /**
     * Initialize the Game and PixiJS Application and the interface div.
     * This method should be called before any other method.
     * @param element The html element where I will put the canvas. Example: document.body
     * @param width The width of the canvas
     * @param height The height of the canvas
     * @param options Equivalent to the options you can use when initializing a [PixiJS Application](https://pixijs.com/8.x/guides/components/application). Additionally, it supports the following options:
     * - `id`: The id of the canvas element.
     * - `navigate`: The route navigate function.
     * - `resizeMode`: The resize mode of the canvas.
     * @param devtoolsOptions Equivalent to the options you can use when initializing the [PixiJS Devtools](https://pixi-vn.com/start/canvas#use-pixijs-devtools-with-pixivn).
     * @example
     * ```ts
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
             * The id of the canvas element. It will be used to create the canvas element and to reference it.
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
             * The resize mode of the canvas. Possible values are:
             * - `none`: No resizing.
             * - `contain`: The canvas will be resized to fit within the parent element while maintaining its aspect ratio. (default)
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
            id?: string;
            navigate?: (path: string) => void | Promise<void>;
            resizeMode?: "contain" | "none";
        },
        devtoolsOptions?: Devtools,
    ): Promise<void> {
        GameUnifier.init({
            navigate: options?.navigate,
            getCurrentGameStepState: () => {
                // Canvas usage is optional - when Game.init() was never given a canvas element,
                // canvas.export() would throw (and log an error) on every single step just to be
                // caught here. Skip it entirely instead of relying on the throw/catch for control flow.
                const canvasData = canvasUtils.canvas.isInitialized
                    ? canvasUtils.canvas.export()
                    : {};
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
                    if (canvasUtils.canvas.isInitialized) {
                        await canvasUtils.canvas.restore(state.canvas);
                    }
                    await soundUtils.sound.restore(state.sound);
                } catch (e) {
                    logger.error("Error restoring game step state:", e);
                }
                await navigate(state.path);
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
                    result = historyUtils.stepHistory.back(props, {
                        steps: navigationRequestsCount * -1,
                    });
                }
                return { newValue, result };
            },
            // animate function
            animate: (components, keyframes, options, priority) => {
                return motion.animate(components, keyframes, options, priority);
            },
            // storage
            getVariable: (prefix, key) => storageUtils.StorageRegistry.getVariable(prefix, key),
            setVariable: (prefix, key, value) =>
                storageUtils.StorageRegistry.setVariable(prefix, key, value),
            removeVariable: (prefix, key) =>
                storageUtils.StorageRegistry.removeVariable(prefix, key),
            getFlag: (key) => storageUtils.storage.flags.get(key),
            setFlag: (name, value) => storageUtils.storage.flags.set(name, value),
            onLabelClosing: (openedLabelsNumber) =>
                storageUtils.StorageRegistry.clearOldTempVariables(openedLabelsNumber),
        });
        if (!element || !options) {
            logger.warn(
                "The canvas element or options are not defined. The canvas will not be initialized.",
            );
            return;
        }
        return await canvasUtils.canvas.init(element, options, devtoolsOptions);
    }

    /**
     * Clear all game data. This function is used to reset the game.
     */
    export function clear() {
        storageUtils.storage.clear();
        if (canvasUtils.canvas.isInitialized) {
            canvasUtils.canvas.clear();
        }
        soundUtils.sound.clear();
        narrationUtils.narration.clear();
        historyUtils.stepHistory.clear();
    }

    /**
     * Get all the game data. It can be used to save the game.
     * @returns The game data
     */
    export function exportGameState(): pixivninterface.GameState {
        // Canvas usage is optional - when Game.init() was never given a canvas element,
        // canvas.export() would throw (and log an error) just to be caught here.
        const canvasData = canvasUtils.canvas.isInitialized ? canvasUtils.canvas.export() : {};
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
     * @param data The save data object to restore the game state from.
     */
    export async function restoreGameState(data: pixivninterface.GameState): Promise<void> {
        historyUtils.stepHistory.restore(data.historyData);
        const lastHistoryKey = historyUtils.stepHistory.lastKey;
        if (typeof lastHistoryKey === "number") {
            const historyItem = historyUtils.stepHistory.stepsInfoMap.get(lastHistoryKey) || null;
            await narrationUtils.narration.restore(data.stepData, historyItem);
        }
        storageUtils.storage.restore(data.storageData);
        try {
            if (canvasUtils.canvas.isInitialized) {
                await canvasUtils.canvas.restore(data.canvasData);
            }
            await soundUtils.sound.restore(data.soundData);
        } catch (_e) {}
        await GameUnifier.navigate(data.path);
    }

    /**
     * Start the game with a label. This function will clear all the game data and start the narration from the specified label.
     * @param label The label to start the game with. It can be a string or a LabelAbstract instance. If it is a string, it will be used as the id of the label to start. If it is a LabelAbstract instance, it will be used directly. If the label is not found, an error will be thrown.
     * @param props The properties to pass to the label. It will be passed to the {@link StepLabelType} of the label when it is executed.
     * @returns The result of the label execution. It can be a {@link StepLabelResultType} or a Promise that resolves to a {@link StepLabelResultType}.
     */
    export async function start<T extends {} = {}>(
        label: narrationUtils.LabelAbstract<any, T> | narrationUtils.LabelIdType,
        props: narrationUtils.StepLabelPropsType<T>,
    ) {
        Game.clear();
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
     * ```ts
     * Game.onEnd(async (props) => {
     *    props.navigate("/end")
     * })
     * ```
     */
    export function onEnd(value: narrationUtils.StepLabelType) {
        GameUnifier.onEnd = value;
    }

    /**
     * Register an error handler. Multiple handlers can be registered; they
     * will be executed in registration order.
     *
     * You can also check if the error is an instance of {@link PixiError} to handle specific errors related to Pixi’VN.
     *
     * @example
     * ```ts
     * // Register a synchronous error handler
     * Game.addOnError((error, props) => {
     *    props.notify("An error occurred")
     *    // send a notification to GlitchTip, Sentry, etc...
     * })
     *
     * // Register an error handler for Pixi’VN specific errors
     * Game.addOnError((error, { notify }) => {
     *     if (error instanceof PixiError) {
     *         // ...
     *     }
     * });
     *
     * // Register an asynchronous error handler
     * Game.addOnError(async (error, props) => {
     *    await logErrorToServer(error)
     *    props.notify("An error occurred")
     * })
     *
     * // Register an error handler with step restoration/rollback
     * Game.addOnError(async (error, props) => {
     *    // Restore the game state to the previous step
     *    await stepHistory.back(props)
     *    props.notify("An error occurred, returning to previous step")
     * })
     * ```
     */
    export function addOnError(value: OnErrorHandler) {
        return GameUnifier.addOnError(value);
    }

    /**
     * Remove a previously registered error handler.
     */
    export function removeOnError(handler: OnErrorHandler) {
        return GameUnifier.removeOnError(handler);
    }
    /**
     * Is a function that will be executed before any step is executed.
     * @param stepId The index of the `step` being executed
     * @param label The `label` containing the `step`
     * @returns
     */
    export function onStepStart(
        value: (stepId: number, label: narrationUtils.LabelAbstract<any>) => void | Promise<void>,
    ) {
        narrationUtils.NarrationManagerStatic.onStepStart = value;
    }
    /**
     * Is a function that will be executed in {@link onStepStart} if the id of the step is 0
     * and when the user laods a save file.
     * When you load a save file, will be executed all onLoadingLabel functions of the {@link narrationUtils.narration}.openedLabels.
     * It is useful for example to make sure all images used have been cached
     * @param stepId The index of the `step` being executed
     * @param label The `label` being executed
     * @returns
     * @example
     * ```ts
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
     * @param stepId The index of the `step` that ended
     * @param label The `label` containing the `step`
     * @returns
     */
    export function onStepEnd(
        value: (stepId: number, label: narrationUtils.LabelAbstract<any>) => void | Promise<void>,
    ) {
        narrationUtils.NarrationManagerStatic.onStepEnd = value;
    }
    /**
     * Is a function that will be executed every time a label is about to be started, either via
     * `narration.call`, `narration.jump`, or a choice of type `"call"` / `"jump"`.
     *
     * By default (when this is not set), the label starts immediately, exactly like before this hook
     * existed. If you set it, you take control: call `defaultStart()` yourself whenever you actually
     * want the label to run — right away, or later (e.g. on a subsequent player action in your
     * template). Until `defaultStart()` is called, nothing about the label happens: it is not added to
     * the history and no step of it runs.
     * @example
     * ```ts
     * Game.onLabelStarting((labelId, props, options, defaultStart) => {
     *     pendingLabelStart = defaultStart; // keep it for later, don't run it now
     * })
     * ```
     */
    export function onLabelStarting(
        value: (
            labelId: narrationUtils.LabelIdType,
            props: narrationUtils.StepLabelPropsType,
            options: {
                choiceMade?: number;
                closeCurrentLabel?: boolean;
                type: string;
            },
            defaultStart: () => Promise<narrationUtils.StepLabelResultType>,
        ) => narrationUtils.StepLabelResultType | Promise<narrationUtils.StepLabelResultType>,
    ) {
        narrationUtils.NarrationManagerStatic.onLabelStarting = value;
    }
    /**
     * Is a function that will be executed every time the current label is about to close because it
     * naturally ran out of steps and control is returning to the label that called it.
     *
     * By default (when this is not set), the label closes immediately, exactly like before this hook
     * existed. If you set it, you take control: call `defaultClose()` yourself whenever you actually
     * want the label to close — right away, or later (e.g. on a subsequent player action in your
     * template). Until `defaultClose()` is called, the label stays open and narration does not
     * continue into the parent label.
     *
     * This does not fire for a `jump` or a choice's `closeCurrentLabel` option - those close the
     * current label as part of starting a new one, so {@link onLabelStarting} already covers
     * deferring them.
     * @example
     * ```ts
     * Game.onLabelClosing((labelId, props, defaultClose) => {
     *     pendingLabelClose = defaultClose; // keep it for later, don't run it now
     * })
     * ```
     */
    export function onLabelClosing(
        value: (
            labelId: narrationUtils.LabelIdType,
            props: narrationUtils.StepLabelPropsType,
            defaultClose: () => Promise<narrationUtils.StepLabelResultType>,
        ) => narrationUtils.StepLabelResultType | Promise<narrationUtils.StepLabelResultType>,
    ) {
        narrationUtils.NarrationManagerStatic.onLabelClosing = value;
    }

    /**
     * Function to be executed when navigation is requested.
     * @example
     * ```ts
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

    /**
     * Lets an AI agent (or any external script/browser console) drive and inspect a running game
     * through `window`, without needing to know the app's own UI wiring. Not enabled by default —
     * something must opt in, typically only in development. Two pieces are needed:
     * - `enable()`/`disable()` turn the `window` bridge on/off — the `@drincs/pixi-vn/vite` plugin's
     *   `testing` option does this automatically while its dev server is running, with no extra code.
     * - `setProps(props)` keeps the live app props (`navigate`/`t`/`toast`/etc.) available to every
     *   action — call it unconditionally from wherever your app builds those props (e.g. at the end
     *   of a `useGameProps()`-style hook), since every action needs up-to-date props whether or not
     *   testing happens to be enabled right now.
     * See the `pixi-vn-testing` skill for the full guide (activation patterns, the complete command
     * surface, and cookbook snippets for a browser-driven test session).
     */
    export namespace testing {
        /**
         * One error captured by {@link enable} while testing is active, via {@link Game.addOnError}.
         */
        export interface GameTestingErrorEntry {
            error: unknown;
            timestamp: number;
        }

        /**
         * A read-only snapshot of everything a test session typically needs to decide its next
         * action, gathered from {@link narrationUtils.narration} and {@link historyUtils.stepHistory}
         * in a single call instead of reading several properties one by one.
         */
        export interface GameTestingState {
            dialogue: narrationUtils.DialogueInterface | undefined;
            dialogueGlue: boolean;
            choices: narrationUtils.StoredIndexedChoiceInterface[] | undefined;
            input: {
                isRequired: boolean;
                type: string | undefined;
                value: storageUtils.StorageElementType;
            };
            canContinue: boolean;
            canGoBack: boolean;
            labelsOpened: narrationUtils.OpenedLabel[];
            currentLabelId: string | undefined;
            stepCounter: number;
        }

        /**
         * The object attached to `window` (and returned) by {@link enable}. Every action method
         * merges the most recent props passed to {@link setProps} with any `extraProps` given here,
         * then delegates to the matching narration/history call — so calling these behaves exactly
         * like a real player action (the same `navigate`/`t`/`toast`/etc. the real UI uses).
         *
         * `narration`, `storage`, `stepHistory` and `Game` are also exposed directly for anything not
         * covered by the action methods (e.g. `storage.set(...)`, `Game.exportGameState()`).
         */
        export interface GameTestingAPI<T extends {} = {}> {
            readonly Game: typeof Game;
            readonly narration: narrationUtils.NarrationManagerInterface;
            readonly storage: storageUtils.StorageManagerInterface;
            readonly stepHistory: historyUtils.HistoryManagerInterface;
            /**
             * The most recent props passed to {@link setProps} — whatever your app's `StepLabelProps`
             * augmentation defines (e.g. `navigate`, `toast`). Useful to drive the app's UI directly
             * during a test session — e.g. `pixiVN.props.navigate("/settings")` — not just narration,
             * for full control over what's on screen.
             */
            readonly props: narrationUtils.StepLabelPropsType<T>;
            /** {@link Game.start} using the live props plus any `extraProps`. */
            start(
                label: narrationUtils.LabelAbstract<any, T> | narrationUtils.LabelIdType,
                extraProps?: Partial<T>,
            ): Promise<narrationUtils.StepLabelResultType>;
            /** {@link narrationUtils.NarrationManagerInterface.continue} using the live props plus any `extraProps`. */
            continue(
                extraProps?: Partial<T>,
                options?: { steps?: number; runNow?: boolean },
            ): Promise<narrationUtils.StepLabelResultType>;
            /** {@link narrationUtils.NarrationManagerInterface.call} using the live props plus any `extraProps`. */
            call(
                label: narrationUtils.LabelAbstract<any, T> | narrationUtils.LabelIdType,
                extraProps?: Partial<T>,
            ): Promise<narrationUtils.StepLabelResultType>;
            /** {@link narrationUtils.NarrationManagerInterface.jump} using the live props plus any `extraProps`. */
            jump(
                label: narrationUtils.LabelAbstract<any, T> | narrationUtils.LabelIdType,
                extraProps?: Partial<T>,
            ): Promise<narrationUtils.StepLabelResultType>;
            /**
             * Selects the currently open choice with this `choiceIndex` (as seen in
             * `getState().choices`), using the live props plus any `extraProps`.
             * @throws when no open choice has that index.
             */
            selectChoice(
                choiceIndex: number,
                extraProps?: Partial<T>,
            ): Promise<narrationUtils.StepLabelResultType>;
            /** Resolves a pending `narration.input.request(...)` with `value`, exactly like the player typing an answer and confirming. */
            setInput(value: storageUtils.StorageElementType): void;
            /** {@link historyUtils.HistoryManagerInterface.back} using the live props plus any `extraProps`. */
            goBack(
                extraProps?: Partial<T>,
                options?: { steps?: number },
            ): Promise<narrationUtils.StepLabelResultType>;
            /** {@link narrationUtils.NarrationLabelsInterface.closeCurrent} */
            closeCurrentLabel(): void;
            /** {@link narrationUtils.NarrationLabelsInterface.closeAll}. **Can end the game.** */
            closeAllLabels(): void;
            /** A snapshot of dialogue/choices/input/canContinue/canGoBack/labels — see {@link GameTestingState}. */
            getState(): GameTestingState;
            /** Errors caught via {@link Game.addOnError} since `enable()` was called (or since the last {@link clearErrors}). */
            readonly errors: GameTestingErrorEntry[];
            clearErrors(): void;
        }

        interface ActiveSession {
            api: GameTestingAPI<any>;
            windowKey: string;
            errorHandler: OnErrorHandler;
        }

        let active: ActiveSession | undefined;

        /**
         * The most recent props passed to {@link setProps}, used by every {@link GameTestingAPI}
         * action. Kept even while disabled, so a session started later already has fresh props.
         */
        let currentProps: {} = {};

        /**
         * Updates the live props every {@link GameTestingAPI} action merges `extraProps` on top of.
         * Call this unconditionally from wherever your app builds its `StepLabelProps` (e.g. the end
         * of a `useGameProps()`-style hook that already runs throughout the app) — it's a cheap
         * assignment, safe to call whether or not testing is currently {@link enable}d.
         * @param props The app's current `StepLabelProps` (the same object your UI passes to
         * `narration.continue`/`Game.start`).
         */
        export function setProps<T extends {} = {}>(
            props: narrationUtils.StepLabelPropsType<T>,
        ): void {
            currentProps = props;
        }

        /**
         * Enables the testing API: builds it, attaches it to `window[windowKey]` (default
         * `"pixiVN"`), and returns it. Calling this again replaces the previous session.
         * @param options.windowKey The property name to attach the API under on `window`. @default "pixiVN"
         */
        export function enable<T extends {} = {}>(options?: {
            windowKey?: string;
        }): GameTestingAPI<T> {
            if (active) {
                disable();
            }

            const windowKey = options?.windowKey ?? "pixiVN";
            const errors: GameTestingErrorEntry[] = [];
            const mergeProps = (extraProps?: Partial<T>) =>
                ({
                    ...currentProps,
                    ...extraProps,
                }) as narrationUtils.StepLabelPropsType<T>;

            const api: GameTestingAPI<T> = {
                Game,
                narration: narrationUtils.narration,
                storage: storageUtils.storage,
                stepHistory: historyUtils.stepHistory,
                get props() {
                    return currentProps as narrationUtils.StepLabelPropsType<T>;
                },
                start: (label, extraProps) => Game.start(label, mergeProps(extraProps)),
                continue: (extraProps, options) =>
                    narrationUtils.narration.continue(mergeProps(extraProps), options),
                call: (label, extraProps) =>
                    narrationUtils.narration.call(label, mergeProps(extraProps)),
                jump: (label, extraProps) =>
                    narrationUtils.narration.jump(label, mergeProps(extraProps)),
                selectChoice: (choiceIndex, extraProps) => {
                    const item = narrationUtils.narration.choices.list?.find(
                        (choice) => choice.choiceIndex === choiceIndex,
                    );
                    if (!item) {
                        const available =
                            narrationUtils.narration.choices.list
                                ?.map((choice) => choice.choiceIndex)
                                .join(", ") ?? "none (no choice menu is open)";
                        throw new Error(
                            `Game.testing: no open choice with index ${choiceIndex}. Available: ${available}`,
                        );
                    }
                    return narrationUtils.narration.choices.select(item, mergeProps(extraProps));
                },
                setInput: (value) => {
                    narrationUtils.narration.input.value = value;
                },
                goBack: (extraProps, options) =>
                    historyUtils.stepHistory.back(mergeProps(extraProps), options),
                closeCurrentLabel: () => narrationUtils.narration.labels.closeCurrent(),
                closeAllLabels: () => narrationUtils.narration.labels.closeAll(),
                getState: () => ({
                    dialogue: narrationUtils.narration.dialogue,
                    dialogueGlue: narrationUtils.narration.dialogGlue,
                    choices: narrationUtils.narration.choices.list,
                    input: {
                        isRequired: narrationUtils.narration.input.isRequired,
                        type: narrationUtils.narration.input.type,
                        value: narrationUtils.narration.input.value,
                    },
                    canContinue: narrationUtils.narration.canContinue,
                    canGoBack: historyUtils.stepHistory.canGoBack,
                    labelsOpened: narrationUtils.narration.labels.opened,
                    currentLabelId: narrationUtils.narration.labels.current?.id,
                    stepCounter: narrationUtils.narration.stepCounter,
                }),
                get errors() {
                    return errors.slice();
                },
                clearErrors: () => {
                    errors.length = 0;
                },
            };

            const errorHandler: OnErrorHandler = (error) => {
                errors.push({ error, timestamp: Date.now() });
            };
            Game.addOnError(errorHandler);

            if (typeof window !== "undefined") {
                (window as unknown as Record<string, unknown>)[windowKey] = api;
            } else {
                logger.warn(
                    `Game.testing.enable(): "window" is not defined, so the API was not attached globally (it was still returned).`,
                );
            }

            active = { api, windowKey, errorHandler };
            return api;
        }

        /**
         * Disables a session started with {@link enable}: removes the error handler and, if it's
         * still the current value, deletes `window[windowKey]`. No-op if testing isn't enabled.
         */
        export function disable() {
            if (!active) {
                return;
            }
            Game.removeOnError(active.errorHandler);
            if (
                typeof window !== "undefined" &&
                (window as unknown as Record<string, unknown>)[active.windowKey] === active.api
            ) {
                delete (window as unknown as Record<string, unknown>)[active.windowKey];
            }
            active = undefined;
        }

        /** Whether a testing session is currently active. */
        export function isEnabled(): boolean {
            return active !== undefined;
        }
    }
}

export default {
    characterUtils,
    canvasUtils,
    narrationUtils,
    soundUtils,
    CANVAS_APP_GAME_LAYER_ALIAS,
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
