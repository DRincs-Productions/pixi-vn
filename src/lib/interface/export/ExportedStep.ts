import { IHistoryStep } from "../IHistoryStep"
import { IOpenedLabel } from "../IOpenedLabel"

/**
 * Interface exported step data
 */
export interface ExportedStep {
    stepsHistory: IHistoryStep[]
    openedLabels: IOpenedLabel[]
}
