import deepDiff from "deep-diff";
import { DialogueModelBase } from "../classes";
import { IStoratedChoiceMenuOptionLabel } from "../classes/ChoiceMenuOptionLabel";
import { LabelIdType } from "../types/LabelIdType";
import { StepHistoryDataType } from "../types/StepHistoryDataType";
import ExportedCanvas from "./export/ExportedCanvas";
import ExportedStorage from "./export/ExportedStorage";
import IOpenedLabel from "./IOpenedLabel";

/**
 * IHistoryStep is a interface that contains the information of a step in the history.
 */
export interface IHistoryStepData {
    /**
     * The browser path that occurred during the progression of the steps.
     */
    path: string,
    /**
     * The storage that occurred during the progression of the steps.
     */
    storage: ExportedStorage,
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
}

export default interface IHistoryStep<T extends DialogueModelBase = DialogueModelBase> {
    /**
     * The difference between the previous step and the current step.
     */
    diff: deepDiff.Diff<IHistoryStepData, IHistoryStepData>[]
    /**
     * The label id of the current step.
     */
    currentLabel?: LabelIdType
    /**
     * The sha1 of the step function.
     */
    stepSha1: StepHistoryDataType,
    /**
     * The index of the step in the history.
     */
    index: number,
    /**
     * Dialogue to be shown in the game
     */
    dialoge?: T
    /**
     * List of choices asked of the player
     */
    choices?: IStoratedChoiceMenuOptionLabel[]
}