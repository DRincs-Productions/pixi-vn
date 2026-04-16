import type { CharacterInterface, GameStepState, HistoryInfo } from "@drincs/pixi-vn";
import type { CanvasBaseInterface } from "@drincs/pixi-vn/canvas";
import type { UPDATE_PRIORITY } from "@drincs/pixi-vn/pixi.js";
import type {
    StepLabelPropsType,
    StepLabelResultType,
    StepLabelType,
} from "../narration/types/StepLabelType";
import type { StorageElementType } from "../storage/types/StorageElementType";
import { logger } from "../utils/log-utility";
import type OnErrorHandler from "./OnErrorHandler";
import PixiError from "./PixiError";

let _getStepCounter: () => number = () => {
    logger.error("Method not implemented, you should initialize the Game: Game.init()");
    throw new PixiError(
        "not_implemented",
        "Method not implemented, you should initialize the Game: Game.init()",
    );
};
let _setStepCounter: (value: number) => void = () => {
    logger.error("Method not implemented, you should initialize the Game: Game.init()");
    throw new PixiError(
        "not_implemented",
        "Method not implemented, you should initialize the Game: Game.init()",
    );
};
let _getCurrentGameStepState: () => GameStepState = () => {
    logger.error("Method not implemented, you should initialize the Game: Game.init()");
    throw new PixiError(
        "not_implemented",
        "Method not implemented, you should initialize the Game: Game.init()",
    );
};
let _getOpenedLabels: () => number = () => {
    logger.error("Method not implemented, you should initialize the Game: Game.init()");
    throw new PixiError(
        "not_implemented",
        "Method not implemented, you should initialize the Game: Game.init()",
    );
};
let _processNavigationRequests: (
    navigationRequestsCount: number,
    props: StepLabelPropsType<any>,
) => {
    newValue: number;
    result: Promise<StepLabelResultType>;
} = () => {
    logger.error("Method not implemented, you should initialize the Game: Game.init()");
    throw new PixiError(
        "not_implemented",
        "Method not implemented, you should initialize the Game: Game.init()",
    );
};
let navigationRequestsCount: number = 0;
let processNavigationLock: Promise<void> = Promise.resolve();
let _onPreContinueHandlers: Array<() => Promise<void> | void> = [];
let _onErrorHandlers: Array<OnErrorHandler> = [];

namespace GameUnifier {
    export function init(options: {
        /**
         * The navigate function.
         * @param path The path to navigate to.
         * @returns
         */
        navigate?: (path: string) => void | Promise<void>;
        /**
         * This function returns the current step counter. This counter corresponds to the total number of steps that have been executed so far.
         *
         * If your game engine does not have a history of steps, you can return 0.
         */
        getStepCounter: () => number;
        /**
         * This function sets the current step counter.
         *
         * If your game engine does not have a history of steps, you can not set the step counter.
         */
        setStepCounter: (value: number) => void;
        /**
         * This function returns the current state of the game step.
         *
         * If your game engine does not have a history of steps, you can return an empty object.
         */
        getCurrentGameStepState: () => GameStepState;
        /**
         * This function restores the game step state.
         *
         * If your game engine does not have a history of steps, you can return a resolved promise.
         *
         * @param state The state to restore.
         * @param navigate The function to navigate to the restored path.
         */
        restoreGameStepState: (
            state: GameStepState,
            navigate: (path: string) => void | Promise<void>,
        ) => Promise<void>;
        /**
         * This function returns the number of opened labels.
         *
         * If your game engine does not have a narration system, you can return 0.
         */
        getOpenedLabels: () => number;
        /**
         * This function is called to process the pending navigation requests (continue/back).
         */
        processNavigationRequests: (
            navigationRequestsCount: number,
            props: StepLabelPropsType<any>,
        ) => {
            newValue: number;
            result: Promise<StepLabelResultType>;
        };
        /**
         * This function returns the value of a variable.
         * @param key The key of the variable.
         * @returns The value of the variable.
         */
        getVariable: <T = StorageElementType>(prefix: string, key: string) => T | undefined;
        /**
         * This function sets the value of a variable.
         * @param key The key of the variable.
         * @param value The value of the variable.
         */
        setVariable: (prefix: string, key: string, value: StorageElementType) => void;
        /**
         * This function removes a variable.
         * @param key The key of the variable.
         */
        removeVariable: (prefix: string, key: string) => void;
        /**
         * This function returns the value of a flag.
         * @param name The name of the flag.
         */
        getFlag: (name: string) => boolean;
        /**
         * This function sets the value of a flag.
         * @param name The name of the flag.
         * @param value The value of the flag.
         */
        setFlag: (name: string, value: boolean) => void;
        /**
         * This function is called after the narration.continue() method is executed.
         *
         * It can be used to clear old temporary variables.
         *
         * @param openedLabelsNumber The number of opened labels.
         */
        onLabelClosing?: (openedLabelsNumber: number) => void;
        /**
         * Add a history step to the history.
         *
         * If your game engine does not have a history of steps, you can return a resolved promise.
         *
         * @param historyInfo The history information.
         * @param opstions Options to add the step.
         */
        addHistoryItem(
            historyInfo?: HistoryInfo,
            opstions?: {
                /**
                 * If true, the step will not be added to the history if the current step is the same as the last step.
                 */
                ignoreSameStep?: boolean;
            },
        ): void;
        /**
         * This function returns the character by its id.
         * @param id The id of the character.
         * @returns The character or undefined if it does not exist.
         */
        getCharacter: (id: string) => CharacterInterface | undefined;
        /**
         * This function is called to animate a component.
         * @param components - The PixiJS component(s) to animate.
         * @param keyframes - The keyframes to animate the component(s) with.
         * @param options - Additional options for the animation, including duration, easing, and ticker.
         * @param priority - The priority of the ticker. @default UPDATE_PRIORITY.NORMAL
         * @returns The id of tickers.
         * @template T - The type of Pixi'VN component(s) being animated.
         */
        animate: <T extends CanvasBaseInterface<any>>(
            components: T | string | (string | T)[],
            keyframes: any,
            options?: any,
            priority?: UPDATE_PRIORITY,
        ) => string | undefined;
    }) {
        options.navigate && (navigate = options.navigate);
        _getStepCounter = options.getStepCounter;
        _setStepCounter = options.setStepCounter;
        _getCurrentGameStepState = options.getCurrentGameStepState;
        restoreGameStepState = options.restoreGameStepState;
        _getOpenedLabels = options.getOpenedLabels;
        _processNavigationRequests = options.processNavigationRequests;
        getVariable = options.getVariable;
        setVariable = options.setVariable;
        removeVariable = options.removeVariable;
        getFlag = options.getFlag;
        setFlag = options.setFlag;
        options.onLabelClosing && (onLabelClosing = options.onLabelClosing);
        addHistoryItem = options.addHistoryItem;
        getCharacter = options.getCharacter;
        animate = options.animate;
    }

    export let navigate: (path: string) => void | Promise<void> = () => {
        logger.warn(
            "Navigate function not initialized. You should add the navigate function in the Game.init() method.",
        );
    };

    /**
     * Returns the current step counter. This counter corresponds to the total number of steps that have been executed so far.
     * @throws {PixiError} when `Game.init()` has not been called yet.
     */
    export function stepCounter(): number {
        return _getStepCounter();
    }
    /**
     * Sets the current step counter.
     * @throws {PixiError} when `Game.init()` has not been called yet.
     */
    export function setStepCounter(value: number): void {
        _setStepCounter(value);
    }
    /**
     * Returns the current state of the game step.
     * @throws {PixiError} when `Game.init()` has not been called yet.
     */
    export function currentGameStepState(): GameStepState {
        return _getCurrentGameStepState();
    }
    /**
     * Restores the game step state.
     * @param state The state to restore.
     * @param navigate The function to navigate to the restored path.
     */
    export let restoreGameStepState: (
        state: GameStepState,
        navigate: (path: string) => void | Promise<void>,
    ) => Promise<void> = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.init()");
        throw new PixiError(
            "not_implemented",
            "Method not implemented, you should initialize the Game: Game.init()",
        );
    };
    /**
     * Returns the number of opened labels.
     * @throws {PixiError} when `Game.init()` has not been called yet.
     */
    export function openedLabels(): number {
        return _getOpenedLabels();
    }

    /**
     * Register a handler to run immediately before a narration "continue" operation.
     * Handlers are executed in registration order and may be async. Use
     * `{@link addOnPreContinue}` / `{@link removeOnPreContinue}` to manage them programmatically.
     */
    export function addOnPreContinue(handler: () => Promise<void> | void) {
        _onPreContinueHandlers.push(handler);
    }
    export function removeOnPreContinue(handler: () => Promise<void> | void) {
        _onPreContinueHandlers = _onPreContinueHandlers.filter((h) => h !== handler);
    }
    export function clearOnPreContinueHandlers() {
        _onPreContinueHandlers = [];
    }
    /**
     * This function is called immediately before a narration "continue" operation.
     */
    export async function onPreContinue() {
        const handlers = _onPreContinueHandlers.slice();
        await Promise.all(handlers.map((h) => h()));
    }

    /**
     * This function is called to get the number of pending continue requests.
     * Returns a positive count of pending continue requests when navigationRequestsCount is positive.
     * If it is > 0, after the stepsRunning is 0, the next step will be executed.
     */
    export function continueRequestsCount(): number {
        return navigationRequestsCount;
    }
    /**
     * This function is called to increase the number of pending continue requests.
     * @param amount The number of steps to increase. Default is 1.
     */
    export function increaseContinueRequest(amount: number = 1) {
        navigationRequestsCount += amount;
    }
    /**
     * This function is called to get the number of pending back requests.
     * Returns the negation of navigationRequestsCount.
     * If it is > 0, after the stepsRunning is 0, the previous step will be executed.
     */
    export function backRequestsCount(): number {
        return -1 * navigationRequestsCount;
    }
    /**
     * This function is called to increase the number of pending back requests.
     * @param amount The number of steps to increase. Default is 1.
     */
    export function increaseBackRequest(amount: number = 1) {
        navigationRequestsCount -= amount;
    }
    /**
     * This function processes the pending navigation requests (continue/back).
     * @throws {PixiError} when `Game.init()` has not been called yet.
     */
    export async function processNavigationRequests(props: StepLabelPropsType<any>) {
        const processResult = _processNavigationRequests(navigationRequestsCount, props);
        navigationRequestsCount = processResult.newValue;
        const result = await processResult.result;
        return result;
    }

    /**
     * This function returns the value of a variable.
     * @param key The key of the variable.
     * @returns The value of the variable.
     */
    export let getVariable: <T = StorageElementType>(
        prefix: string,
        key: string,
    ) => T | undefined = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.init()");
        throw new PixiError(
            "not_implemented",
            "Method not implemented, you should initialize the Game: Game.init()",
        );
    };
    /**
     * This function sets the value of a variable.
     * @param key The key of the variable.
     * @param value The value of the variable.
     */
    export let setVariable: (prefix: string, key: string, value: StorageElementType) => void =
        () => {
            logger.error("Method not implemented, you should initialize the Game: Game.init()");
            throw new PixiError(
                "not_implemented",
                "Method not implemented, you should initialize the Game: Game.init()",
            );
        };
    /**
     * This function removes a variable.
     * @param key The key of the variable.
     */
    export let removeVariable: (prefix: string, key: string) => void = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.init()");
        throw new PixiError(
            "not_implemented",
            "Method not implemented, you should initialize the Game: Game.init()",
        );
    };
    /**
     * This function returns the value of a flag.
     * @param name The name of the flag.
     */
    export let getFlag: (name: string) => boolean = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.init()");
        throw new PixiError(
            "not_implemented",
            "Method not implemented, you should initialize the Game: Game.init()",
        );
    };
    /**
     * This function sets the value of a flag.
     * @param name The name of the flag.
     * @param value The value of the flag.
     */
    export let setFlag: (name: string, value: boolean) => void = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.init()");
        throw new PixiError(
            "not_implemented",
            "Method not implemented, you should initialize the Game: Game.init()",
        );
    };
    /**
     * This function is called after the narration.continue() method is executed
     * It can be used to clear old temporary variables.
     * @param openedLabelsNumber The number of opened labels.
     */
    export let onLabelClosing: (openedLabelsNumber: number) => void = () => {};
    /**
     * Add a history step to the history.
     * @param historyInfo The history information.
     * @param opstions Options to add the step.
     */
    export let addHistoryItem: (
        historyInfo?: HistoryInfo,
        opstions?: {
            /**
             * If true, the step will not be added to the history if the current step is the same as the last step.
             */
            ignoreSameStep?: boolean;
        },
    ) => void = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.init()");
        throw new PixiError(
            "not_implemented",
            "Method not implemented, you should initialize the Game: Game.init()",
        );
    };

    /**
     * Count of currently executing steps.
     * If a step triggers a narration.continue(), this number is greater than 1.
     */
    export let runningStepsCount: number = 0;

    /**
     * This function returns the character by its id.
     * @param id The id of the character.
     * @returns The character or undefined if it does not exist.
     */
    export let getCharacter: (id: string) => CharacterInterface | undefined = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.init()");
        throw new PixiError("not_implemented", "Method not implemented.");
    };

    export let onEnd: StepLabelType | undefined = undefined;

    // New: list of registered error handlers. Handlers are executed in
    // registration order and may be async.
    export function addOnError(handler: OnErrorHandler) {
        _onErrorHandlers.push(handler);
        return () => removeOnError(handler);
    }

    export function removeOnError(handler: OnErrorHandler) {
        _onErrorHandlers = _onErrorHandlers.filter((h) => h !== handler);
    }

    export function clearOnErrorHandlers() {
        _onErrorHandlers.length = 0;
    }

    export async function runOnError(error: unknown, props: StepLabelPropsType<any> | {}) {
        for (const h of _onErrorHandlers.slice()) {
            try {
                await h(error, props);
            } catch (e) {
                logger.error("Error in onError handler", e as any);
            }
        }
    }

    /**
     * This function is called to animate a component.
     * @param components - The PixiJS component(s) to animate.
     * @param keyframes - The keyframes to animate the component(s) with.
     * @param options - Additional options for the animation, including duration, easing, and ticker.
     * @param priority - The priority of the ticker. @default UPDATE_PRIORITY.NORMAL
     * @returns The id of tickers.
     * @template T - The type of Pixi'VN component(s) being animated.
     */
    export let animate: <T extends CanvasBaseInterface<any>>(
        components: T | string | (string | T)[],
        keyframes: any,
        options?: any,
        priority?: UPDATE_PRIORITY,
    ) => string | undefined = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.init()");
        throw new PixiError(
            "not_implemented",
            "Method not implemented, you should initialize the Game: Game.init()",
        );
    };
}

export default GameUnifier;
