import CanvasManager from "../canvas/CanvasManager";
import CanvasManagerStatic from "../canvas/CanvasManagerStatic";
import { createExportableElement } from "../functions";
import { getGamePath } from "../functions/path-utility";
import { HistoryStepData, NarrationManagerInterface, StorageManagerInterface } from "../interface";
import NarrationManager from "./NarrationManager";
import NarrationManagerStatic from "./NarrationManagerStatic";
import SoundManager from "./SoundManager";
import StorageManager from "./StorageManager";

export {
    /**
     *  @deprecated use "import { narration } from '@drincs/pixi-vn';"
     */
    default as GameWindowManager,
} from "../canvas/CanvasManager";
export {
    /**
     *  @deprecated use "import { canvas } from '@drincs/pixi-vn';"
     */
    default as GameStepManager,
} from "./NarrationManager";
export {
    /**
     *  @deprecated use "import { storage } from '@drincs/pixi-vn';"
     */
    default as GameStorageManager,
} from "./StorageManager";

const getCurrentStepData: () => HistoryStepData = () => {
    let currentStepData: HistoryStepData = {
        path: getGamePath(),
        storage: storage.export(),
        canvas: canvas.export(),
        sound: sound.removeOldSoundAndExport(),
        labelIndex: NarrationManagerStatic.currentLabelStepIndex || 0,
        openedLabels: createExportableElement(NarrationManagerStatic._openedLabels),
    };
    return currentStepData;
};

const restoreFromHistoryStep: (
    restoredStep: HistoryStepData,
    navigate: (path: string) => void
) => Promise<void> = async (restoredStep: HistoryStepData, navigate: (path: string) => void) => {
    NarrationManagerStatic._originalStepData = restoredStep;
    NarrationManagerStatic._openedLabels = createExportableElement(restoredStep.openedLabels);
    storage.import(createExportableElement(restoredStep.storage));
    await canvas.import(createExportableElement(restoredStep.canvas));
    sound.import(createExportableElement(restoredStep.sound), NarrationManagerStatic._lastStepIndex - 1);
    navigate(restoredStep.path);
};

const forceCompletionOfTicker = () => {
    CanvasManagerStatic._tickersToCompleteOnStepEnd.tikersIds.forEach(({ id }) => {
        canvas.forceCompletionOfTicker(id);
    });
    CanvasManagerStatic._tickersToCompleteOnStepEnd.stepAlias.forEach(({ alias, id }) => {
        canvas.forceCompletionOfTicker(id, alias);
    });
    CanvasManagerStatic._tickersToCompleteOnStepEnd = { tikersIds: [], stepAlias: [] };
};

const narration: NarrationManagerInterface = new NarrationManager(
    getCurrentStepData,
    restoreFromHistoryStep,
    forceCompletionOfTicker
);
const sound = new SoundManager(narration);
const storage: StorageManagerInterface = new StorageManager(narration);
const canvas = new CanvasManager();

export { canvas, narration, sound, storage };
