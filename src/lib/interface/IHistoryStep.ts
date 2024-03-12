import { StepHistoryDataType } from "../types/StepHistoryDataType";
import { IOpenedLabel } from "./IOpenedLabel";
import { ExportedCanvas } from "./export/ExportedCanvas";
import { ExportedStorage } from "./export/ExportedStorage";

/**
 * IHistoryStep is a interface that contains:
 * - the browser path that occurred during the progression of the steps.
 * - the storage that occurred during the progression of the steps.
 * - the step data.
 * - the canvas that occurred during the progression of the steps.
 */
export interface IHistoryStep {
    path: string,
    storage: ExportedStorage,
    step: StepHistoryDataType,
    stepIndex: number,
    canvas: ExportedCanvas,
    openedLabels: IOpenedLabel[],
}
