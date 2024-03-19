import { StepHistoryDataType } from "../types/StepHistoryDataType";
import ExportedCanvas from "./export/ExportedCanvas";
import ExportedStorage from "./export/ExportedStorage";
import IOpenedLabel from "./IOpenedLabel";

/**
 * IHistoryStep is a interface that contains:
 * - the browser path that occurred during the progression of the steps.
 * - the storage that occurred during the progression of the steps.
 * - the step data.
 * - the canvas that occurred during the progression of the steps.
 */
export default interface IHistoryStep {
    path: string,
    storage: ExportedStorage,
    stepSha1: StepHistoryDataType,
    stepIndex: number,
    canvas: ExportedCanvas,
    openedLabels: IOpenedLabel[],
}
