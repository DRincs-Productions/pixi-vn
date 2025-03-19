import { GameStepState } from "@drincs/pixi-vn";
import { ExportedCanvas } from "./canvas";
import { ExportedStep, OpenedLabel } from "./narration";
import { ExportedSounds } from "./sound";
import { ExportedStorage, StorageElementType } from "./storage";
import { logger } from "./utils/log-utility";

export default class GameUnifier {
    static initialize(options: {
        /**
         * This function returns the current step counter. This counter corresponds to the total number of steps that have been executed so far.
         */
        getStepCounter: () => number;
        /**
         * This function returns the current state of the game step.
         */
        getCurrentGameStepState: () => GameStepState;
    }) {
        GameUnifier._getStepCounter = options.getStepCounter;
        GameUnifier._getCurrentGameStepState = options.getCurrentGameStepState;
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
    static getOpenedLabels: () => OpenedLabel[] = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.initialize()");
        throw new Error("Method not implemented.");
    };
    static exportStorageData: () => ExportedStorage = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.initialize()");
        throw new Error("Method not implemented.");
    };
    static exportCanvasData: () => ExportedCanvas = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.initialize()");
        throw new Error("Method not implemented.");
    };
    static exportSoundData: () => ExportedSounds = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.initialize()");
        throw new Error("Method not implemented.");
    };
    static exportNarrationData: () => ExportedStep = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.initialize()");
        throw new Error("Method not implemented.");
    };
    static importStorageData: (data: ExportedStorage) => void = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.initialize()");
        throw new Error("Method not implemented.");
    };
    static importCanvasData: (data: ExportedCanvas) => Promise<void> = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.initialize()");
        throw new Error("Method not implemented.");
    };
    static importSoundData: (data: ExportedSounds) => void = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.initialize()");
        throw new Error("Method not implemented.");
    };
    static importNarrationData: (data: ExportedStep) => void = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.initialize()");
        throw new Error("Method not implemented.");
    };
    static forceCompletionOfTicker: () => void = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.initialize()");
        throw new Error("Method not implemented.");
    };
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
