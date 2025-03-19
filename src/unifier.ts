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
    }) {
        GameUnifier._getStepCounter = options.getStepCounter;
        GameUnifier._getCurrentGameStepState = options.getCurrentGameStepState;
        options.ignoreAddChangeHistory && (GameUnifier._ignoreAddChangeHistory = options.ignoreAddChangeHistory);
        GameUnifier._restoreGameStepState = options.restoreGameStepState;
        GameUnifier._getOpenedLabels = options.getOpenedLabels;
        options.onGoNextEnd && (GameUnifier._onGoNextEnd = options.onGoNextEnd);
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
    static _onGoNextEnd: () => Promise<void> = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.initialize()");
        throw new Error("Method not implemented.");
    };
    /**
     * This function is called after the narration.goNext() method is executed.
     * It can be used to force the completion of the ticker in the game engine.
     */
    static get onGoNextEnd() {
        return GameUnifier._onGoNextEnd;
    }

    static getVariable: <T extends StorageElementType>(key: string) => T | undefined = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.initialize()");
        throw new Error("Method not implemented.");
    };
    static setVariable: (key: string, value: StorageElementType) => void = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.initialize()");
        throw new Error("Method not implemented.");
    };
    static removeVariable: (key: string) => void = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.initialize()");
        throw new Error("Method not implemented.");
    };
    static getFlag: (name: string) => boolean = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.initialize()");
        throw new Error("Method not implemented.");
    };
    static setFlag: (name: string, value: boolean) => void = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.initialize()");
        throw new Error("Method not implemented.");
    };
    static clearOldTempVariables: (openedLabelsNumber: number) => void = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.initialize()");
        throw new Error("Method not implemented.");
    };
}
