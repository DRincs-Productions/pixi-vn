import { StepHistoryDataType } from "../types/StepHistoryDataType";
import ExportedCanvas from "./export/ExportedCanvas";
import ExportedStorage from "./export/ExportedStorage";
import IOpenedLabel from "./IOpenedLabel";

/**
 * IHistoryStep is a interface that contains the information of a step in the history.
 */
export default interface IHistoryStep {
    /**
     * The browser path that occurred during the progression of the steps.
     */
    path: string,
    /**
     * The storage that occurred during the progression of the steps.
     */
    storage: ExportedStorage,
    /**
     * The sha1 of the step function.
     */
    stepSha1: StepHistoryDataType,
    /**
     * The index of the label that occurred during the progression of the steps.
     */
    labelIndex: number,
    /**
     * The canvas that occurred during the progression of the steps.
     */
    canvas: ExportedCanvas,
    /**
     * The opened labels that occurred during the progression of the steps.
     */
    openedLabels: IOpenedLabel[],
    /**
     * The index of the step in the history.
     */
    index: number,
}
