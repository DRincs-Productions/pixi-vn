import { GameStepState } from "@drincs/pixi-vn";
import { StorageElementType } from "./storage";
import { logger } from "./utils/log-utility";

export default class GameUnifier {
    static initialize(options: {
        /**
         * This function returns the current step counter. This counter corresponds to the total number of steps that have been executed so far.
         *
         * If your game engine does not have a history of steps, you can return 0.
         */
        getStepCounter: () => number;
        /**
         * This function returns the current state of the game step.
         *
         * If your game engine does not have a history of steps, you can return an empty object.
         */
        getCurrentGameStepState: () => GameStepState;
        /**
         * This function is called to determine if the change history should be added to the game state.
         * @param originalState The original state of the game step.
         * @param newState The new state of the game step.
         * @default () => false
         */
        ignoreAddChangeHistory?: (originalState: GameStepState, newState: GameStepState) => boolean;
        /**
         * This function restores the game step state.
         *
         * If your game engine does not have a history of steps, you can return a resolved promise.
         *
         * @param state The state to restore.
         * @param navigate The function to navigate to the restored path.
         */
        restoreGameStepState: (state: GameStepState, navigate: (path: string) => void) => Promise<void>;
        /**
         * This function returns the number of opened labels.
         *
         * If your game engine does not have a narration system, you can return 0.
         */
        getOpenedLabels: () => number;
        /**
         * This function is called after the narration.goNext() method is executed.
         * It can be used to force the completion of the ticker in the game engine.
         */
        onGoNextEnd?: () => Promise<void>;
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
         * This function is called after the narration.goNext() method is executed.
         *
         * It can be used to clear old temporary variables.
         *
         * @param openedLabelsNumber The number of opened labels.
         */
        onLabelClosing?: (openedLabelsNumber: number) => void;
    }) {
        GameUnifier._getStepCounter = options.getStepCounter;
        GameUnifier._getCurrentGameStepState = options.getCurrentGameStepState;
        options.ignoreAddChangeHistory && (GameUnifier._ignoreAddChangeHistory = options.ignoreAddChangeHistory);
        GameUnifier._restoreGameStepState = options.restoreGameStepState;
        GameUnifier._getOpenedLabels = options.getOpenedLabels;
        options.onGoNextEnd && (GameUnifier._onGoNextEnd = options.onGoNextEnd);
        GameUnifier._getVariable = options.getVariable;
        GameUnifier._setVariable = options.setVariable;
        GameUnifier._removeVariable = options.removeVariable;
        GameUnifier._getFlag = options.getFlag;
        GameUnifier._setFlag = options.setFlag;
        options.onLabelClosing && (GameUnifier._onLabelClosing = options.onLabelClosing);
    }
    private static _getStepCounter: () => number = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.initialize()");
        throw new Error("Method not implemented.");
    };
    /**
     * Returns the current step counter. This counter corresponds to the total number of steps that have been executed so far.
     */
    static get stepCounter() {
        return GameUnifier._getStepCounter();
    }
    private static _getCurrentGameStepState: () => GameStepState = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.initialize()");
        throw new Error("Method not implemented.");
    };
    /**
     * Returns the current state of the game step.
     */
    static get currentGameStepState() {
        return GameUnifier._getCurrentGameStepState();
    }
    private static _ignoreAddChangeHistory: (originalState: GameStepState, newState: GameStepState) => boolean = () => {
        return false;
    };
    /**
     * This function is called to determine if the change history should be added to the game state.
     * @param originalState The original state of the game step.
     * @param newState The new state of the game step.
     */
    static get ignoreAddChangeHistory() {
        return GameUnifier._ignoreAddChangeHistory;
    }
    private static _restoreGameStepState: (state: GameStepState, navigate: (path: string) => void) => Promise<void> =
        () => {
            logger.error("Method not implemented, you should initialize the Game: Game.initialize()");
            throw new Error("Method not implemented.");
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
        logger.error("Method not implemented, you should initialize the Game: Game.initialize()");
        throw new Error("Method not implemented.");
    };
    /**
     * Returns the number of opened labels.
     */
    static get openedLabels() {
        return GameUnifier._getOpenedLabels();
    }
    private static _onGoNextEnd: () => Promise<void> = async () => {};
    /**
     * This function is called after the narration.goNext() method is executed.
     * It can be used to force the completion of the ticker in the game engine.
     */
    static get onGoNextEnd() {
        return GameUnifier._onGoNextEnd;
    }
    private static _getVariable: <T extends StorageElementType>(key: string) => T | undefined = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.initialize()");
        throw new Error("Method not implemented.");
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
        logger.error("Method not implemented, you should initialize the Game: Game.initialize()");
        throw new Error("Method not implemented.");
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
        logger.error("Method not implemented, you should initialize the Game: Game.initialize()");
        throw new Error("Method not implemented.");
    };
    /**
     * This function removes a variable.
     * @param key The key of the variable.
     */
    static get removeVariable() {
        return GameUnifier._removeVariable;
    }
    private static _getFlag: (name: string) => boolean = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.initialize()");
        throw new Error("Method not implemented.");
    };
    /**
     * This function returns the value of a flag.
     * @param name The name of the flag.
     */
    static get getFlag() {
        return GameUnifier._getFlag;
    }
    private static _setFlag: (name: string, value: boolean) => void = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.initialize()");
        throw new Error("Method not implemented.");
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
     * This function is called after the narration.goNext() method is executed
     * It can be used to clear old temporary variables.
     * @param openedLabelsNumber The number of opened labels.
     */
    static get onLabelClosing() {
        return GameUnifier._onLabelClosing;
    }
}
