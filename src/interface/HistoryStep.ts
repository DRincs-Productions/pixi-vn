import deepDiff from "deep-diff";
import { Dialogue } from "../classes";
import { IStoratedChoiceMenuOption } from "../classes/ChoiceMenuOption";
import { StorageElementType } from "../types";
import { LabelIdType } from "../types/LabelIdType";
import ExportedCanvas from "./export/ExportedCanvas";
import ExportedSounds from "./export/ExportedSounds";
import ExportedStorage from "./export/ExportedStorage";
import OpenedLabel from "./OpenedLabel";

/**
 * IHistoryStep is a interface that contains the information of a step in the history.
 */
export interface HistoryStepData {
    /**
     * The browser path that occurred during the progression of the steps.
     */
    path: string;
    /**
     * The storage that occurred during the progression of the steps.
     */
    storage: ExportedStorage;
    /**
     * The index of the label that occurred during the progression of the steps.
     */
    labelIndex: number;
    /**
     * The canvas that occurred during the progression of the steps.
     */
    canvas: ExportedCanvas;
    /**
     * The opened labels that occurred during the progression of the steps.
     */
    openedLabels: OpenedLabel[];
    /**
     * The sound data that occurred during the progression of the steps.
     */
    sound: ExportedSounds;
}

export default interface HistoryStep<T extends Dialogue = Dialogue> {
    /**
     * The difference between the previous step and the current step.
     */
    diff?: deepDiff.Diff<HistoryStepData, HistoryStepData>[];
    /**
     * The label id of the current step.
     */
    currentLabel?: LabelIdType;
    /**
     * The sha1 of the step function.
     */
    stepSha1: string;
    /**
     * The index of the step in the history.
     */
    index: number;
    /**
     * The data of the step of the label.
     */
    labelStepIndex: number | null;
    /**
     * Dialogue to be shown in the game
     */
    dialoge?: T;
    /**
     * List of choices asked of the player
     */
    choices?: IStoratedChoiceMenuOption[];
    /**
     * List of choices already made by the player
     */
    alreadyMadeChoices?: number[];
    /**
     * The input value of the player
     */
    inputValue?: StorageElementType;
    /**
     * The choice made by the player
     */
    choiceIndexMade?: number;
}
