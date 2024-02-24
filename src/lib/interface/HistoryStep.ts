import { ExportedStorage } from "../classes/ExportedStorage";
import { StepHistoryDataType } from "../types/StepHistoryDataType";

/**
 * HistoryStep is a interface that contains:
 * - the browser path that occurred during the progression of the steps.
 * - the storage that occurred during the progression of the steps.
 * - the step data.
 */
export interface HistoryStep {
    path: string,
    storage: ExportedStorage,
    step: StepHistoryDataType,
}
