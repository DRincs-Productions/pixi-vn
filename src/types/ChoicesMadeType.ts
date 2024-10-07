import { LabelIdType } from "./LabelIdType";

type ChoicesMadeType = {
    /**
     * The label id of the current step.
     */
    labelId: LabelIdType,
    /**
     * The index of the step in the history.
     */
    stepIndex: number,
    /**
     * The index of the choice made by the player.
     */
    choiceIndex: number,
    /**
     * The sha1 of the step function.
     */
    stepSha1: string,
    /**
     * The number of times the player made a choice for this step.
     */
    madeTimes: number,
}
export default ChoicesMadeType;
