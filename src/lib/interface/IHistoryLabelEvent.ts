import { HistoryLabelEventEnum } from "../enums/LabelEventEnum";
import { LabelTagType } from "../types/LabelTagType";

/**
 * IHistoryLabelEvent is a interface that contains: 
 * - the type of event
 * - the label that occurred during the progression of the steps.
 */
export interface IHistoryLabelEvent {
    type: HistoryLabelEventEnum,
    label: LabelTagType,
    labelClassName: string,
}
