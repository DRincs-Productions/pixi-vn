import { Label } from "../classes/Label";
import { HistoryLabelEventEnum } from "../enums/LabelEventEnum";

/**
 * HistoryLabel is a interface that contains: 
 * - the type of event
 * - the label that occurred during the progression of the steps.
 */
export interface HistoryLabelEvent {
    type: HistoryLabelEventEnum,
    label: Label,
}
