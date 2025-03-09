import { HistoryStepData } from "./interface";
import { getGamePath } from "./utils/path-utility";

export default class GameUnifier {
    static getLastStepIndex: () => number = () => {
        throw new Error("Method not implemented.");
    };
    static getCurrentStepData: () => HistoryStepData = () => {
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
    static restoreFromHistoryStep: (restoredStep: HistoryStepData, navigate: (path: string) => void) => Promise<void> =
        async (restoredStep: HistoryStepData, navigate: (path: string) => void) => {
            NarrationManagerStatic._originalStepData = restoredStep;
            NarrationManagerStatic._openedLabels = functions.createExportableElement(restoredStep.openedLabels);
            storage.import(functions.createExportableElement(restoredStep.storage));
            await canvasUtils.canvas.import(functions.createExportableElement(restoredStep.canvas));
            sound.import(
                functions.createExportableElement(restoredStep.sound),
                NarrationManagerStatic._lastStepIndex - 1
            );
            navigate(restoredStep.path);
        };
    static forceCompletionOfTicker: () => void = () => {
        CanvasManagerStatic._tickersToCompleteOnStepEnd.tikersIds.forEach(({ id }) => {
            canvasUtils.canvas.forceCompletionOfTicker(id);
        });
        CanvasManagerStatic._tickersToCompleteOnStepEnd.stepAlias.forEach(({ alias, id }) => {
            canvasUtils.canvas.forceCompletionOfTicker(id, alias);
        });
        CanvasManagerStatic._tickersToCompleteOnStepEnd = { tikersIds: [], stepAlias: [] };
    };
}
