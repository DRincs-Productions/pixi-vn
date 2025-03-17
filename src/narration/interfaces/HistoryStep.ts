import { GameStepState } from "@drincs/pixi-vn";
import deepDiff from "deep-diff";
import { Difference } from "microdiff";
import { StorageElementType } from "../..";
import { IStoratedChoiceMenuOption } from "../classes/ChoiceMenuOption";
import Dialogue from "../classes/Dialogue";
import { LabelIdType } from "../types/LabelIdType";

/**
 * AdditionalShaSpetsEnum is a enum that contains the additional sha1 values that can be inserted in the step sha1.
 */
export enum AdditionalShaSpetsEnum {
    /**
     * If the creation of a step function sha was not successful, this value will be inserted.
     */
    ERROR = "error",
    /**
     * If this story node was not added in the narrative but by the developer, this value will be inserted.
     */
    DEVELOPER = "dev",
}

export default interface HistoryStep<T extends Dialogue = Dialogue> {
    /**
     * The difference between the previous step and the current step.
     */
    diff?: deepDiff.Diff<GameStepState, GameStepState>[] | Difference[];
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
