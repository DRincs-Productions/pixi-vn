import {
    ExportedCanvas,
    ExportedSounds,
    ExportedStep,
    ExportedStorage,
    HistoryStepData,
    OpenedLabel,
} from "./interface";
import { StorageElementType } from "./types";
import { getGamePath } from "./utils/path-utility";

export default class GameUnifier {
    static getLastStepIndex: () => number = () => {
        throw new Error("Method not implemented.");
    };
    static getCurrentLabelStepIndex: () => number = () => {
        throw new Error("Method not implemented.");
    };
    static getOpenedLabels: () => OpenedLabel[] = () => {
        throw new Error("Method not implemented.");
    };
    static exportStorageData: () => ExportedStorage = () => {
        throw new Error("Method not implemented.");
    };
    static exportCanvasData: () => ExportedCanvas = () => {
        throw new Error("Method not implemented.");
    };
    static exportSoundData: () => ExportedSounds = () => {
        throw new Error("Method not implemented.");
    };
    static exportNarrationData: () => ExportedStep = () => {
        throw new Error("Method not implemented.");
    };
    static importStorageData: (data: ExportedStorage) => void = () => {
        throw new Error("Method not implemented.");
    };
    static importCanvasData: (data: ExportedCanvas) => Promise<void> = () => {
        throw new Error("Method not implemented.");
    };
    static importSoundData: (data: ExportedSounds) => void = () => {
        throw new Error("Method not implemented.");
    };
    static importNarrationData: (data: ExportedStep) => void = () => {
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
        throw new Error("Method not implemented.");
    };
    static getVariable: <T extends StorageElementType>(key: string) => T | undefined = () => {
        throw new Error("Method not implemented.");
    };
    static setVariable: (key: string, value: StorageElementType) => void = () => {
        throw new Error("Method not implemented.");
    };
    static removeVariable: (key: string) => void = () => {
        throw new Error("Method not implemented.");
    };
    static getFlag: (name: string) => boolean = () => {
        throw new Error("Method not implemented.");
    };
    static setFlag: (name: string, value: boolean) => void = () => {
        throw new Error("Method not implemented.");
    };
    static clearOldTempVariables: (openedLabelsNumber: number) => void = () => {
        throw new Error("Method not implemented.");
    };
}
