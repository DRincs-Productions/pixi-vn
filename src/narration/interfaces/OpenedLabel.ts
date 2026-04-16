import type { LabelIdType } from "../types/LabelIdType";

export default interface OpenedLabel {
    label: LabelIdType;
    currentStepIndex: number;
}
