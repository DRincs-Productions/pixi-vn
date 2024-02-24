import { StepHistoryDataType } from "../types/StepHistoryDataType";
import { ExportedStorage } from "./ExportedStorage";

/**
 * HistoryStep is a interface that contains:
 * - the browser path that occurred during the progression of the steps.
 * - the storage that occurred during the progression of the steps.
 * - the step data.
 */
export interface HistoryStep {
    path: string,
    storage: ExportedStorage,
    currentStep: StepHistoryDataType,
}
