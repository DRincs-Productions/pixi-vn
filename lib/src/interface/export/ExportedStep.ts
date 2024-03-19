import IHistoryStep from "../IHistoryStep"
import IOpenedLabel from "../IOpenedLabel"

/**
 * Interface exported step data
 */
export default interface ExportedStep {
    stepsHistory: IHistoryStep[]
    openedLabels: IOpenedLabel[]
}
