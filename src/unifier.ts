import { ExportedCanvas } from "./canvas";
import { ExportedSounds, ExportedStorage } from "./interfaces";
import { ExportedStep, HistoryStepData, OpenedLabel } from "./narration";
import { StorageElementType } from "./types";
import { logger } from "./utils/log-utility";
import { getGamePath } from "./utils/path-utility";

export default class GameUnifier {
    static getLastStepIndex: () => number = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.initialize()");
        throw new Error("Method not implemented.");
    };
    static getCurrentLabelStepIndex: () => number = () => {
        logger.error("Method not implemented, you should initialize the Game: Game.initialize()");
        throw new Error("Method not implemented.");
    };
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
    static getCurrentStepData: () => HistoryStepData = () => {
        let currentStepData: HistoryStepData = {
            path: getGamePath(),
            storage: GameUnifier.exportStorageData(),
            canvas: GameUnifier.exportCanvasData(),
            sound: GameUnifier.exportSoundData(),
            labelIndex: GameUnifier.getCurrentLabelStepIndex(),
            openedLabels: GameUnifier.getOpenedLabels(),
        };
        return currentStepData;
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
