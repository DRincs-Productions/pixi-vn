import { HistoryLabelEventEnum } from "../enums/LabelEventEnum";
import { LabelHistoryDataType } from "../types/LabelHistoryDataType";

/**
 * IHistoryLabelEvent is a interface that contains: 
 * - the type of event
 * - the label that occurred during the progression of the steps.
 */
export interface IHistoryLabelEvent {
    type: HistoryLabelEventEnum,
    label: LabelHistoryDataType,
    labelClassName: string,
}
