import { CharacterInterface, GameStepState, HistoryInfo } from "@drincs/pixi-vn";
import { StepLabelPropsType, StepLabelResultType, StepLabelType } from "../narration/types/StepLabelType";
import { StorageElementType } from "../storage/types/StorageElementType";
import { logger } from "../utils/log-utility";

export default class GameUnifier {
    static init(options: {
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
        restoreGameStepState: (state: GameStepState, navigate: (path: string) => void | Promise<void>) => Promise<void>;
        /**
         * This function returns the number of opened labels.
         *
         * If your game engine does not have a narration system, you can return 0.
         */
        getOpenedLabels: () => number;
        /**
         * This function is called after the narration.continue() method is executed.
         * It can be used to force the completion of the ticker in the game engine.
         */
        onPreContinue?: () => Promise<void> | void;
        /**
         * This function is called to process the pending navigation requests (continue/back).
         */
        processNavigationRequests: (navigationRequestsCount: number) => {
            newValue: number;
            result: Promise<StepLabelResultType>;
        };
        /**
         * This function returns the value of a variable.
         * @param key The key of the variable.
         * @returns The value of the variable.
         */
        getVariable: <T extends StorageElementType>(key: string) => T | undefined;
        /**
         * This function sets the value of a variable.
         * @param key The key of the variable.
         * @param value The value of the variable.
         */
        setVariable: (key: string, value: StorageElementType) => void;
        /**
         * This function removes a variable.
         * @param key The key of the variable.
         */
        removeVariable: (key: string) => void;
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
            }
        ): void;
        /**
         * This function returns the character by its id.
         * @param id The id of the character.
         * @returns The character or undefined if it does not exist.
         */
        getCharacter: (id: string) => CharacterInterface | undefined;
    }) {
        options.navigate && (GameUnifier._navigate = options.navigate);
        GameUnifier._getStepCounter = options.getStepCounter;
        GameUnifier._setStepCounter = options.setStepCounter;
        GameUnifier._getCurrentGameStepState = options.getCurrentGameStepState;
        GameUnifier._restoreGameStepState = options.restoreGameStepState;
        GameUnifier._getOpenedLabels = options.getOpenedLabels;
        options.onPreContinue && (GameUnifier._onPreContinue = options.onPreContinue);
        GameUnifier._processNavigationRequests = options.processNavigationRequests;
        GameUnifier._getVariable = options.getVariable;
        GameUnifier._setVariable = options.setVariable;
        GameUnifier._removeVariable = options.removeVariable;
        GameUnifier._getFlag = options.getFlag;
        GameUnifier._setFlag = options.setFlag;
        options.onLabelClosing && (GameUnifier._onLabelClosing = options.onLabelClosing);
        GameUnifier._addHistoryItem = options.addHistoryItem;
        GameUnifier._getCharacter = options.getCharacter;
    }
    private static _navigate: (path: string) => void | Promise<void> = () => {
        logger.warn(
            "Navigate function not initialized. You should add the navigate function in the Game.init() method."
        );
    };
    /**
     * The navigate function.
     * @param path The path to navigate to.
     * @returns
     */
    static get navigate() {
        return GameUnifier._navigate;
    }
    static set navigate(value: (path: string) => void | Promise<void>) {
        GameUnifier._navigate = value;
    }
    private static _getStepCounter: () => number = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.init()");
        throw new Error("Method not implemented, you should initialize the Game: Game.init()");
    };
    private static _setStepCounter: (value: number) => void = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.init()");
        throw new Error("Method not implemented, you should initialize the Game: Game.init()");
    };
    /**
     * Returns the current step counter. This counter corresponds to the total number of steps that have been executed so far.
     */
    static get stepCounter() {
        return GameUnifier._getStepCounter();
    }
    /**
     * Returns the current state of the game step.
     */
    static set stepCounter(value: number) {
        GameUnifier._setStepCounter(value);
    }
    private static _getCurrentGameStepState: () => GameStepState = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.init()");
        throw new Error("Method not implemented, you should initialize the Game: Game.init()");
    };
    /**
     * Returns the current state of the game step.
     */
    static get currentGameStepState() {
        return GameUnifier._getCurrentGameStepState();
    }
    private static _restoreGameStepState: (
        state: GameStepState,
        navigate: (path: string) => void | Promise<void>
    ) => Promise<void> = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.init()");
        throw new Error("Method not implemented, you should initialize the Game: Game.init()");
    };
    /**
     * Restores the game step state.
     * @param state The state to restore.
     * @param navigate The function to navigate to the restored path.
     */
    static get restoreGameStepState() {
        return GameUnifier._restoreGameStepState;
    }
    private static _getOpenedLabels: () => number = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.init()");
        throw new Error("Method not implemented, you should initialize the Game: Game.init()");
    };
    /**
     * Returns the number of opened labels.
     */
    static get openedLabels() {
        return GameUnifier._getOpenedLabels();
    }
    private static _onPreContinue: () => Promise<void> | void = () => {};
    /**
     * Callback hook intended to run immediately before a narration "continue" operation.
     * Game engines can use this to force completion of their ticker or pending updates,
     * if supported by the underlying narration manager.
     */
    static get onPreContinue() {
        return GameUnifier._onPreContinue;
    }
    /**
     * Number of pending navigation requests (continue/back).
     * Positive values indicate pending continue requests,
     * negative values indicate pending back requests.
     */
    private static navigationRequestsCount: number = 0;
    /**
     * Promise-based lock to ensure only one processNavigationRequests executes at a time.
     * This prevents race conditions in the read-modify-write operation.
     */
    private static processNavigationLock: Promise<void> = Promise.resolve();
    /**
     * This function is called to get the number of pending continue requests.
     * If it is > 0, after the stepsRunning is 0, the next step will be executed.
     */
    static get continueRequestsCount() {
        return GameUnifier.navigationRequestsCount;
    }
    /**
     * This function is called to increase the number of pending continue requests.
     * Note: While the increment operation itself is atomic, the overall navigation
     * processing uses a lock in processNavigationRequests to ensure atomicity of
     * read-modify-write operations across async boundaries.
     * @param amount The number of steps to increase. Default is 1.
     */
    static increaseContinueRequest(amount: number = 1) {
        GameUnifier.navigationRequestsCount += amount;
    }
    /**
     * This function is called to get the number of pending back requests.
     * If it is > 0, after the stepsRunning is 0, the previous step will be executed.
     */
    static get backRequestsCount() {
        return -1 * GameUnifier.navigationRequestsCount;
    }
    /**
     * This function is called to increase the number of pending back requests.
     * Note: While the decrement operation itself is atomic, the overall navigation
     * processing uses a lock in processNavigationRequests to ensure atomicity of
     * read-modify-write operations across async boundaries.
     * @param amount The number of steps to increase. Default is 1.
     */
    static increaseBackRequest(amount: number = 1) {
        GameUnifier.navigationRequestsCount -= amount;
    }
    private static _processNavigationRequests: (navigationRequestsCount: number) => {
        newValue: number;
        result: Promise<StepLabelResultType>;
    } = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.init()");
        throw new Error("Method not implemented, you should initialize the Game: Game.init()");
    };
    /**
     * This function processes the pending navigation requests (continue/back).
     * Uses a promise-based lock to ensure atomic read-modify-write operations
     * and prevent race conditions when called from multiple async contexts.
     */
    static async processNavigationRequests() {
        // Create a new lock for this execution and chain it to the previous one
        // This ensures that concurrent calls will properly queue
        let releaseLock!: () => void;
        const previousLock = GameUnifier.processNavigationLock;
        GameUnifier.processNavigationLock = previousLock.then(() => new Promise<void>(resolve => {
            releaseLock = resolve;
        }));
        
        // Wait for the previous operation to complete
        await previousLock;
        
        let result: Promise<StepLabelResultType>;
        try {
            // Perform the atomic read-modify-write operation
            const processResult = GameUnifier._processNavigationRequests(GameUnifier.navigationRequestsCount);
            GameUnifier.navigationRequestsCount = processResult.newValue;
            result = processResult.result;
        } finally {
            // Release the lock immediately after the synchronous part
            // This must happen before awaiting result to prevent deadlocks
            releaseLock();
        }
        
        // Return the async result (lock is already released)
        return await result;
    }
    private static _getVariable: <T extends StorageElementType>(key: string) => T | undefined = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.init()");
        throw new Error("Method not implemented, you should initialize the Game: Game.init()");
    };
    /**
     * This function returns the value of a variable.
     * @param key The key of the variable.
     * @returns The value of the variable.
     */
    static get getVariable() {
        return GameUnifier._getVariable;
    }
    private static _setVariable: (key: string, value: StorageElementType) => void = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.init()");
        throw new Error("Method not implemented, you should initialize the Game: Game.init()");
    };
    /**
     * This function sets the value of a variable.
     * @param key The key of the variable.
     * @param value The value of the variable.
     */
    static get setVariable() {
        return GameUnifier._setVariable;
    }
    private static _removeVariable: (key: string) => void = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.init()");
        throw new Error("Method not implemented, you should initialize the Game: Game.init()");
    };
    /**
     * This function removes a variable.
     * @param key The key of the variable.
     */
    static get removeVariable() {
        return GameUnifier._removeVariable;
    }
    private static _getFlag: (name: string) => boolean = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.init()");
        throw new Error("Method not implemented, you should initialize the Game: Game.init()");
    };
    /**
     * This function returns the value of a flag.
     * @param name The name of the flag.
     */
    static get getFlag() {
        return GameUnifier._getFlag;
    }
    private static _setFlag: (name: string, value: boolean) => void = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.init()");
        throw new Error("Method not implemented, you should initialize the Game: Game.init()");
    };
    /**
     * This function sets the value of a flag.
     * @param name The name of the flag.
     * @param value The value of the flag.
     */
    static get setFlag() {
        return GameUnifier._setFlag;
    }
    private static _onLabelClosing: (openedLabelsNumber: number) => void = () => {};
    /**
     * This function is called after the narration.continue() method is executed
     * It can be used to clear old temporary variables.
     * @param openedLabelsNumber The number of opened labels.
     */
    static get onLabelClosing() {
        return GameUnifier._onLabelClosing;
    }
    private static _addHistoryItem: (
        historyInfo?: HistoryInfo,
        opstions?: {
            /**
             * If true, the step will not be added to the history if the current step is the same as the last step.
             */
            ignoreSameStep?: boolean;
        }
    ) => void = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.init()");
        throw new Error("Method not implemented, you should initialize the Game: Game.init()");
    };
    /**
     * Add a history step to the history.
     * @param historyInfo The history information.
     * @param opstions Options to add the step.
     */
    static get addHistoryItem() {
        return GameUnifier._addHistoryItem;
    }
    /**
     * Count of currently executing steps.
     * If a step triggers a narration.continue(), this number is greater than 1.
     */
    static runningStepsCount: number = 0;
    private static _getCharacter: (id: string) => CharacterInterface | undefined = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.init()");
        throw new Error("Method not implemented.");
    };
    /**
     * This function returns the character by its id.
     * @param id The id of the character.
     * @returns The character or undefined if it does not exist.
     */
    static get getCharacter() {
        return GameUnifier._getCharacter;
    }

    static onEnd?: StepLabelType;
    static onError?: (type: "step", error: any, props: StepLabelPropsType) => void;
}
