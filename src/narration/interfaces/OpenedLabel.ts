import type { LabelIdType } from "../types/LabelIdType";

export default interface OpenedLabel {
    label: LabelIdType;
    currentStepIndex: number;
    /**
     * The sha1 of the step at {@link currentStepIndex}, recorded when that step starts running.
     * When a save is loaded it is compared with the sha1 of the same step in the current version
     * of the label, to detect labels that were edited after the save was made.
     *
     * It is absent in saves made with older versions of Pixi'VN and while a label is closing
     * (after its last step).
     */
    stepSha1?: string;
}
