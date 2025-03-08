export { Assets, Rectangle } from "pixi.js";
export type {
    ContainerOptions,
    SpriteOptions,
    TextOptions,
    Texture,
    TextureSourceLike,
    Ticker as TickerValue,
    UPDATE_PRIORITY,
} from "pixi.js";
export * from "./canvas";
export { default as CanvasManagerStatic } from "./canvas/CanvasManagerStatic";
export * from "./classes";
export {
    CANVAS_APP_GAME_LAYER_ALIAS,
    filters,
    Pause,
    PIXIVN_VERSION,
    Repeat,
    SYSTEM_RESERVED_STORAGE_KEYS,
} from "./constants";
export * from "./decorators";
export * from "./interface";
export { default as NarrationManagerStatic } from "./managers/NarrationManagerStatic";
export { default as SoundManagerStatic } from "./managers/SoundManagerStatic";
export { default as StorageManagerStatic } from "./managers/StorageManagerStatic";
export * from "./types";
export * from "./types/ticker";
export * from "./utils";

import { Assets, Rectangle } from "pixi.js";
import * as canvasUtils from "./canvas";
import CanvasManagerStatic from "./canvas/CanvasManagerStatic";
import * as classes from "./classes";
import {
    CANVAS_APP_GAME_LAYER_ALIAS,
    filters,
    Pause,
    PIXIVN_VERSION,
    Repeat,
    SYSTEM_RESERVED_STORAGE_KEYS,
} from "./constants";
import * as decorators from "./decorators";
import * as pixivninterface from "./interface";
import NarrationManager from "./managers/NarrationManager";
import NarrationManagerStatic from "./managers/NarrationManagerStatic";
import SoundManager from "./managers/SoundManager";
import StorageManager from "./managers/StorageManager";
import * as functions from "./utils";
import { getGamePath } from "./utils/path-utility";

const getCurrentStepData: () => pixivninterface.HistoryStepData = () => {
    let currentStepData: pixivninterface.HistoryStepData = {
        path: getGamePath(),
        storage: storage.export(),
        canvas: canvasUtils.canvas.export(),
        sound: sound.removeOldSoundAndExport(),
        labelIndex: NarrationManagerStatic.currentLabelStepIndex || 0,
        openedLabels: functions.createExportableElement(NarrationManagerStatic._openedLabels),
    };
    return currentStepData;
};

const restoreFromHistoryStep: (
    restoredStep: pixivninterface.HistoryStepData,
    navigate: (path: string) => void
) => Promise<void> = async (restoredStep: pixivninterface.HistoryStepData, navigate: (path: string) => void) => {
    NarrationManagerStatic._originalStepData = restoredStep;
    NarrationManagerStatic._openedLabels = functions.createExportableElement(restoredStep.openedLabels);
    storage.import(functions.createExportableElement(restoredStep.storage));
    await canvasUtils.canvas.import(functions.createExportableElement(restoredStep.canvas));
    sound.import(functions.createExportableElement(restoredStep.sound), NarrationManagerStatic._lastStepIndex - 1);
    navigate(restoredStep.path);
};

const forceCompletionOfTicker = () => {
    CanvasManagerStatic._tickersToCompleteOnStepEnd.tikersIds.forEach(({ id }) => {
        canvasUtils.canvas.forceCompletionOfTicker(id);
    });
    CanvasManagerStatic._tickersToCompleteOnStepEnd.stepAlias.forEach(({ alias, id }) => {
        canvasUtils.canvas.forceCompletionOfTicker(id, alias);
    });
    CanvasManagerStatic._tickersToCompleteOnStepEnd = { tikersIds: [], stepAlias: [] };
};

const narration: pixivninterface.NarrationManagerInterface = new NarrationManager(
    getCurrentStepData,
    restoreFromHistoryStep,
    forceCompletionOfTicker
);
const sound = new SoundManager(narration);
const storage: pixivninterface.StorageManagerInterface = new StorageManager(narration);

export { narration, sound, storage };

const pixivn = {
    Assets,
    Rectangle,
    ...classes,
    canvasUtils,
    CANVAS_APP_GAME_LAYER_ALIAS,
    filters,
    Pause,
    Repeat,
    SYSTEM_RESERVED_STORAGE_KEYS,
    PIXIVN_VERSION,
    ...decorators,
    ...functions,
    ...pixivninterface,
    narration,
    sound,
    storage,
    canvas: canvasUtils.canvas,
};
export default pixivn;
