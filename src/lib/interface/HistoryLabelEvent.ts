import { HistoryLabelEventEnum } from "../enums/LabelEventEnum";
import { LabelHistoryDataType } from "../types/LabelHistoryDataType";

/**
 * HistoryLabel is a interface that contains: 
 * - the type of event
 * - the label that occurred during the progression of the steps.
 */
export interface HistoryLabelEvent {
    type: HistoryLabelEventEnum,
    label: LabelHistoryDataType,
    labelClassName: string,
}
