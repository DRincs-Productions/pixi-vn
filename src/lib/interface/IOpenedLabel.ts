import { HistoryLabelEventEnum } from "../enums/LabelEventEnum";
import { LabelTagType } from "../types/LabelTagType";

interface IOpenedLabelBase {
    label: LabelTagType,
    currentStepIndex: number,
}


export type IOpenedLabel = IOpenedLabelBase | HistoryLabelEventEnum.OpenByJump