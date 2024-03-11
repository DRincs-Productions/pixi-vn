import { IHistoryLabelEvent } from "../IHistoryLabelEvent"
import { IHistoryStep } from "../IHistoryStep"
import { IOpenedLabel } from "../IOpenedLabel"

/**
 * Interface exported step data
 */
export interface ExportedStep {
    stepsHistory: (IHistoryLabelEvent | IHistoryStep)[]
    openedLabels: IOpenedLabel[]
}
